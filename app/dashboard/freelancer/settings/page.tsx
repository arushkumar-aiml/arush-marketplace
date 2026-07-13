"use client";
import RequireRole from "../../../../components/RequireRole";
import ComingSoon from "../../../../components/dashboard/ComingSoon";

export default function SettingsPage() {
    return (
        <RequireRole role="freelancer">
            <ComingSoon pageName="Settings" />
        </RequireRole>
    );
}