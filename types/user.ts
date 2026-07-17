export type UserRole = "client" | "freelancer" | "admin";

export type Occupation = "Student" | "Working Professional" | "Business Owner" | "Other";

export type FreelanceWorkType =
    | "Web Development"
    | "Design"
    | "Writing"
    | "Video Editing"
    | "Marketing"
    | "Data/AI"
    | "Other";

export interface UserProfile {
    uid: string;
    email: string;
    role: UserRole;
    displayName: string;
    createdAt: number;
    occupation?: Occupation;
    freelanceWorkType?: FreelanceWorkType;
    communityClicks?: string[];
    aiCredits?: number;
    foundingMember?: boolean;

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
