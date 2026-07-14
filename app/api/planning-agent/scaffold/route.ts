import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prd } = await req.json();

        if (!prd) {
            return NextResponse.json({ error: "prd is required" }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Server misconfiguration: missing Groq API key" },
                { status: 500 }
            );
        }

        const prompt = `You are Adeel AI, a senior software engineer generating a starter code scaffold for a project based on this PRD:

${JSON.stringify(prd, null, 2)}

Generate 4 to 6 practical starter code files based on the recommended tech stack. Include things like: main entry component, one core API route, a data model/type definition, and a README with setup instructions. Keep each file's code concise (30-60 lines) but realistic and runnable, using the exact tech stack recommended in the PRD.

Respond ONLY with valid JSON, no markdown, no preamble, in exactly this shape:
{
  "files": [
    { "path": "app/page.tsx", "language": "typescript", "description": "short one-line purpose", "code": "actual code here" }
  ],
  "setupInstructions": ["step 1...", "step 2..."]
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
                max_tokens: 4096,
            }),
        });

        if (!groqRes.ok) {
            const errText = await groqRes.text();
            console.error("Groq API error:", errText);
            return NextResponse.json(
                { error: "Failed to generate code scaffold" },
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
        console.error("Scaffold route error:", err);
        return NextResponse.json(
            { error: "Something went wrong generating the code scaffold" },
            { status: 500 }
        );
    }
}