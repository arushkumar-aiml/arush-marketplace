import { NextRequest, NextResponse } from "next/server";
import { callAI } from "../../../../lib/aiClient";
import { parseAIJson } from "../../../../lib/parseAIJson";

export async function POST(req: NextRequest) {
    try {
        const { prd } = await req.json();

        if (!prd) {
            return NextResponse.json({ error: "prd is required" }, { status: 400 });
        }

        const prompt = `You are Adeel AI, a senior software engineer generating a starter code scaffold for a project based on this PRD:

${JSON.stringify(prd, null, 2)}

Generate 4 to 6 practical starter code files based on the recommended tech stack. Include things like: main entry component, one core API route, a data model/type definition, and a README with setup instructions. Keep each file's code concise (30-60 lines) but realistic and runnable, using the exact tech stack recommended in the PRD.

Respond with ONLY valid JSON in exactly this shape. Use no markdown formatting, no code fences, and no explanation before or after the JSON:
{
  "files": [
    { "path": "app/page.tsx", "language": "typescript", "description": "short one-line purpose", "code": "actual code here" }
  ],
  "setupInstructions": ["step 1...", "step 2..."]
}`;

        const rawText = await callAI({
            prompt,
            temperature: 0.4,
            jsonMode: true,
            maxTokens: 4096,
        });

        try {
            return NextResponse.json(parseAIJson(rawText));
        } catch (err: unknown) {
            console.error("Scaffold route: AI returned malformed JSON", err);
            return NextResponse.json({ error: "Adeel AI returned a malformed code scaffold. Please try again." }, { status: 502 });
        }
    } catch (err: unknown) {
        console.error("Scaffold route error:", err);
        return NextResponse.json(
            { error: "Something went wrong generating the code scaffold" },
            { status: 500 }
        );
    }
}
