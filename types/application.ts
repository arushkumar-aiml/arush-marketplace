export type ApplicationStatus = "interested" | "accepted" | "declined";

export interface Application {
    id: string;
    projectId: string;
    freelancerId: string;
    freelancerName: string;
    status: ApplicationStatus;
    createdAt: number;
    proposalText?: string;
}