"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    MoreHorizontal,
    Paperclip,
    Mic,
    Send,
    Link2,
    Clock,
    Wallet,
} from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../lib/useAuth";
import type { ProjectBrief } from "../../types/brief";

interface Message {
    id: string;
    role: "user" | "ai";
    text: string;
    time: string;
}

const quickActions = [
    { label: "Add reference", icon: Link2 },
    { label: "Attach files", icon: Paperclip },
    { label: "Add budget range", icon: Wallet },
    { label: "Specify timeline", icon: Clock },
];

export default function AIChatPanel({
    onBriefGenerated,
}: {
    onBriefGenerated: (brief: ProjectBrief) => void;
}) {
    const { user } = useAuth();
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
            const res = await fetch("/api/scope-project", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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

            // Log this exchange for Adeel Trainer (future fine-tuning dataset)
            // Capture the generated doc ID so feedback (thumbs up/down) can be
            // attached to this exact log entry later from BriefPanel.
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

            onBriefGenerated({ ...brief, logId });
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
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "white", borderLeft: "1px solid #E8E9ED", borderRight: "1px solid #E8E9ED" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "1px solid #E8E9ED" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "50%", background: "#0B0C10", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#2563EB", fontSize: "1.1rem" }}>✦</span>
                        <span style={{ position: "absolute", bottom: 0, right: 0, width: "10px", height: "10px", borderRadius: "50%", background: "#22C55E", border: "2px solid white" }} />
                    </div>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontWeight: 600, color: "#12131A" }}>Adeel AI</span>
                            <span style={{ fontSize: "0.7rem", background: "#EFF3FF", color: "#2563EB", fontWeight: 500, padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
                                AI Assistant
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", border: "1px solid #E8E9ED", background: "white", cursor: "pointer" }}>
                        <FileText size={16} color="#4A4C56" />
                    </button>
                    <button style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", border: "1px solid #E8E9ED", background: "white", cursor: "pointer" }}>
                        <MoreHorizontal size={16} color="#4A4C56" />
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {messages.map((m) => (
                    <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "0.5rem" }}>
                        {m.role === "ai" && (
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#0B0C10", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#2563EB" }}>
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
                                background: m.role === "user" ? "#EFF3FF" : "#F7F8FA",
                                color: "#12131A",
                            }}
                        >
                            {m.text}
                            <div style={{ fontSize: "0.7rem", color: "#9A9CA5", marginTop: "0.4rem" }}>{m.time}</div>
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", paddingLeft: "2.5rem" }}>
                        {[0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2563EB" }}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div style={{ padding: "0 1.5rem 1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid #E8E9ED", borderRadius: "12px", padding: "0.6rem 0.75rem", marginBottom: "0.75rem" }}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your project..."
                        style={{ flex: 1, fontSize: "0.9rem", border: "none", outline: "none" }}
                    />
                    <button style={{ background: "none", border: "none", color: "#9A9CA5", cursor: "pointer" }}>
                        <Paperclip size={18} />
                    </button>
                    <button style={{ background: "none", border: "none", color: "#9A9CA5", cursor: "pointer" }}>
                        <Mic size={18} />
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isThinking}
                        style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#2563EB", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: isThinking ? 0.6 : 1 }}
                    >
                        <Send size={16} color="white" />
                    </button>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {quickActions.map((a) => (
                        <button
                            key={a.label}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                fontSize: "0.75rem",
                                color: "#4A4C56",
                                border: "1px solid #E8E9ED",
                                borderRadius: "999px",
                                padding: "0.4rem 0.75rem",
                                background: "white",
                                cursor: "pointer",
                            }}
                        >
                            <a.icon size={13} />
                            {a.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}