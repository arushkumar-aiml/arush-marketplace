"use client";
import RequireRole from "../../../../components/RequireRole";
import ComingSoon from "../../../../components/dashboard/ComingSoon";

export default function SettingsPage() {
    return (
        <RequireRole role="client">
            <ComingSoon pageName="Settings" />
        </RequireRole>
    );
}