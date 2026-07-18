import { NextRequest, NextResponse } from "next/server";
import { callAI } from "../../../lib/aiClient";
import { getAuthenticatedUserId } from "../../../lib/apiAuth";
import { deductCredits } from "../../../lib/creditSystem";

const INSUFFICIENT_CREDITS_MESSAGE = "You've reached your monthly AI limit. Upgrade to Premium to unlock unlimited premium tools.";

export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(req);
        if (!userId) {
            return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
        }

        const { project, freelancerProfile } = await req.json();

        if (!project) {
            return NextResponse.json({ error: "project is required" }, { status: 400 });
        }

        const creditsDeducted = await deductCredits(userId, 2);
        if (!creditsDeducted) {
            return NextResponse.json({ error: INSUFFICIENT_CREDITS_MESSAGE }, { status: 402 });
        }

        const skillsText = freelancerProfile?.skills?.length
            ? freelancerProfile.skills.join(", ")
            : "General skills relevant to this project";
        const bioText = freelancerProfile?.bio || "Experienced freelancer";
        const nameText = freelancerProfile?.displayName || "the freelancer";

        const prompt = `You are Adeel AI, helping a freelancer write a strong project proposal on a freelance marketplace.

Project details:
Title: ${project.title}
Description: ${project.rawDescription}
Budget: $${project.budget}
Timeline: ${project.timelineDays} days

Freelancer profile:
Name: ${nameText}
Skills: ${skillsText}
Bio: ${bioText}

Write a compelling, personalized project proposal (150-220 words) from this freelancer to the client. It should:
- Open with a specific, non-generic hook referencing the actual project
- Briefly explain relevant experience/approach (tie to their skills/bio, don't invent fake experience)
- Mention a realistic plan or first steps
- Close with a confident, friendly call to action
- Sound human, not robotic. No markdown, no bullet points, plain paragraph text only.

Respond ONLY with valid JSON, no markdown, no preamble, in exactly this shape:
{
  "proposal": "the full proposal text here"
}`;

        const rawText = await callAI({ prompt, temperature: 0.6, jsonMode: true });

        const parsed = JSON.parse(rawText);
        return NextResponse.json(parsed);
    } catch (err: unknown) {
        console.error("Generate proposal route error:", err);
        return NextResponse.json(
            { error: "Something went wrong generating the proposal" },
            { status: 500 }
        );
    }
}
