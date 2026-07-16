import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { email, uid } = await req.json();
        if (!email || !uid) {
            return NextResponse.json({ error: "Missing email or uid" }, { status: 400 });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min

        await adminDb.collection("otps").doc(uid).set({ code, email, expiresAt });

        await resend.emails.send({
            from: "onboarding@yourdomain.com", // Resend ke free domain se bhi bhej sakte ho: onboarding@resend.dev
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