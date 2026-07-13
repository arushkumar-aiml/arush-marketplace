export interface ClarifyingQuestion {
    id: string;
    question: string;
}

export interface ClarifyingAnswer {
    questionId: string;
    question: string;
    answer: string;
}

export interface Milestone {
    title: string;
    description: string;
    durationWeeks: number;
    deliverables: string[];
}

export interface TechStackItem {
    category: string;
    recommendation: string;
    reason: string;
}

export interface FullPRD {
    title: string;
    problemStatement: string;
    goals: string[];
    scope: string;
    outOfScope: string[];
    milestones: Milestone[];
    techStack: TechStackItem[];
    risks: string[];
    logId?: string;
}