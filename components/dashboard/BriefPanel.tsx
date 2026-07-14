"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Wallet, Clock, ThumbsUp, ThumbsDown, Check, FileStack } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useTheme } from "../../lib/useTheme";
import type { ProjectBrief } from "../../types/brief";

type FeedbackState = "up" | "down" | null;

export default function BriefPanel({ brief }: { brief: ProjectBrief | null }) {
    const router = useRouter();
    const { colors } = useTheme();
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [correctionNote, setCorrectionNote] = useState("");
    const [showCorrectionBox, setShowCorrectionBox] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setFeedback(null);
        setCorrectionNote("");
        setShowCorrectionBox(false);
        setSaved(false);
    }, [brief?.logId]);

    async function submitFeedback(value: "up" | "down", note?: string) {
        if (!brief?.logId) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, "adeel-trainer-logs", brief.logId), {
                feedback: value,
                correctionNote: note ?? null,
            });
            setFeedback(value);
            setSaved(true);
        } catch (err: unknown) {
            console.error("Feedback save error:", err);
        } finally {
            setSaving(false);
        }
    }

    function handleThumbsUp() {
        setShowCorrectionBox(false);
        submitFeedback("up");
    }

    function handleThumbsDown() {
        setShowCorrectionBox(true);
        setFeedback("down");
    }

    function handleCorrectionSubmit() {
        submitFeedback("down", correctionNote.trim() || undefined);
        setShowCorrectionBox(false);
    }

    function handleUpgradeToPRD() {
        if (!brief) return;
        sessionStorage.setItem("adeel-planning-brief", JSON.stringify(brief));
        sessionStorage.setItem("adeel-planning-message", brief.originalMessage || "");
        router.push("/dashboard/client/planning-agent");
    }

    return (
        <aside style={{ width: "380px", flexShrink: 0, background: colors.bgPrimary, height: "100vh", position: "sticky", top: 0, overflowY: "auto", padding: "1.5rem 1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <Sparkles size={16} color={colors.accentBlue} />
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: colors.textPrimary }}>Adeel AI Generated Brief</span>
            </div>

            {!brief ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: colors.textMuted }}>
                    <p style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                        Describe your project in the chat to generate a brief with budget, timeline, and required skills.
                    </p>
                </div>
            ) : (
                <>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: colors.textPrimary, marginBottom: "0.5rem" }}>
                        Project Overview
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: colors.textSecondary, lineHeight: 1.6, marginBottom: "1.5rem" }}>
                        {brief.overview}
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                        <div style={{ border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "0.85rem" }}>
                            <Wallet size={16} color={colors.accentBlue} style={{ marginBottom: "0.5rem" }} />
                            <div style={{ fontSize: "0.7rem", color: colors.textMuted, marginBottom: "0.15rem" }}>Estimated Budget</div>
                            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: colors.textPrimary }}>
                                ${brief.budgetMin.toLocaleString()} – ${brief.budgetMax.toLocaleString()}
                            </div>
                        </div>
                        <div style={{ border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "0.85rem" }}>
                            <Clock size={16} color={colors.accentBlue} style={{ marginBottom: "0.5rem" }} />
                            <div style={{ fontSize: "0.7rem", color: colors.textMuted, marginBottom: "0.15rem" }}>Timeline</div>
                            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: colors.textPrimary }}>
                                {brief.timelineWeeksMin} – {brief.timelineWeeksMax} Weeks
                            </div>
                        </div>
                    </div>

                    <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: colors.textPrimary, marginBottom: "0.75rem" }}>
                        Required Skills
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                        {brief.skills.map((s) => (
                            <span key={s} style={{ fontSize: "0.75rem", background: colors.bgSecondary, color: colors.textSecondary, padding: "0.4rem 0.75rem", borderRadius: "999px", border: `1px solid ${colors.border}` }}>
                                {s}
                            </span>
                        ))}
                    </div>

                    {brief.logId && (
                        <div style={{ border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "0.85rem", marginBottom: "1.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "0.8rem", color: colors.textSecondary }}>
                                    Was this brief accurate?
                                </span>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button
                                        onClick={handleThumbsUp}
                                        disabled={saving}
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "8px",
                                            border: "1px solid " + (feedback === "up" ? colors.success : colors.border),
                                            background: feedback === "up" ? colors.successSoft : colors.bgPrimary,
                                            cursor: saving ? "default" : "pointer",
                                        }}
                                    >
                                        <ThumbsUp size={15} color={feedback === "up" ? colors.success : colors.textMuted} />
                                    </button>
                                    <button
                                        onClick={handleThumbsDown}
                                        disabled={saving}
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "8px",
                                            border: "1px solid " + (feedback === "down" ? colors.danger : colors.border),
                                            background: feedback === "down" ? colors.dangerSoft : colors.bgPrimary,
                                            cursor: saving ? "default" : "pointer",
                                        }}
                                    >
                                        <ThumbsDown size={15} color={feedback === "down" ? colors.danger : colors.textMuted} />
                                    </button>
                                </div>
                            </div>

                            {showCorrectionBox && (
                                <div style={{ marginTop: "0.75rem" }}>
                                    <textarea
                                        value={correctionNote}
                                        onChange={(e) => setCorrectionNote(e.target.value)}
                                        placeholder="What was wrong? (budget, timeline, skills, overview...)"
                                        rows={3}
                                        style={{
                                            width: "100%",
                                            fontSize: "0.8rem",
                                            padding: "0.6rem",
                                            borderRadius: "8px",
                                            border: `1px solid ${colors.border}`,
                                            resize: "vertical",
                                            boxSizing: "border-box",
                                            fontFamily: "inherit",
                                            outline: "none",
                                            background: colors.bgPrimary,
                                            color: colors.textPrimary,
                                        }}
                                    />
                                    <button
                                        onClick={handleCorrectionSubmit}
                                        disabled={saving}
                                        style={{
                                            marginTop: "0.5rem",
                                            fontSize: "0.8rem",
                                            fontWeight: 600,
                                            color: colors.bgPrimary,
                                            background: colors.textPrimary,
                                            border: "none",
                                            borderRadius: "8px",
                                            padding: "0.5rem 0.9rem",
                                            cursor: saving ? "default" : "pointer",
                                            opacity: saving ? 0.6 : 1,
                                        }}
                                    >
                                        Submit feedback
                                    </button>
                                </div>
                            )}

                            {saved && !showCorrectionBox && (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.6rem", fontSize: "0.75rem", color: colors.success }}>
                                    <Check size={13} />
                                    Thanks, feedback saved.
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleUpgradeToPRD}
                        style={{
                            width: "100%",
                            background: colors.bgPrimary,
                            color: colors.textPrimary,
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            borderRadius: "12px",
                            border: `1.5px solid ${colors.accentGold}`,
                            padding: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            cursor: "pointer",
                            marginBottom: "0.75rem",
                        }}
                    >
                        <FileStack size={15} color={colors.accentGold} />
                        Upgrade to Full PRD
                    </button>

                    <button
                        style={{
                            width: "100%",
                            background: colors.accentBlue,
                            color: "#FFFFFF",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            borderRadius: "12px",
                            border: "none",
                            padding: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            cursor: "pointer",
                        }}
                    >
                        <Sparkles size={15} />
                        Create Project with This Brief
                    </button>
                </>
            )}
        </aside>
    );
}