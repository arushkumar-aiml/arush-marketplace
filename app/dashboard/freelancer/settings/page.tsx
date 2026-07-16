"use client";

import RequireRole from "../../../../components/RequireRole";
import Sidebar from "../../../../components/dashboard/Sidebar";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import SettingsView from "../../../../components/dashboard/SettingsView";
import { useTheme } from "../../../../lib/useTheme";

function SettingsContent() {
    const { colors } = useTheme();
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: colors.bgPrimary }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <DashboardHeader subtitle="Manage your profile, language, and password." />
                <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
                    <SettingsView />
                </div>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <RequireRole role="freelancer">
            <SettingsContent />
        </RequireRole>
    );
}