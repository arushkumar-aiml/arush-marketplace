"use client";

import { useState, useEffect } from "react";
import { Sparkles, Wallet, Clock, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { ProjectBrief } from "../../types/brief";

type FeedbackState = "up" | "down" | null;

export default function BriefPanel({ brief }: { brief: ProjectBrief | null }) {
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [correctionNote, setCorrectionNote] = useState("");
    const [showCorrectionBox, setShowCorrectionBox] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Reset feedback UI whenever a new brief comes in
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

    return (
        <aside style={{ width: "380px", flexShrink: 0, background: "white", height: "100vh", position: "sticky", top: 0, overflowY: "auto", padding: "1.5rem 1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <Sparkles size={16} color="#2563EB" />
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#12131A" }}>Adeel AI Generated Brief</span>
            </div>

            {!brief ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9A9CA5" }}>
                    <p style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                        Describe your project in the chat to generate a brief with budget, timeline, and required skills.
                    </p>
                </div>
            ) : (
                <>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#12131A", marginBottom: "0.5rem" }}>
                        Project Overview
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "#4A4C56", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                        {brief.overview}
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                        <div style={{ border: "1px solid #E8E9ED", borderRadius: "12px", padding: "0.85rem" }}>
                            <Wallet size={16} color="#2563EB" style={{ marginBottom: "0.5rem" }} />
                            <div style={{ fontSize: "0.7rem", color: "#9A9CA5", marginBottom: "0.15rem" }}>Estimated Budget</div>
                            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#12131A" }}>
                                ${brief.budgetMin.toLocaleString()} – ${brief.budgetMax.toLocaleString()}
                            </div>
                        </div>
                        <div style={{ border: "1px solid #E8E9ED", borderRadius: "12px", padding: "0.85rem" }}>
                            <Clock size={16} color="#2563EB" style={{ marginBottom: "0.5rem" }} />
                            <div style={{ fontSize: "0.7rem", color: "#9A9CA5", marginBottom: "0.15rem" }}>Timeline</div>
                            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#12131A" }}>
                                {brief.timelineWeeksMin} – {brief.timelineWeeksMax} Weeks
                            </div>
                        </div>
                    </div>

                    <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#12131A", marginBottom: "0.75rem" }}>
                        Required Skills
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                        {brief.skills.map((s) => (
                            <span key={s} style={{ fontSize: "0.75rem", background: "#F7F8FA", color: "#4A4C56", padding: "0.4rem 0.75rem", borderRadius: "999px", border: "1px solid #E8E9ED" }}>
                                {s}
                            </span>
                        ))}
                    </div>

                    {/* Adeel Trainer feedback */}
                    {brief.logId && (
                        <div style={{ border: "1px solid #E8E9ED", borderRadius: "12px", padding: "0.85rem", marginBottom: "1.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "0.8rem", color: "#4A4C56" }}>
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
                                            border: "1px solid " + (feedback === "up" ? "#22C55E" : "#E8E9ED"),
                                            background: feedback === "up" ? "#F0FDF4" : "white",
                                            cursor: saving ? "default" : "pointer",
                                        }}
                                    >
                                        <ThumbsUp size={15} color={feedback === "up" ? "#22C55E" : "#9A9CA5"} />
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
                                            border: "1px solid " + (feedback === "down" ? "#F87171" : "#E8E9ED"),
                                            background: feedback === "down" ? "#FEF2F2" : "white",
                                            cursor: saving ? "default" : "pointer",
                                        }}
                                    >
                                        <ThumbsDown size={15} color={feedback === "down" ? "#F87171" : "#9A9CA5"} />
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
                                            border: "1px solid #E8E9ED",
                                            resize: "vertical",
                                            boxSizing: "border-box",
                                            fontFamily: "inherit",
                                            outline: "none",
                                        }}
                                    />
                                    <button
                                        onClick={handleCorrectionSubmit}
                                        disabled={saving}
                                        style={{
                                            marginTop: "0.5rem",
                                            fontSize: "0.8rem",
                                            fontWeight: 600,
                                            color: "white",
                                            background: "#12131A",
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
                                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.6rem", fontSize: "0.75rem", color: "#22C55E" }}>
                                    <Check size={13} />
                                    Thanks, feedback saved.
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        style={{
                            width: "100%",
                            background: "#2563EB",
                            color: "white",
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