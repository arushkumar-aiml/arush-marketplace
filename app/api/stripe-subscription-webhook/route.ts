import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "../../../lib/firebase-admin";

export const runtime = "nodejs";

type SubscriptionMetadata = {
    firebaseUid?: string;
    subscriptionPlan?: "client_pro" | "freelancer_pro";
};

async function syncSubscription(subscription: Stripe.Subscription) {
    const metadata = subscription.metadata as SubscriptionMetadata;
    const firebaseUid = metadata.firebaseUid;
    const subscriptionPlan = metadata.subscriptionPlan;

    if (!firebaseUid || !subscriptionPlan) {
        console.error("Stripe subscription webhook: missing Firebase subscription metadata", {
            subscriptionId: subscription.id,
            metadata: subscription.metadata,
        });
        return;
    }

    const renewalTimestamp = subscription.items.data[0]?.current_period_end;

    await adminDb.collection("users").doc(firebaseUid).update({
        subscriptionStatus: subscription.status,
        subscriptionPlan,
        stripeSubscriptionId: subscription.id,
        subscriptionRenewsAt: renewalTimestamp ? renewalTimestamp * 1000 : null,
    });
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
    const invoiceData = invoice as unknown as {
        subscription?: string | { id: string } | null;
        parent?: {
            subscription_details?: {
                subscription?: string | { id: string } | null;
            } | null;
        } | null;
    };

    const subscription =
        invoiceData.parent?.subscription_details?.subscription ?? invoiceData.subscription;

    if (typeof subscription === "string") {
        return subscription;
    }

    return subscription?.id || null;
}

export async function POST(req: NextRequest) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET;
    const signature = req.headers.get("stripe-signature");

    if (!secretKey || !webhookSecret) {
        console.error("Stripe subscription webhook: missing Stripe configuration");
        return NextResponse.json(
            { error: "Server misconfiguration: missing Stripe webhook configuration" },
            { status: 500 }
        );
    }

    if (!signature) {
        return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    const stripe = new Stripe(secretKey);
    const payload = await req.text();
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: unknown) {
        console.error("Stripe subscription webhook: signature verification failed", err);
        return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                await syncSubscription(event.data.object as Stripe.Subscription);
                break;

            case "invoice.payment_failed": {
                const subscriptionId = getInvoiceSubscriptionId(event.data.object as Stripe.Invoice);

                if (!subscriptionId) {
                    console.error("Stripe subscription webhook: payment-failed invoice has no subscription", {
                        invoiceId: event.data.object.id,
                    });
                    break;
                }

                await syncSubscription(await stripe.subscriptions.retrieve(subscriptionId));
                break;
            }

            default:
                break;
        }

        return NextResponse.json({ received: true });
    } catch (err: unknown) {
        console.error("Stripe subscription webhook: failed to sync subscription", {
            eventId: event.id,
            eventType: event.type,
            error: err,
        });
        return NextResponse.json({ error: "Failed to sync subscription" }, { status: 500 });
    }
}
