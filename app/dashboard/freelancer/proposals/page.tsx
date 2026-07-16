"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useAuth } from "../../../../lib/useAuth";
import { useTheme } from "../../../../lib/useTheme";
import RequireRole from "../../../../components/RequireRole";
import Sidebar from "../../../../components/dashboard/Sidebar";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import type { Application, ApplicationStatus } from "../../../../types/application";
import { Clock, ArrowRight, Briefcase } from "lucide-react";

interface ProposalWithProject extends Application {
    projectTitle: string;
    projectBudget: number;
}

const STATUS_STYLES: Record<ApplicationStatus, { bg: string; text: string; label: string }> = {
    interested: { bg: "#EFF3FF", text: "#2563EB", label: "Pending" },
    accepted: { bg: "#DCFCE7", text: "#16A34A", label: "Accepted" },
    declined: { bg: "#FEE2E2", text: "#DC2626", label: "Declined" },
};

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function ProposalsContent() {
    const { user } = useAuth();
    const { colors } = useTheme();
    const [proposals, setProposals] = useState<ProposalWithProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<ApplicationStatus | "all">("all");

    useEffect(() => {
        async function fetchProposals() {
            if (!user) return;
            const q = query(
                collection(db, "applications"),
                where("freelancerId", "==", user.uid),
                orderBy("createdAt", "desc")
            );
            const snap = await getDocs(q);
            const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Application);

            const withProjects = await Promise.all(
                apps.map(async (app) => {
                    try {
                        const projSnap = await getDoc(doc(db, "projects", app.projectId));
                        const projData = projSnap.exists() ? projSnap.data() : null;
                        return {
                            ...app,
                            projectTitle: projData?.title || "Untitled Project",
                            projectBudget: projData?.budget || 0,
                        };
                    } catch {
                        return { ...app, projectTitle: "Untitled Project", projectBudget: 0 };
                    }
                })
            );

            setProposals(withProjects);
            setLoading(false);
        }
        fetchProposals();
    }, [user]);

    const filtered = filter === "all" ? proposals : proposals.filter((p) => p.status === filter);

    const counts = {
        all: proposals.length,
        interested: proposals.filter((p) => p.status === "interested").length,
        accepted: proposals.filter((p) => p.status === "accepted").length,
        declined: proposals.filter((p) => p.status === "declined").length,
    };

    const filterTabs: { key: ApplicationStatus | "all"; label: string }[] = [
        { key: "all", label: `All (${counts.all})` },
        { key: "interested", label: `Pending (${counts.interested})` },
        { key: "accepted", label: `Accepted (${counts.accepted})` },
        { key: "declined", label: `Declined (${counts.declined})` },
    ];

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: colors.bgPrimary }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <DashboardHeader subtitle="Track every proposal you've sent." />

                <div style={{ flex: 1, padding: "2rem", maxWidth: "820px", overflowY: "auto" }}>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                style={{
                                    fontSize: "0.82rem",
                                    fontWeight: 600,
                                    padding: "0.5rem 0.9rem",
                                    borderRadius: "999px",
                                    border: `1px solid ${filter === tab.key ? colors.accentBlue : colors.border}`,
                                    background: filter === tab.key ? colors.accentBlueSoft : colors.bgPrimary,
                                    color: filter === tab.key ? colors.accentBlue : colors.textSecondary,
                                    cursor: "pointer",
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <p style={{ color: colors.textMuted }}>Loading your proposals...</p>
                    ) : filtered.length === 0 ? (
                        <div style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}`, borderRadius: "16px", padding: "2.5rem", textAlign: "center" }}>
                            <Briefcase size={22} color={colors.textMuted} style={{ marginBottom: "0.75rem" }} />
                            <p style={{ color: colors.textMuted }}>
                                {filter === "all"
                                    ? "You haven't sent any proposals yet. Browse open projects and apply with AI."
                                    : `No ${filter} proposals.`}
                            </p>
                            {filter === "all" && (
                                <Link
                                    href="/dashboard/freelancer"
                                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginTop: "1rem", fontSize: "0.85rem", fontWeight: 600, color: colors.accentBlue, textDecoration: "none" }}
                                >
                                    Browse open projects <ArrowRight size={14} />
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {filtered.map((p) => {
                                const statusStyle = STATUS_STYLES[p.status];
                                return (
                                    <div key={p.id} style={{ border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "1.1rem 1.25rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                                            <h3 style={{ fontWeight: 600, color: colors.textPrimary, fontSize: "0.95rem" }}>{p.projectTitle}</h3>
                                            <span
                                                style={{
                                                    fontSize: "0.72rem",
                                                    fontWeight: 700,
                                                    color: statusStyle.text,
                                                    background: statusStyle.bg,
                                                    borderRadius: "999px",
                                                    padding: "0.25rem 0.7rem",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {statusStyle.label}
                                            </span>
                                        </div>

                                        {p.proposalText && (
                                            <p style={{ fontSize: "0.85rem", color: colors.textSecondary, lineHeight: 1.5, marginBottom: "0.75rem" }}>
                                                {p.proposalText.length > 180 ? `${p.proposalText.slice(0, 180)}...` : p.proposalText}
                                            </p>
                                        )}

                                        <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.78rem", color: colors.textMuted }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                                <Clock size={13} /> Sent {formatDate(p.createdAt)}
                                            </span>
                                            {p.projectBudget > 0 && <span>${p.projectBudget.toLocaleString()} budget</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProposalsPage() {
    return (
        <RequireRole role="freelancer">
            <ProposalsContent />
        </RequireRole>
    );
}