"use client";
import RequireRole from "../../../../components/RequireRole";
import ComingSoon from "../../../../components/dashboard/ComingSoon";

export default function FreelancersPage() {
    return (
        <RequireRole role="client">
            <ComingSoon pageName="Freelancers" />
        </RequireRole>
    );
}