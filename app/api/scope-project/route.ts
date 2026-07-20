import { NextRequest, NextResponse } from "next/server";
import { callAI } from "../../../lib/aiClient";
import { getAuthenticatedUserId } from "../../../lib/apiAuth";

export async function POST(req: NextRequest) {
    try {
        if (!await getAuthenticatedUserId(req)) {
            return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
        }
        const { message } = await req.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "message is required" }, { status: 400 });
        }

        const prompt = `You are Adeel AI, a project scoping assistant for a freelance marketplace. A client described their project like this:

"${message}"

Generate a realistic scoping brief: a short overview, a realistic USD budget range, a realistic timeline range in weeks, and a list of required skills.

Respond ONLY with valid JSON, no markdown, no preamble, in exactly this shape:
{
  "overview": "2-3 sentence summary of the project",
  "budgetMin": 500,
  "budgetMax": 2000,
  "timelineWeeksMin": 2,
  "timelineWeeksMax": 6,
  "skills": ["React", "Node.js"]
}`;

        const rawText = await callAI({ prompt, temperature: 0.4, jsonMode: true });

        const parsed = JSON.parse(rawText);
        return NextResponse.json(parsed);
    } catch (err: unknown) {
        console.error("Scope-project route error:", err);
        return NextResponse.json(
            { error: "Something went wrong generating the brief" },
            { status: 500 }
        );
    }
}
