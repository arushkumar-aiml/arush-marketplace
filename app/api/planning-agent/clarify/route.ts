import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { originalMessage, brief } = await req.json();

        if (!originalMessage || !brief) {
            return NextResponse.json(
                { error: "originalMessage and brief are required" },
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
                { error: "Failed to generate clarifying questions" },
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
        console.error("Clarify route error:", err);
        return NextResponse.json(
            { error: "Something went wrong generating clarifying questions" },
            { status: 500 }
        );
    }
}