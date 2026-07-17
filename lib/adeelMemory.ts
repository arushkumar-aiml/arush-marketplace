import { adminDb } from "./firebaseAdmin";

type TrainerLog = {
    clientMessage?: unknown;
    aiOutput?: unknown;
    correctionNote?: unknown;
};

const MAX_ITEMS = 5;
const DOWN_FEEDBACK_SCAN_LIMIT = 25;
const MAX_SNIPPET_LENGTH = 140;

function compact(value: unknown): string {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_SNIPPET_LENGTH);
}

function summarizeOutput(output: unknown): string {
    if (typeof output === "string") {
        return compact(output);
    }

    if (output && typeof output === "object") {
        const record = output as Record<string, unknown>;
        return compact(record.overview ?? record.title ?? JSON.stringify(record));
    }

    return "";
}

export async function getPromptMemory(category: string): Promise<string> {
    try {
        const logs = adminDb.collection("adeel-trainer-logs");
        const [goodSnapshot, downSnapshot] = await Promise.all([
            logs.where("feedback", "==", "up").orderBy("createdAt", "desc").limit(MAX_ITEMS).get(),
            logs.where("feedback", "==", "down").orderBy("createdAt", "desc").limit(DOWN_FEEDBACK_SCAN_LIMIT).get(),
        ]);

        const goodExamples = goodSnapshot.docs
            .map((doc) => {
                const data = doc.data() as TrainerLog;
                const clientMessage = compact(data.clientMessage);
                const output = summarizeOutput(data.aiOutput);

                return clientMessage && output
                    ? `Request: ${clientMessage}; useful output: ${output}`
                    : "";
            })
            .filter(Boolean);

        const knownMistakes = downSnapshot.docs
            .map((doc) => compact((doc.data() as TrainerLog).correctionNote))
            .filter(Boolean)
            .slice(0, MAX_ITEMS);

        if (goodExamples.length === 0 && knownMistakes.length === 0) {
            return "";
        }

        const sections = [
            `Use this compact ${category} feedback memory only when it is relevant; prioritize the current client's requirements.`,
            goodExamples.length > 0 ? `GOOD_EXAMPLES:\n- ${goodExamples.join("\n- ")}` : "",
            knownMistakes.length > 0 ? `KNOWN_MISTAKES:\n- ${knownMistakes.join("\n- ")}` : "",
        ].filter(Boolean);

        return `\n\n${sections.join("\n\n")}`;
    } catch (error) {
        console.error("Adeel feedback memory lookup failed:", error);
        return "";
    }
}
