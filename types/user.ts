export type UserRole = "client" | "freelancer" | "admin";

export interface UserProfile {
    uid: string;
    email: string;
    role: UserRole;
    displayName: string;
    createdAt: number;

    // Freelancer-only fields
    skills?: string[];
    portfolioUrl?: string;
    bio?: string;
    hourlyRate?: number;
    profileEmbedding?: number[];
    profileEmbeddingSource?: string;
    profileEmbeddingUpdatedAt?: number;
    trustScore?: number;
    trustScoreUpdatedAt?: number;

    // Client-only fields
    companyName?: string;
}
