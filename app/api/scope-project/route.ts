import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "message is required" }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Server misconfiguration: missing Groq API key" },
                { status: 500 }
            );
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

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.4,
            }),
        });

        if (!groqRes.ok) {
            const errText = await groqRes.text();
            console.error("Groq API error:", errText);
            return NextResponse.json(
                { error: "Failed to generate project brief" },
                { status: 502 }
            );
        }

        const groqData = await groqRes.json();
        const rawText: string | undefined = groqData?.choices?.[0]?.message?.content;

        if (!rawText) {
            return NextResponse.json({ error: "Empty response from Groq" }, { status: 502 });
        }

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