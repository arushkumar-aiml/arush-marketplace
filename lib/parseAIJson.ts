export function stripAIJsonMarkdown(rawText: string): string {
    const trimmed = rawText.trim();

    if (!trimmed.startsWith("```")) {
        return trimmed;
    }

    return trimmed
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
}

export function parseAIJson<T>(rawText: string): T {
    return JSON.parse(stripAIJsonMarkdown(rawText)) as T;
}
