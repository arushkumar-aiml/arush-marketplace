import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import Stripe from "stripe";
import { adminDb } from "../../../lib/firebase-admin";

type SubscriptionPlan = "client_pro" | "freelancer_pro";

function getBearerToken(req: NextRequest): string | null {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
        return null;
    }

    return authorization.slice("Bearer ".length);
}

export async function POST(req: NextRequest) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const clientPriceId = process.env.STRIPE_CLIENT_PRO_PRICE_ID;
    const freelancerPriceId = process.env.STRIPE_FREELANCER_PRO_PRICE_ID;
    const idToken = getBearerToken(req);

    if (!secretKey || !clientPriceId || !freelancerPriceId) {
        console.error("Create subscription session: missing Stripe configuration");
        return NextResponse.json(
            { error: "Server misconfiguration: missing Stripe subscription configuration" },
            { status: 500 }
        );
    }

    if (!idToken) {
        return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
    }

    try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const profileSnapshot = await adminDb.collection("users").doc(decodedToken.uid).get();

        if (!profileSnapshot.exists) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        const role = profileSnapshot.data()?.role;

        if (role !== "client" && role !== "freelancer") {
            return NextResponse.json(
                { error: "Only client and freelancer accounts can subscribe" },
                { status: 403 }
            );
        }

        const plan: SubscriptionPlan = role === "client" ? "client_pro" : "freelancer_pro";
        const price = role === "client" ? clientPriceId : freelancerPriceId;
        const stripe = new Stripe(secretKey);
        const origin = req.headers.get("origin") || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [{ price, quantity: 1 }],
            client_reference_id: decodedToken.uid,
            customer_email: decodedToken.email,
            metadata: {
                firebaseUid: decodedToken.uid,
                subscriptionPlan: plan,
            },
            subscription_data: {
                metadata: {
                    firebaseUid: decodedToken.uid,
                    subscriptionPlan: plan,
                },
            },
            success_url: `${origin}/dashboard/${role}?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/dashboard/${role}?subscription=cancelled`,
        });

        if (!session.url) {
            throw new Error("Stripe did not return a Checkout URL");
        }

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        console.error("Create subscription session error:", err);
        return NextResponse.json(
            { error: "Failed to create subscription checkout" },
            { status: 500 }
        );
    }
}
