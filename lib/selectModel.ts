export type AITaskType =
    | "proposal_generation"
    | "quick_reply"
    | "chat"
    | "quick_suggestion"
    | "summary"
    | "freelancer_message"
    | "ui_recommendation"
    | "project_brief_generation"
    | "requirement_analysis"
    | "prd_generation"
    | "business_planning"
    | "planning_agent"
    | "roadmap_generation"
    | "business_analysis"
    | "long_form_response"
    | "startup_validation"
    | "code_scaffold_generation"
    | "design_generation";

export type AIModelProvider = "gemini" | "groq";

const GROQ_TASKS: ReadonlySet<AITaskType> = new Set([
    "proposal_generation",
    "quick_reply",
    "chat",
    "quick_suggestion",
    "summary",
    "freelancer_message",
    "ui_recommendation",
]);

export function selectModel(taskType: AITaskType): AIModelProvider {
    return GROQ_TASKS.has(taskType) ? "groq" : "gemini";
}
