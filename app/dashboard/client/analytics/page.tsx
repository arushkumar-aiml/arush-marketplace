"use client";
import RequireRole from "../../../../components/RequireRole";
import ComingSoon from "../../../../components/dashboard/ComingSoon";

export default function AnalyticsPage() {
    return (
        <RequireRole role="client">
            <ComingSoon pageName="Analytics" />
        </RequireRole>
    );
}