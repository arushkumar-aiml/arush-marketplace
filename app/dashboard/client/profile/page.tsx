"use client";

import RequireRole from "../../../../components/RequireRole";
import Sidebar from "../../../../components/dashboard/Sidebar";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import SettingsView from "../../../../components/dashboard/SettingsView";
import { useTheme } from "../../../../lib/useTheme";

function ClientProfileContent() {
    const { colors } = useTheme();
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: colors.bgPrimary }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <DashboardHeader subtitle="Manage your client profile and company details." />
                <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
                    <SettingsView />
                </div>
            </div>
        </div>
    );
}

export default function ClientProfilePage() {
    return (
        <RequireRole role="client">
            <ClientProfileContent />
        </RequireRole>
    );
}
