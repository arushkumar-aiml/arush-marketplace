import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
    try {
        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey) {
            return NextResponse.json(
                { error: "Server misconfiguration: missing Stripe secret key" },
                { status: 500 }
            );
        }

        const stripe = new Stripe(secretKey);

        const { logId, clientId, prdTitle } = await req.json();

        if (!logId || !clientId) {
            return NextResponse.json(
                { error: "logId and clientId are required" },
                { status: 400 }
            );
        }

        const origin = req.headers.get("origin") || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Full PRD + Code Scaffold Unlock",
                            description: prdTitle
                                ? `Unlock AI-generated code scaffold for: ${prdTitle}`
                                : "Unlock AI-generated code scaffold",
                        },
                        unit_amount: 1000, // $10.00 in cents
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                logId,
                clientId,
            },
            success_url: `${origin}/dashboard/client/planning-agent?unlocked=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/dashboard/client/planning-agent?unlocked=false`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        console.error("Create checkout session error:", err);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}