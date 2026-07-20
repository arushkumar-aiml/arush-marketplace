"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Send,
} from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../lib/useAuth";
import { useTheme } from "../../lib/useTheme";
import type { ProjectBrief } from "../../types/brief";

interface Message {
    id: string;
    role: "user" | "ai";
    text: string;
    time: string;
}

export default function AIChatPanel({
    onBriefGenerated,
}: {
    onBriefGenerated: (brief: ProjectBrief) => void;
}) {
    const { user } = useAuth();
    const { colors } = useTheme();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "ai",
            text: "Hi! Describe your project in plain language — I'll generate a scope, budget, timeline, and required skills for you.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
    ]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);

    async function handleSend() {
        const trimmed = input.trim();
        if (!trimmed || isThinking) return;

        const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const userMessage: Message = { id: Date.now().toString(), role: "user", text: trimmed, time: now };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsThinking(true);

        try {
            if (!user) throw new Error("Please sign in before using Adeel AI.");
            const res = await fetch("/api/scope-project", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
                body: JSON.stringify({ message: trimmed }),
            });

            if (!res.ok) {
                throw new Error("AI scoping failed");
            }

            const brief: ProjectBrief = await res.json();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                text: `Got it! I've generated your project brief — check the panel on the right for the full breakdown of budget, timeline, and required skills.`,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setMessages((prev) => [...prev, aiMessage]);

            let logId: string | undefined;
            if (user) {
                const logRef = await addDoc(collection(db, "adeel-trainer-logs"), {
                    clientId: user.uid,
                    clientMessage: trimmed,
                    aiOutput: brief,
                    createdAt: Date.now(),
                    feedback: null,
                    correctionNote: null,
                });
                logId = logRef.id;
            }

            onBriefGenerated({ ...brief, logId, originalMessage: trimmed });
        } catch (err: unknown) {
            console.error("Scoping error:", err);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                text: "Sorry, I couldn't generate a brief right now. Please try again.",
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsThinking(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            handleSend();
        }
    }

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: colors.bgPrimary, borderLeft: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "50%", background: colors.codeBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: colors.accentBlue, fontSize: "1.1rem" }}>✦</span>
                        <span style={{ position: "absolute", bottom: 0, right: 0, width: "10px", height: "10px", borderRadius: "50%", background: colors.success, border: `2px solid ${colors.bgPrimary}` }} />
                    </div>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontWeight: 600, color: colors.textPrimary }}>Adeel AI</span>
                            <span style={{ fontSize: "0.7rem", background: colors.accentBlueSoft, color: colors.accentBlue, fontWeight: 500, padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
                                AI Assistant
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {messages.map((m) => (
                    <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "0.5rem" }}>
                        {m.role === "ai" && (
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: colors.codeBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: colors.accentBlue }}>
                                ✦
                            </div>
                        )}
                        <div
                            style={{
                                maxWidth: "75%",
                                borderRadius: "16px",
                                padding: "0.75rem 1rem",
                                fontSize: "0.9rem",
                                lineHeight: 1.6,
                                background: m.role === "user" ? colors.accentBlueSoft : colors.bgSecondary,
                                color: colors.textPrimary,
                            }}
                        >
                            {m.text}
                            <div style={{ fontSize: "0.7rem", color: colors.textMuted, marginTop: "0.4rem" }}>{m.time}</div>
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", paddingLeft: "2.5rem" }}>
                        {[0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                style={{ width: "6px", height: "6px", borderRadius: "50%", background: colors.accentBlue }}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div style={{ padding: "0 1.5rem 1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "0.6rem 0.75rem", marginBottom: "0.75rem" }}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your project..."
                        style={{ flex: 1, fontSize: "0.9rem", border: "none", outline: "none", background: "transparent", color: colors.textPrimary }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isThinking}
                        style={{ width: "36px", height: "36px", borderRadius: "8px", background: colors.accentBlue, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: isThinking ? 0.6 : 1 }}
                    >
                        <Send size={16} color="#FFFFFF" />
                    </button>
                </div>
            </div>
        </div>
    );
}
