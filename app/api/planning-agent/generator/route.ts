import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { originalMessage, brief, answers } = await req.json();

        if (!originalMessage || !brief || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: "originalMessage, brief, and answers are required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Server misconfiguration: missing Gemini API key" },
                { status: 500 }
            );
        }

        const answersText = answers
            .map((a: { question: string; answer: string }, i: number) => `${i + 1}. Q: ${a.question}\n   A: ${a.answer}`)
            .join("\n");

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
}`;

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" },
                }),
            }
        );

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            console.error("Gemini API error:", errText);
            return NextResponse.json(
                { error: "Failed to generate PRD" },
                { status: 502 }
            );
        }

        const geminiData = await geminiRes.json();
        const rawText: string | undefined =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            return NextResponse.json(
                { error: "Empty response from Gemini" },
                { status: 502 }
            );
        }

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