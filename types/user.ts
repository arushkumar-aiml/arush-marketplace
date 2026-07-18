export type UserRole = "client" | "freelancer" | "admin";

export type UserPlan = "free" | "pro" | "premium";

export type SubscriptionStatus =
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "paused"
    | "trialing"
    | "unpaid";

export type SubscriptionPlan = "client_pro" | "freelancer_pro";

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
    aiCredits: number;
    plan: UserPlan;
    foundingMember?: boolean;
    subscriptionStatus?: SubscriptionStatus;
    subscriptionPlan?: SubscriptionPlan;
    stripeSubscriptionId?: string;
    subscriptionRenewsAt?: number;

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
