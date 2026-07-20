type CallAIOptions = {
    prompt: string;
    temperature: number;
    jsonMode: boolean;
    maxTokens?: number;
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct";

async function requestCompletion(url: string, apiKey: string, model: string, options: CallAIOptions) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [{ role: "user", content: options.prompt }],
            temperature: options.temperature,
            ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
            ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
        }),
    });

    if (!response.ok) {
        throw new Error(`AI provider error (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
        throw new Error("AI provider returned an empty response");
    }
    return content;
}

export async function callAI({
    prompt,
    temperature,
    jsonMode,
    maxTokens,
}: CallAIOptions): Promise<string> {
    const options = { prompt, temperature, jsonMode, maxTokens };
    const providers = [
        process.env.GROQ_API_KEY ? { url: GROQ_URL, key: process.env.GROQ_API_KEY, model: GROQ_MODEL } : null,
        process.env.OPENROUTER_API_KEY ? { url: OPENROUTER_URL, key: process.env.OPENROUTER_API_KEY, model: OPENROUTER_MODEL } : null,
    ].filter((provider): provider is { url: string; key: string; model: string } => Boolean(provider));

    if (!providers.length) throw new Error("Server misconfiguration: add GROQ_API_KEY or OPENROUTER_API_KEY");

    let lastError: unknown;
    for (const provider of providers) {
        try {
            return await requestCompletion(provider.url, provider.key, provider.model, options);
        } catch (error) {
            lastError = error;
            console.error(`AI provider failed (${provider.model})`, error);
        }
    }
    throw lastError instanceof Error ? lastError : new Error("All configured AI providers failed");
}
