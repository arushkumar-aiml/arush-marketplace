import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "../../../lib/firebase-admin";
import { getAuthenticatedUserId } from "../../../lib/apiAuth";

export async function POST(req: NextRequest) {
    try {
        const uid = await getAuthenticatedUserId(req);
        if (!uid) {
            return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
        }

        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey) {
            return NextResponse.json(
                { error: "Server misconfiguration: missing Stripe secret key" },
                { status: 500 }
            );
        }

        const stripe = new Stripe(secretKey);

        const { sessionId } = await req.json();
        if (!sessionId) {
            return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid") {
            return NextResponse.json({ paid: false });
        }

        const logId = session.metadata?.logId;
        const clientId = session.metadata?.clientId;

        if (!logId || !clientId) {
            return NextResponse.json(
                { error: "Missing metadata on payment session" },
                { status: 400 }
            );
        }

        if (clientId !== uid) {
            return NextResponse.json({ error: "This payment does not belong to the current user" }, { status: 403 });
        }

        // Record the unlock in Firestore using Admin SDK (bypasses client security
        // rules entirely — safe because this only runs after Stripe confirms
        // payment server-side, never trusting the client directly).
        await adminDb.collection("prd-unlocks").doc(logId).set({
            logId,
            clientId,
            sessionId,
            amount: session.amount_total,
            currency: session.currency,
            paidAt: Date.now(),
        });

        await adminDb.collection("notifications").doc(`payment-${logId}`).set({
            recipientId: clientId,
            type: "payment",
            message: "Payment received — your PRD and code scaffold are unlocked.",
            read: false,
            createdAt: Date.now(),
            link: "/dashboard/client/planning-agent",
        });

        return NextResponse.json({ paid: true, logId });
    } catch (err: unknown) {
        console.error("Verify payment error:", err);
        return NextResponse.json(
            { error: "Failed to verify payment" },
            { status: 500 }
        );
    }
}
