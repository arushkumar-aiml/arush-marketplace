export type ProjectStatus =
    | "draft"
    | "open"
    | "in_progress"
    | "completed"
    | "cancelled";

export interface Project {
    id: string;
    clientId: string;
    title: string;
    rawDescription: string;
    budget: number;
    timelineDays: number;
    status: ProjectStatus;
    createdAt: number;
    category?: string;

    aiScope?: string;
    aiSkillTags?: string[];
}