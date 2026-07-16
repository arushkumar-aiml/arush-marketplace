import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { embedText } from "../../../../lib/ml/embeddings";
import { buildProfileText, cosineSimilarity, type EmbeddedProfile } from "../../../../lib/ml/similarity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type JobPayload = {
    projectId?: string;
    title?: string;
    description?: string;
    skills?: string[];
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as JobPayload;
        const jobText = [body.title, body.description, ...(body.skills || [])].filter(Boolean).join(" ");
        if (!jobText.trim()) {
            return NextResponse.json({ error: "Job title, description, or skills are required" }, { status: 400 });
        }

        const jobEmbedding = await embedText(jobText);
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
                const skillsOverlap = (profile.skills || []).filter((skill) => jobText.toLowerCase().includes(skill.toLowerCase())).length;
                const semanticScore = cosineSimilarity(jobEmbedding, embedding);
                const overlapBoost = Math.min(0.2, skillsOverlap * 0.05);
                return {
                    uid: profile.uid,
                    displayName: profile.displayName,
                    bio: profile.bio,
                    skills: profile.skills || [],
                    portfolioUrl: profile.portfolioUrl,
                    trustScore: profile.trustScore,
                    matchScore: Math.round(Math.min(1, semanticScore + overlapBoost) * 100),
                };
            })
        );

        freelancers.sort((a, b) => b.matchScore - a.matchScore);
        const recommendedFreelancers = freelancers.slice(0, 10);

        if (body.projectId) {
            await adminDb.collection("projects").doc(body.projectId).update({
                recommendedFreelancers,
                recommendationsUpdatedAt: Date.now(),
            });
        }

        return NextResponse.json({ freelancers: recommendedFreelancers });
    } catch (err) {
        console.error("freelancer recommendation error:", err);
        return NextResponse.json({ error: "Failed to recommend freelancers" }, { status: 500 });
    }
}
