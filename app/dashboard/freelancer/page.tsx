"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, orderBy, getDocs, addDoc, getDoc, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../lib/useAuth";
import { useTheme } from "../../../lib/useTheme";
import RequireRole from "../../../components/RequireRole";
import Sidebar from "../../../components/dashboard/Sidebar";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import type { Project } from "../../../types/project";
import { Wallet, Clock, Briefcase, CheckCircle2, TrendingUp, Sparkles, X, Send } from "lucide-react";

function calculateMatch(projectText: string, skills: string[]): number {
    if (!skills.length) return 70;
    const lowerText = projectText.toLowerCase();
    const matched = skills.filter((s) => lowerText.includes(s.toLowerCase())).length;
    const ratio = matched / skills.length;
    return Math.min(99, Math.max(65, Math.round(65 + ratio * 34)));
}

type ModalStage = "generating" | "editing" | "submitting" | "error";

function FreelancerDashboardContent() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set());

    const [modalProject, setModalProject] = useState<Project | null>(null);
    const [modalStage, setModalStage] = useState<ModalStage>("generating");
    const [proposalText, setProposalText] = useState("");
    const [modalError, setModalError] = useState("");

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

    async function openApplyModal(project: Project) {
        setModalProject(project);
        setModalStage("generating");
        setModalError("");
        setProposalText("");

        try {
            const res = await fetch("/api/generate-proposal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project,
                    freelancerProfile: {
                        displayName: profile?.displayName,
                        skills: profile?.skills,
                        bio: profile?.bio,
                    },
                }),
            });
            if (!res.ok) throw new Error("Failed to generate proposal");
            const data = await res.json();
            setProposalText(data.proposal || "");
            setModalStage("editing");
        } catch (err: unknown) {
            console.error(err);
            setModalError("Couldn't generate a proposal. You can still write one manually below.");
            setModalStage("editing");
        }
    }

    function closeModal() {
        setModalProject(null);
        setModalStage("generating");
        setProposalText("");
        setModalError("");
    }

    async function submitProposal() {
        if (!modalProject || !user || !profile || !proposalText.trim()) return;
        setModalStage("submitting");
        try {
            await addDoc(collection(db, "applications"), {
                projectId: modalProject.id,
                freelancerId: user.uid,
                freelancerName: profile.displayName,
                status: "interested",
                createdAt: Date.now(),
                proposalText: proposalText.trim(),
            });

            // Auto-create a conversation so client and freelancer can start chatting
            const clientSnap = await getDoc(doc(db, "users", modalProject.clientId));
            const clientName = clientSnap.exists()
                ? clientSnap.data().displayName || "Client"
                : "Client";

            await addDoc(collection(db, "conversations"), {
                projectId: modalProject.id,
                projectTitle: modalProject.title,
                clientId: modalProject.clientId,
                clientName,
                freelancerId: user.uid,
                freelancerName: profile.displayName,
                lastMessage: proposalText.trim(),
                lastMessageAt: Date.now(),
                createdAt: Date.now(),
            });

            await addDoc(collection(db, "notifications"), {
                recipientId: modalProject.clientId,
                type: "application",
                message: `${profile.displayName} sent a proposal for ${modalProject.title}.`,
                read: false,
                createdAt: Date.now(),
                link: "/dashboard/client/projects",
            });

            setRespondedIds((prev) => new Set(prev).add(modalProject.id));
            closeModal();
        } catch (err: unknown) {
            console.error(err);
            setModalError("Couldn't submit your proposal. Please try again.");
            setModalStage("editing");
        }
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
                                                        onClick={() => openApplyModal(p)}
                                                        style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", background: colors.accentBlue, color: "#FFFFFF", border: "none", borderRadius: "999px", padding: "0.4rem 1rem", cursor: "pointer" }}
                                                    >
                                                        <Sparkles size={13} />
                                                        Apply with AI
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

            {modalProject && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "1rem",
                    }}
                    onClick={closeModal}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: colors.bgPrimary,
                            borderRadius: "16px",
                            padding: "1.75rem",
                            width: "100%",
                            maxWidth: "560px",
                            maxHeight: "85vh",
                            overflowY: "auto",
                            border: `1px solid ${colors.border}`,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Sparkles size={17} color={colors.accentBlue} />
                                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: colors.textPrimary }}>
                                    Apply to &quot;{modalProject.title}&quot;
                                </h2>
                            </div>
                            <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted }}>
                                <X size={20} />
                            </button>
                        </div>

                        {modalStage === "generating" && (
                            <div style={{ textAlign: "center", padding: "2.5rem 0", color: colors.textSecondary }}>
                                Adeel AI is drafting your proposal...
                            </div>
                        )}

                        {(modalStage === "editing" || modalStage === "submitting") && (
                            <>
                                <p style={{ fontSize: "0.8rem", color: colors.textMuted, marginBottom: "0.6rem" }}>
                                    AI-generated draft — feel free to edit before sending.
                                </p>
                                <textarea
                                    value={proposalText}
                                    onChange={(e) => setProposalText(e.target.value)}
                                    rows={9}
                                    style={{
                                        width: "100%",
                                        fontSize: "0.875rem",
                                        padding: "0.85rem",
                                        borderRadius: "10px",
                                        border: `1px solid ${colors.border}`,
                                        resize: "vertical",
                                        boxSizing: "border-box",
                                        fontFamily: "inherit",
                                        outline: "none",
                                        background: colors.bgSecondary,
                                        color: colors.textPrimary,
                                        lineHeight: 1.6,
                                    }}
                                />
                                {modalError && (
                                    <p style={{ color: colors.danger, fontSize: "0.8rem", marginTop: "0.5rem" }}>{modalError}</p>
                                )}
                                <button
                                    onClick={submitProposal}
                                    disabled={modalStage === "submitting" || !proposalText.trim()}
                                    style={{
                                        marginTop: "1rem",
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.5rem",
                                        background: colors.accentBlue,
                                        color: "#FFFFFF",
                                        border: "none",
                                        borderRadius: "10px",
                                        padding: "0.8rem",
                                        fontSize: "0.9rem",
                                        fontWeight: 600,
                                        cursor: modalStage === "submitting" ? "default" : "pointer",
                                        opacity: modalStage === "submitting" || !proposalText.trim() ? 0.6 : 1,
                                    }}
                                >
                                    <Send size={15} />
                                    {modalStage === "submitting" ? "Sending..." : "Send Proposal"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
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
