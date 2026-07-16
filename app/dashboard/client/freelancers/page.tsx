"use client";
import RequireRole from "../../../../components/RequireRole";
import Sidebar from "../../../../components/dashboard/Sidebar";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import FreelancersDirectoryView from "../../../../components/dashboard/FreelancersDirectoryView";
import { useTheme } from "../../../../lib/useTheme";

function FreelancersContent() {
    const { colors } = useTheme();
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: colors.bgPrimary }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <DashboardHeader subtitle="Search and filter freelancer profiles." />
                <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
                    <FreelancersDirectoryView />
                </div>
            </div>
        </div>
    );
}

export default function FreelancersPage() {
    return (
        <RequireRole role="client">
            <FreelancersContent />
        </RequireRole>
    );
}
