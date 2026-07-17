"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, query, where, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useAuth } from "../../../../lib/useAuth";
import { useTheme } from "../../../../lib/useTheme";
import RequireRole from "../../../../components/RequireRole";
import Sidebar from "../../../../components/dashboard/Sidebar";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import type { Project, ProjectStatus } from "../../../../types/project";
import type { Application } from "../../../../types/application";
import { Wallet, Clock, ChevronDown, ChevronUp, Check, X, FileText } from "lucide-react";

const STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string }> = {
    draft: { bg: "#F7F8FA", text: "#7A7C87" },
    open: { bg: "#EFF3FF", text: "#2563EB" },
    in_progress: { bg: "#FEF3C7", text: "#B8860B" },
    completed: { bg: "#DCFCE7", text: "#16A34A" },
    cancelled: { bg: "#FEE2E2", text: "#DC2626" },
};

function ProjectsContent() {
    const { user } = useAuth();
    const { colors } = useTheme();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [applications, setApplications] = useState<Record<string, Application[]>>({});
    const [loadingApps, setLoadingApps] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProjects() {
            if (!user) return;
            const q = query(
                collection(db, "projects"),
                where("clientId", "==", user.uid),
                orderBy("createdAt", "desc")
            );
            const snap = await getDocs(q);
            setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project));
            setLoading(false);
        }
        fetchProjects();
    }, [user]);

    async function toggleExpand(projectId: string) {
        if (expandedId === projectId) {
            setExpandedId(null);
            return;
        }
        setExpandedId(projectId);
        if (!applications[projectId]) {
            setLoadingApps(projectId);
            const q = query(collection(db, "applications"), where("projectId", "==", projectId));
            const snap = await getDocs(q);
            setApplications((prev) => ({
                ...prev,
                [projectId]: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Application),
            }));
            setLoadingApps(null);
        }
    }

    async function respondToApplication(projectId: string, applicationId: string, status: "accepted" | "declined") {
        await updateDoc(doc(db, "applications", applicationId), { status });
        const application = applications[projectId]?.find((item) => item.id === applicationId);
        if (application) {
            await addDoc(collection(db, "notifications"), {
                recipientId: application.freelancerId,
                type: "application_response",
                message: `Your proposal was ${status} by the client.`,
                read: false,
                createdAt: Date.now(),
                link: "/dashboard/freelancer/proposals",
            });
        }
        setApplications((prev) => ({
            ...prev,
            [projectId]: prev[projectId].map((a) => (a.id === applicationId ? { ...a, status } : a)),
        }));
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: colors.bgPrimary }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <DashboardHeader subtitle="Manage your posted projects and review applications." />

                <div style={{ flex: 1, padding: "2rem", maxWidth: "820px", overflowY: "auto" }}>
                    {loading ? (
                        <p style={{ color: colors.textMuted }}>Loading your projects...</p>
                    ) : projects.length === 0 ? (
                        <div style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}`, borderRadius: "16px", padding: "2.5rem", textAlign: "center" }}>
                            <p style={{ color: colors.textMuted }}>
                                You haven&apos;t posted any projects yet. Generate a brief with Adeel AI and create your first project.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                            {projects.map((p) => {
                                const statusStyle = STATUS_COLORS[p.status] ?? STATUS_COLORS.open;
                                const isExpanded = expandedId === p.id;
                                const projectApps = applications[p.id] ?? [];

                                return (
                                    <div key={p.id} style={{ border: `1px solid ${colors.border}`, borderRadius: "14px", overflow: "hidden" }}>
                                        <div style={{ padding: "1.25rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                                                <h3 style={{ fontWeight: 600, color: colors.textPrimary, fontSize: "1rem" }}>{p.title}</h3>
                                                <span
                                                    style={{
                                                        fontSize: "0.72rem",
                                                        fontWeight: 700,
                                                        color: statusStyle.text,
                                                        background: statusStyle.bg,
                                                        borderRadius: "999px",
                                                        padding: "0.25rem 0.7rem",
                                                        whiteSpace: "nowrap",
                                                        textTransform: "capitalize",
                                                    }}
                                                >
                                                    {p.status.replace("_", " ")}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: "0.87rem", color: colors.textSecondary, marginBottom: "1rem", lineHeight: 1.5 }}>
                                                {p.rawDescription}
                                            </p>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.8rem", color: colors.textMuted }}>
                                                    <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                                        <Wallet size={14} /> ${p.budget.toLocaleString()}
                                                    </span>
                                                    <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                                        <Clock size={14} /> {p.timelineDays} days
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => toggleExpand(p.id)}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.35rem",
                                                        fontSize: "0.82rem",
                                                        fontWeight: 600,
                                                        color: colors.accentBlue,
                                                        background: "none",
                                                        border: "none",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <FileText size={14} />
                                                    View Applications
                                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div style={{ background: colors.bgSecondary, borderTop: `1px solid ${colors.border}`, padding: "1.1rem 1.25rem" }}>
                                                {loadingApps === p.id ? (
                                                    <p style={{ fontSize: "0.85rem", color: colors.textMuted }}>Loading applications...</p>
                                                ) : projectApps.length === 0 ? (
                                                    <p style={{ fontSize: "0.85rem", color: colors.textMuted }}>No applications yet.</p>
                                                ) : (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                                                        {projectApps.map((app) => (
                                                            <div key={app.id} style={{ background: colors.bgPrimary, border: `1px solid ${colors.border}`, borderRadius: "10px", padding: "0.9rem" }}>
                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: app.proposalText ? "0.5rem" : 0 }}>
                                                                    <span style={{ fontWeight: 600, fontSize: "0.88rem", color: colors.textPrimary }}>{app.freelancerName}</span>
                                                                    {app.status === "accepted" && (
                                                                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: colors.success, background: colors.successSoft, padding: "0.2rem 0.6rem", borderRadius: "999px" }}>Accepted</span>
                                                                    )}
                                                                    {app.status === "declined" && (
                                                                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: colors.danger, background: colors.dangerSoft, padding: "0.2rem 0.6rem", borderRadius: "999px" }}>Declined</span>
                                                                    )}
                                                                    {app.status === "interested" && (
                                                                        <div style={{ display: "flex", gap: "0.4rem" }}>
                                                                            <button
                                                                                onClick={() => respondToApplication(p.id, app.id, "declined")}
                                                                                style={{ width: "28px", height: "28px", borderRadius: "7px", border: `1px solid ${colors.border}`, background: colors.bgPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                                            >
                                                                                <X size={14} color={colors.textMuted} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => respondToApplication(p.id, app.id, "accepted")}
                                                                                style={{ width: "28px", height: "28px", borderRadius: "7px", border: "none", background: colors.accentBlue, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                                            >
                                                                                <Check size={14} color="#FFFFFF" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {app.proposalText && (
                                                                    <p style={{ fontSize: "0.82rem", color: colors.textSecondary, lineHeight: 1.5 }}>{app.proposalText}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
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

export default function ProjectsPage() {
    return (
        <RequireRole role="client">
            <ProjectsContent />
        </RequireRole>
    );
}
