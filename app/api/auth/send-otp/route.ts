import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
    if (!resendClient) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error("Missing RESEND_API_KEY environment variable");
        }
        resendClient = new Resend(apiKey);
    }
    return resendClient;
}

export async function POST(req: NextRequest) {
    try {
        const { email, uid } = await req.json();
        if (!email || !uid) {
            return NextResponse.json({ error: "Missing email or uid" }, { status: 400 });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min

        await adminDb.collection("otps").doc(uid).set({ code, email, expiresAt });

        // NOTE: "onboarding@resend.dev" is Resend's shared testing domain — it works
        // immediately with no setup, but emails may land in spam and can't use your
        // own brand name. Once you verify your own domain in the Resend dashboard,
        // replace this with e.g. "Arush Labs <noreply@arushlabs.com>".
        await getResendClient().emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Your verification code",
            html: `<p>Your verification code is:</p><h2 style="letter-spacing:4px;">${code}</h2><p>This code expires in 10 minutes.</p>`,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("send-otp error:", err);
        return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
    }
}