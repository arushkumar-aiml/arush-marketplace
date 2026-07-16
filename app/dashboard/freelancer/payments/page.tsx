"use client";
import RequireRole from "../../../../components/RequireRole";
import Sidebar from "../../../../components/dashboard/Sidebar";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import PaymentsView from "../../../../components/dashboard/PaymentsView";
import { useTheme } from "../../../../lib/useTheme";

function PaymentsContent() {
    const { colors } = useTheme();
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: colors.bgPrimary }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <DashboardHeader subtitle="Track earnings, withdrawals, and payout methods." />
                <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
                    <PaymentsView role="freelancer" />
                </div>
            </div>
        </div>
    );
}

export default function PaymentsPage() {
    return (
        <RequireRole role="freelancer">
            <PaymentsContent />
        </RequireRole>
    );
}
