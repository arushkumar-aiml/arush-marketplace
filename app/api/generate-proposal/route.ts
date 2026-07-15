import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { project, freelancerProfile } = await req.json();

        if (!project) {
            return NextResponse.json({ error: "project is required" }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Server misconfiguration: missing Groq API key" },
                { status: 500 }
            );
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
                temperature: 0.6,
            }),
        });

        if (!groqRes.ok) {
            const errText = await groqRes.text();
            console.error("Groq API error:", errText);
            return NextResponse.json(
                { error: "Failed to generate proposal" },
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
        console.error("Generate proposal route error:", err);
        return NextResponse.json(
            { error: "Something went wrong generating the proposal" },
            { status: 500 }
        );
    }
}