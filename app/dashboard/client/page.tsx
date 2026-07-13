"use client";

import { useState } from "react";
import Sidebar from "../../../components/dashboard/Sidebar";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import AIChatPanel from "../../../components/dashboard/AIChatPanel";
import BriefPanel from "../../../components/dashboard/BriefPanel";
import RequireRole from "../../../components/RequireRole";
import type { ProjectBrief } from "../../../types/brief";

function DashboardContent() {
    const [brief, setBrief] = useState<ProjectBrief | null>(null);

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "white" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <DashboardHeader ctaLabel="New Project" />
                <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                    <AIChatPanel onBriefGenerated={setBrief} />
                    <BriefPanel brief={brief} />
                </div>
            </div>
        </div>
    );
}

export default function ClientDashboardPage() {
    return (
        <RequireRole role="client">
            <DashboardContent />
        </RequireRole>
    );
}