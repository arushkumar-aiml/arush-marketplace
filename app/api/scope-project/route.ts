import { NextRequest, NextResponse } from "next/server";
import { callAI } from "../../../lib/aiClient";
import { getAuthenticatedUserId } from "../../../lib/apiAuth";
import { parseAIJson } from "../../../lib/parseAIJson";

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

Respond with ONLY valid JSON in exactly this shape. Use no markdown formatting, no code fences, and no explanation before or after the JSON:
{
  "overview": "2-3 sentence summary of the project",
  "budgetMin": 500,
  "budgetMax": 2000,
  "timelineWeeksMin": 2,
  "timelineWeeksMax": 6,
  "skills": ["React", "Node.js"]
}`;

        const rawText = await callAI({ prompt, temperature: 0.4, jsonMode: true });

        try {
            return NextResponse.json(parseAIJson(rawText));
        } catch (err: unknown) {
            console.error("Scope-project route: AI returned malformed JSON", err);
            return NextResponse.json({ error: "Adeel AI returned a malformed project brief. Please try again." }, { status: 502 });
        }
    } catch (err: unknown) {
        console.error("Scope-project route error:", err);
        return NextResponse.json(
            { error: "Something went wrong generating the brief" },
            { status: 500 }
        );
    }
}
