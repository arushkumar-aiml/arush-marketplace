export interface ProjectBrief {
    overview: string;
    budgetMin: number;
    budgetMax: number;
    timelineWeeksMin: number;
    timelineWeeksMax: number;
    skills: string[];
    logId?: string;
    originalMessage?: string;
}