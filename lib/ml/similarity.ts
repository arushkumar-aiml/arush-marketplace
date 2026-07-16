export type EmbeddedProfile = {
    uid: string;
    displayName?: string;
    bio?: string;
    skills?: string[];
    portfolioUrl?: string;
    photoURL?: string;
    hourlyRate?: number;
    rate?: number;
    profileEmbedding?: number[];
    trustScore?: number;
    createdAt?: number;
};

export function buildProfileText(profile: EmbeddedProfile) {
    return [profile.displayName, profile.bio, ...(profile.skills || [])]
        .filter(Boolean)
        .join(" ")
        .trim();
}

export function cosineSimilarity(a: number[], b: number[]) {
    if (!a.length || !b.length || a.length !== b.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i += 1) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (!normA || !normB) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function lexicalSimilarity(query: string, profile: EmbeddedProfile) {
    const words = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
    if (!words.length) return 0;
    const text = buildProfileText(profile).toLowerCase();
    const matched = words.filter((word) => text.includes(word)).length;
    return matched / words.length;
}

export function scoreProfileTrust(profile: EmbeddedProfile, duplicatePortfolio: boolean) {
    let score = 100;
    const bio = (profile.bio || "").trim().toLowerCase();
    const createdAt = profile.createdAt || Date.now();
    const genericBios = ["hard worker", "i can do anything", "best freelancer", "experienced freelancer"];

    if (!profile.photoURL) score -= 10;
    if (bio.length < 60) score -= 20;
    if (genericBios.some((phrase) => bio.includes(phrase))) score -= 15;
    if (duplicatePortfolio && profile.portfolioUrl) score -= 25;
    if (Date.now() - createdAt < 7 * 24 * 60 * 60 * 1000) score -= 10;
    if (!profile.skills?.length) score -= 15;

    return Math.max(0, Math.min(100, score));
}

export function suggestPriceRange(targetSkills: string[], profiles: EmbeddedProfile[]) {
    const normalized = targetSkills.map((s) => s.toLowerCase());
    const rates = profiles
        .filter((profile) => (profile.skills || []).some((skill) => normalized.includes(skill.toLowerCase())))
        .map((profile) => profile.hourlyRate ?? profile.rate ?? 0)
        .filter((rate) => rate > 0);

    if (!rates.length) {
        return null;
    }

    const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    return {
        min: Math.max(1, Math.round(average * 0.8)),
        max: Math.round(average * 1.2),
        average: Math.round(average),
        sampleSize: rates.length,
    };
}
