import { NextRequest, NextResponse } from "next/server";
import { callAI } from "../../../../lib/aiClient";
import { getPromptMemory } from "../../../../lib/adeelMemory";

export async function POST(req: NextRequest) {
    try {
        const { originalMessage, brief, answers } = await req.json();

        if (!originalMessage || !brief || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: "originalMessage, brief, and answers are required" },
                { status: 400 }
            );
        }

        const answersText = answers
            .map((a: { question: string; answer: string }, i: number) => `${i + 1}. Q: ${a.question}\n   A: ${a.answer}`)
            .join("\n");

        const promptMemory = await getPromptMemory("PRD");

        const prompt = `You are Adeel AI, a senior technical product planner for a freelance marketplace platform.

Original client request:
"${originalMessage}"

Initial scoping brief:
${JSON.stringify(brief, null, 2)}

Clarifying questions and the client's answers:
${answersText}

Your task: write a full, practical Product Requirements Document (PRD) based on all of the above. Be specific and realistic — this will be handed to a freelancer or dev team to actually build. Milestones should be sequential and scoped so their durations roughly add up to the brief's timeline range. Tech stack suggestions should be practical, mainstream, and justified in one short sentence each.

Respond ONLY with valid JSON, no markdown, no preamble, in exactly this shape:
{
  "title": "...",
  "problemStatement": "...",
  "goals": ["...", "..."],
  "scope": "...",
  "outOfScope": ["...", "..."],
  "milestones": [
    { "title": "...", "description": "...", "durationWeeks": 1, "deliverables": ["...", "..."] }
  ],
  "techStack": [
    { "category": "Frontend", "recommendation": "...", "reason": "..." }
  ],
  "risks": ["...", "..."]
}${promptMemory}`;

        const rawText = await callAI({ prompt, temperature: 0.4, jsonMode: true });

        const parsed = JSON.parse(rawText);
        return NextResponse.json(parsed);
    } catch (err: unknown) {
        console.error("Generate PRD route error:", err);
        return NextResponse.json(
            { error: "Something went wrong generating the PRD" },
            { status: 500 }
        );
    }
}
