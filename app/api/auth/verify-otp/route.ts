import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function POST(req: NextRequest) {
    try {
        const { uid, code } = await req.json();
        const snap = await adminDb.collection("otps").doc(uid).get();

        if (!snap.exists) {
            return NextResponse.json({ error: "No OTP found. Request a new one." }, { status: 400 });
        }

        const data = snap.data()!;
        if (Date.now() > data.expiresAt) {
            return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
        }
        if (data.code !== code) {
            return NextResponse.json({ error: "Incorrect code." }, { status: 400 });
        }

        await getAuth().updateUser(uid, { emailVerified: true });
        await adminDb.collection("otps").doc(uid).delete();

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("verify-otp error:", err);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}