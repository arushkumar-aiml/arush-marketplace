import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { embedText } from "../../../../lib/ml/embeddings";
import { buildProfileText, cosineSimilarity, lexicalSimilarity, type EmbeddedProfile } from "../../../../lib/ml/similarity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();
        if (!query || typeof query !== "string") {
            return NextResponse.json({ error: "query is required" }, { status: 400 });
        }

        const queryEmbedding = await embedText(query);
        const snap = await adminDb.collection("users").where("role", "==", "freelancer").get();
        const freelancers = await Promise.all(
            snap.docs.map(async (doc) => {
                const profile = { uid: doc.id, ...doc.data() } as EmbeddedProfile;
                let embedding = profile.profileEmbedding;
                if (!embedding?.length) {
                    const source = buildProfileText(profile);
                    embedding = await embedText(source);
                    await doc.ref.update({
                        profileEmbedding: embedding,
                        profileEmbeddingSource: source,
                        profileEmbeddingUpdatedAt: Date.now(),
                    });
                }
                const semanticScore = cosineSimilarity(queryEmbedding, embedding);
                const textScore = lexicalSimilarity(query, profile);
                return {
                    ...profile,
                    matchScore: Math.round(Math.max(semanticScore, textScore) * 100),
                    profileEmbedding: undefined,
                };
            })
        );

        freelancers.sort((a, b) => b.matchScore - a.matchScore);
        return NextResponse.json({ freelancers: freelancers.slice(0, 30) });
    } catch (err) {
        console.error("smart freelancer search error:", err);
        return NextResponse.json({ error: "Failed to search freelancers" }, { status: 500 });
    }
}
