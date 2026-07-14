"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, orderBy, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../lib/useAuth";
import { useTheme } from "../../../lib/useTheme";
import RequireRole from "../../../components/RequireRole";
import Sidebar from "../../../components/dashboard/Sidebar";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import type { Project } from "../../../types/project";
import { Wallet, Clock, Briefcase, CheckCircle2, TrendingUp } from "lucide-react";

function calculateMatch(projectText: string, skills: string[]): number {
    if (!skills.length) return 70;
    const lowerText = projectText.toLowerCase();
    const matched = skills.filter((s) => lowerText.includes(s.toLowerCase())).length;
    const ratio = matched / skills.length;
    return Math.min(99, Math.max(65, Math.round(65 + ratio * 34)));
}

function FreelancerDashboardContent() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchOpenProjects() {
            const q = query(
                collection(db, "projects"),
                where("status", "==", "open"),
                orderBy("createdAt", "desc")
            );
            const snap = await getDocs(q);
            setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project));
            setLoadingProjects(false);
        }
        fetchOpenProjects();
    }, []);

    async function handleRespond(projectId: string, status: "accepted" | "declined") {
        if (!user) return;
        await addDoc(collection(db, "applications"), {
            projectId,
            freelancerId: user.uid,
            freelancerName: profile?.displayName || "Freelancer",
            status,
            createdAt: Date.now(),
        });
        setRespondedIds((prev) => new Set(prev).add(projectId));
    }

    const hasProfile = profile?.skills && profile.skills.length > 0;
    const acceptedCount = Array.from(respondedIds).length;

    const avgMatch =
        projects.length > 0
            ? Math.round(
                projects.reduce(
                    (sum, p) =>
                        sum + calculateMatch(`${p.title} ${p.rawDescription}`, profile?.skills || []),
                    0
                ) / projects.length
            )
            : 0;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: colors.bgPrimary }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <DashboardHeader
                    subtitle="Discover projects matched to your skills."
                    ctaLabel="Edit Profile"
                    onCtaClick={() => router.push("/dashboard/freelancer/profile")}
                />

                <div style={{ flex: 1, padding: "2rem", maxWidth: "820px", overflowY: "auto" }}>
                    {!hasProfile && (
                        <div
                            style={{
                                background: colors.accentGoldSoft,
                                border: `1px solid ${colors.accentGold}80`,
                                borderRadius: "12px",
                                padding: "1rem",
                                marginBottom: "2rem",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <p style={{ fontSize: "0.9rem", color: colors.textPrimary }}>
                                Complete your profile to start getting matched with projects.
                            </p>
                            <button
                                onClick={() => router.push("/dashboard/freelancer/profile")}
                                style={{ fontSize: "0.9rem", fontWeight: 600, color: colors.accentGold, background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap", marginLeft: "1rem" }}
                            >
                                Complete now →
                            </button>
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.9rem", marginBottom: "2rem" }}>
                        <div style={{ border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "1rem" }}>
                            <Briefcase size={16} color={colors.accentBlue} style={{ marginBottom: "0.5rem" }} />
                            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: colors.textPrimary }}>{projects.length}</div>
                            <div style={{ fontSize: "0.78rem", color: colors.textMuted }}>Open Projects</div>
                        </div>
                        <div style={{ border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "1rem" }}>
                            <CheckCircle2 size={16} color={colors.success} style={{ marginBottom: "0.5rem" }} />
                            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: colors.textPrimary }}>{acceptedCount}</div>
                            <div style={{ fontSize: "0.78rem", color: colors.textMuted }}>Responses Sent</div>
                        </div>
                        <div style={{ border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "1rem" }}>
                            <TrendingUp size={16} color={colors.accentGold} style={{ marginBottom: "0.5rem" }} />
                            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: colors.textPrimary }}>
                                {hasProfile ? `${avgMatch}%` : "—"}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: colors.textMuted }}>Avg. AI Match</div>
                        </div>
                    </div>

                    <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: colors.textPrimary, marginBottom: "1.5rem" }}>
                        Open Projects
                    </h2>

                    {loadingProjects ? (
                        <p style={{ color: colors.textMuted }}>Loading projects...</p>
                    ) : projects.length === 0 ? (
                        <div style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}`, borderRadius: "16px", padding: "2rem", textAlign: "center" }}>
                            <p style={{ color: colors.textMuted }}>No open projects right now. Check back soon.</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {projects.map((p) => {
                                const responded = respondedIds.has(p.id);
                                const match = calculateMatch(`${p.title} ${p.rawDescription}`, profile?.skills || []);
                                return (
                                    <div key={p.id} style={{ border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "1.25rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                            <h3 style={{ fontWeight: 600, color: colors.textPrimary }}>{p.title}</h3>
                                            <span
                                                style={{
                                                    fontSize: "0.75rem",
                                                    fontWeight: 700,
                                                    color: match >= 85 ? colors.success : colors.accentBlue,
                                                    background: match >= 85 ? colors.successSoft : colors.accentBlueSoft,
                                                    borderRadius: "999px",
                                                    padding: "0.25rem 0.7rem",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {match}% Match
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "0.9rem", color: colors.textSecondary, marginBottom: "1rem", lineHeight: 1.5 }}>
                                            {p.rawDescription}
                                        </p>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.8rem", color: colors.textMuted }}>
                                                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                                    <Wallet size={14} /> ₹{p.budget.toLocaleString()}
                                                </span>
                                                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                                    <Clock size={14} /> {p.timelineDays} days
                                                </span>
                                            </div>

                                            {responded ? (
                                                <span style={{ fontSize: "0.8rem", color: colors.textMuted }}>Response sent ✓</span>
                                            ) : (
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <button
                                                        onClick={() => handleRespond(p.id, "declined")}
                                                        style={{ fontSize: "0.8rem", border: `1px solid ${colors.border}`, background: colors.bgPrimary, color: colors.textPrimary, borderRadius: "999px", padding: "0.4rem 1rem", cursor: "pointer" }}
                                                    >
                                                        Decline
                                                    </button>
                                                    <button
                                                        onClick={() => handleRespond(p.id, "accepted")}
                                                        style={{ fontSize: "0.8rem", background: colors.accentBlue, color: "#FFFFFF", border: "none", borderRadius: "999px", padding: "0.4rem 1rem", cursor: "pointer" }}
                                                    >
                                                        Accept
                                                    </button>
                                                </div>
                                            )}
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

export default function FreelancerDashboardPage() {
    return (
        <RequireRole role="freelancer">
            <FreelancerDashboardContent />
        </RequireRole>
    );
}