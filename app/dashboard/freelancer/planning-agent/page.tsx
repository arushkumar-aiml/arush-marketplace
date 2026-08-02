"use client";

import RequireRole from "../../../../components/RequireRole";
import PlanningAgentContent from "../../../../components/dashboard/PlanningAgentContent";

export default function FreelancerPlanningAgentPage() {
    return (
        <RequireRole role="freelancer">
            <PlanningAgentContent dashboardBasePath="/dashboard/freelancer" />
        </RequireRole>
    );
}
