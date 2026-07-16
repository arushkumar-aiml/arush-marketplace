import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { suggestPriceRange, type EmbeddedProfile } from "../../../../lib/ml/similarity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { skills } = await req.json();
        const targetSkills = Array.isArray(skills) ? skills.filter((skill) => typeof skill === "string") : [];
        if (!targetSkills.length) {
            return NextResponse.json({ suggestion: null });
        }

        const snap = await adminDb.collection("users").where("role", "==", "freelancer").get();
        const profiles = snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }) as EmbeddedProfile);
        const suggestion = suggestPriceRange(targetSkills, profiles);

        return NextResponse.json({ suggestion });
    } catch (err) {
        console.error("pricing suggestion error:", err);
        return NextResponse.json({ error: "Failed to suggest pricing" }, { status: 500 });
    }
}
