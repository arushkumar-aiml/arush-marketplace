"use client";
import RequireRole from "../../../../components/RequireRole";
import ComingSoon from "../../../../components/dashboard/ComingSoon";

export default function ProjectsPage() {
    return (
        <RequireRole role="client">
            <ComingSoon pageName="Projects" />
        </RequireRole>
    );
}