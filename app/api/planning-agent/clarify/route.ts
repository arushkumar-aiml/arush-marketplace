import { NextRequest, NextResponse } from "next/server";
import { callAI } from "../../../../lib/aiClient";
import { getAuthenticatedUserId } from "../../../../lib/apiAuth";

export async function POST(req: NextRequest) {
    try {
        if (!await getAuthenticatedUserId(req)) {
            return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
        }
        const { originalMessage, brief } = await req.json();

        if (!originalMessage || !brief) {
            return NextResponse.json(
                { error: "originalMessage and brief are required" },
                { status: 400 }
            );
        }

        const prompt = `You are Adeel AI, a senior technical product planner for a freelance marketplace platform.

A client described their project like this:
"${originalMessage}"

An initial scoping brief was already generated:
${JSON.stringify(brief, null, 2)}

Your task: generate 3 to 5 sharp clarifying questions that a senior product manager would ask BEFORE writing a full Product Requirements Document (PRD). Focus on ambiguities around: target users, must-have vs nice-to-have features, platforms (web/mobile/both), integrations, and any technical constraints.

Respond ONLY with valid JSON, no markdown, no preamble, in exactly this shape:
{
  "questions": [
    { "id": "q1", "question": "..." },
    { "id": "q2", "question": "..." }
  ]
}`;

        const rawText = await callAI({ prompt, temperature: 0.4, jsonMode: true });

        const parsed = JSON.parse(rawText);
        return NextResponse.json(parsed);
    } catch (err: unknown) {
        console.error("Clarify route error:", err);
        return NextResponse.json(
            { error: "Something went wrong generating clarifying questions" },
            { status: 500 }
        );
    }
}
