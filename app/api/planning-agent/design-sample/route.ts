import { NextRequest, NextResponse } from "next/server";

type DesignSampleRequest = {
    title?: string;
    scope?: string;
    techStack?: Array<{ category?: string; recommendation?: string }>;
};

type GeminiImageResponse = {
    output_image?: {
        data?: string;
        mime_type?: string;
    };
    error?: {
        message?: string;
    };
};

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("Design sample route: missing GEMINI_API_KEY");
        return NextResponse.json(
            { error: "Server misconfiguration: missing Gemini API key" },
            { status: 500 }
        );
    }

    let prd: DesignSampleRequest;

    try {
        ({ prd } = await req.json());
    } catch (err: unknown) {
        console.error("Design sample route: invalid request JSON", err);
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!prd?.title || !prd.scope || !Array.isArray(prd.techStack)) {
        return NextResponse.json(
            { error: "prd.title, prd.scope, and prd.techStack are required" },
            { status: 400 }
        );
    }

    const techStack = prd.techStack
        .map((item) => `${item.category || "Technology"}: ${item.recommendation || "Not specified"}`)
        .join(", ");

    const prompt = `Create a polished 16:9 UI design sample for a product named "${prd.title}".

Product scope: ${prd.scope}
Technology context: ${techStack}

Show a realistic, modern SaaS web interface that best represents this product's core workflow. Use a clean, premium dashboard or landing-page composition, clear hierarchy, practical cards, navigation, data states, and restrained contemporary colors. Make it feel like a credible production product design. Do not include device mockups, browser frames, watermarks, or brand logos. Use only minimal, legible placeholder UI text where necessary.`;

    try {
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/interactions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey,
                },
                body: JSON.stringify({
                    model: "gemini-3.1-flash-image",
                    input: [{ type: "text", text: prompt }],
                    response_format: {
                        type: "image",
                        mime_type: "image/png",
                        aspect_ratio: "16:9",
                    },
                }),
            }
        );

        const data: GeminiImageResponse = await response.json();

        if (!response.ok) {
            console.error("Design sample route: Gemini API error", {
                status: response.status,
                error: data.error,
            });
            return NextResponse.json(
                { error: data.error?.message || "Gemini failed to generate a design sample" },
                { status: 502 }
            );
        }

        const imageData = data.output_image?.data;
        const mimeType = data.output_image?.mime_type || "image/png";

        if (!imageData) {
            console.error("Design sample route: Gemini returned no image", data);
            return NextResponse.json(
                { error: "Gemini returned no design sample image" },
                { status: 502 }
            );
        }

        return NextResponse.json({ imageDataUrl: `data:${mimeType};base64,${imageData}` });
    } catch (err: unknown) {
        console.error("Design sample route: Gemini request failed", err);
        return NextResponse.json(
            { error: "Failed to generate design sample" },
            { status: 500 }
        );
    }
}
