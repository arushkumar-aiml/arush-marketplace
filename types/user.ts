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

    // Client-only fields
    companyName?: string;
}