"use client";
import RequireRole from "../../../../components/RequireRole";
import ComingSoon from "../../../../components/dashboard/ComingSoon";

export default function ProposalsPage() {
    return (
        <RequireRole role="freelancer">
            <ComingSoon pageName="My Proposals" />
        </RequireRole>
    );
}