type CallAIOptions = {
    prompt: string;
    temperature: number;
    jsonMode: boolean;
    maxTokens?: number;
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-3.3-70b-instruct";

export async function callAI({
    prompt,
    temperature,
    jsonMode,
    maxTokens,
}: CallAIOptions): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error("Server misconfiguration: missing OpenRouter API key");
    }

    const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature,
            ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
            ...(maxTokens ? { max_tokens: maxTokens } : {}),
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
        throw new Error("OpenRouter returned an empty response");
    }

    return content;
}
