"use client";

import RequireRole from "../../../../components/RequireRole";
import Sidebar from "../../../../components/dashboard/Sidebar";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import AnalyticsView from "../../../../components/dashboard/AnalyticsView";
import { useTheme } from "../../../../lib/useTheme";

function AnalyticsContent() {
    const { colors } = useTheme();
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: colors.bgPrimary }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <DashboardHeader subtitle="Review proposal performance, earnings, and profile views." />
                <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
                    <AnalyticsView role="freelancer" />
                </div>
            </div>
        </div>
    );
}

export default function FreelancerAnalyticsPage() {
    return (
        <RequireRole role="freelancer">
            <AnalyticsContent />
        </RequireRole>
    );
}
