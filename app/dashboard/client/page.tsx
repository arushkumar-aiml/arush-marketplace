"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Users } from "lucide-react";
import Sidebar from "../../../components/dashboard/Sidebar";
import AIChatPanel from "../../../components/dashboard/AIChatPanel";
import BriefPanel from "../../../components/dashboard/BriefPanel";
import RequireRole from "../../../components/RequireRole";
import { useTheme } from "../../../lib/useTheme";
import type { ProjectBrief } from "../../../types/brief";

function ClientDashboardContent() {
    const { colors } = useTheme();
    const [brief, setBrief] = useState<ProjectBrief | null>(null);

    const cardLink = { background: colors.bgPrimary, color: colors.textPrimary, border: `1px solid ${colors.border}`, padding: "0.9rem 1.1rem", borderRadius: "12px", textDecoration: "none", display: "flex", alignItems: "center", gap: ".6rem", fontSize: "0.85rem", fontWeight: 600 } as const;

    return <div style={{ display: "flex", minHeight: "100vh", background: colors.bgCanvas }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "1.25rem 1.5rem", borderBottom: `1px solid ${colors.border}` }}>
                <div>
                    <h1 style={{ color: colors.textPrimary, fontSize: "1.25rem", margin: 0 }}>Plan with Adeel AI</h1>
                    <p style={{ color: colors.textMuted, fontSize: "0.85rem", margin: "0.2rem 0 0" }}>Describe your idea, then create the project or upgrade to a full PRD.</p>
                </div>
                <div style={{ display: "flex", gap: "0.6rem" }}>
                    <Link href="/dashboard/client/projects" style={cardLink}><FileText size={15} color={colors.success} /> My projects</Link>
                    <Link href="/dashboard/client/freelancers" style={cardLink}><Users size={15} color={colors.accentGold} /> Find freelancers</Link>
                </div>
            </header>
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                <AIChatPanel onBriefGenerated={setBrief} />
                <BriefPanel brief={brief} role="client" />
            </div>
        </div>
    </div>;
}

export default function ClientDashboardPage() {
    return (
        <RequireRole role="client">
            <ClientDashboardContent />
        </RequireRole>
    );
}
