import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { embedText } from "../../../../lib/ml/embeddings";
import { buildProfileText, scoreProfileTrust, type EmbeddedProfile } from "../../../../lib/ml/similarity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { uid } = await req.json();
        if (!uid) {
            return NextResponse.json({ error: "uid is required" }, { status: 400 });
        }

        const userRef = adminDb.collection("users").doc(uid);
        const snap = await userRef.get();
        if (!snap.exists) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const profile = { uid: snap.id, ...snap.data() } as EmbeddedProfile & { role?: string };
        const portfolioUrl = profile.portfolioUrl?.trim();
        let duplicatePortfolio = false;

        if (portfolioUrl) {
            const duplicateSnap = await adminDb.collection("users").where("portfolioUrl", "==", portfolioUrl).get();
            duplicatePortfolio = duplicateSnap.docs.some((doc) => doc.id !== uid);
        }

        const updates: Record<string, unknown> = {
            trustScore: scoreProfileTrust(profile, duplicatePortfolio),
            trustScoreUpdatedAt: Date.now(),
        };

        if (profile.role === "freelancer") {
            const source = buildProfileText(profile);
            updates.profileEmbedding = await embedText(source);
            updates.profileEmbeddingSource = source;
            updates.profileEmbeddingUpdatedAt = Date.now();
        }

        await userRef.update(updates);
        return NextResponse.json({ success: true, ...updates });
    } catch (err) {
        console.error("profile ML update error:", err);
        return NextResponse.json({ error: "Failed to update profile ML fields" }, { status: 500 });
    }
}
