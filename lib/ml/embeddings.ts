import "server-only";

let extractorPromise: Promise<unknown> | null = null;

type FeatureExtractor = (
    text: string,
    options: { pooling: "mean"; normalize: boolean }
) => Promise<{ data: Float32Array | number[] }>;

async function getExtractor() {
    if (!extractorPromise) {
        extractorPromise = import("@xenova/transformers").then(async ({ pipeline }) =>
            pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")
        );
    }
    return extractorPromise as Promise<FeatureExtractor>;
}

export async function embedText(text: string) {
    const extractor = await getExtractor();
    const output = await extractor(text || " ", { pooling: "mean", normalize: true });
    return Array.from(output.data).map((value) => Number(value));
}
