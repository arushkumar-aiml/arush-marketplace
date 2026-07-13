"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Sparkles,
    ArrowLeft,
    Target,
    Layers,
    Wrench,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";
import RequireRole from "../../../../components/RequireRole";
import type { ProjectBrief } from "../../../../types/brief";
import type { ClarifyingQuestion, FullPRD } from "../../../../types/prd";

type Stage = "loading" | "no-brief" | "clarifying" | "generating" | "result" | "error";

function PlanningAgentContent() {
    const router = useRouter();
    const [stage, setStage] = useState<Stage>("loading");
    const [originalMessage, setOriginalMessage] = useState("");
    const [brief, setBrief] = useState<ProjectBrief | null>(null);
    const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [prd, setPrd] = useState<FullPRD | null>(null);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const storedBrief = sessionStorage.getItem("adeel-planning-brief");
        const storedMessage = sessionStorage.getItem("adeel-planning-message");

        if (!storedBrief || !storedMessage) {
            setStage("no-brief");
            return;
        }

        const parsedBrief: ProjectBrief = JSON.parse(storedBrief);
        setBrief(parsedBrief);
        setOriginalMessage(storedMessage);
        fetchClarifyingQuestions(storedMessage, parsedBrief);
    }, []);

    async function fetchClarifyingQuestions(message: string, briefData: ProjectBrief) {
        setStage("loading");
        try {
            const res = await fetch("/api/planning-agent/clarify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ originalMessage: message, brief: briefData }),
            });
            if (!res.ok) throw new Error("Failed to fetch clarifying questions");
            const data = await res.json();
            setQuestions(data.questions ?? []);
            setStage("clarifying");
        } catch (err: unknown) {
            console.error(err);
            setErrorMsg("Couldn't generate clarifying questions. Please try again.");
            setStage("error");
        }
    }

    async function handleGeneratePRD() {
        if (!brief) return;
        setStage("generating");
        try {
            const answerList = questions.map((q) => ({
                questionId: q.id,
                question: q.question,
                answer: answers[q.id] || "No specific preference.",
            }));

            const res = await fetch("/api/planning-agent/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ originalMessage, brief, answers: answerList }),
            });
            if (!res.ok) throw new Error("Failed to generate PRD");
            const data: FullPRD = await res.json();
            setPrd(data);
            setStage("result");
        } catch (err: unknown) {
            console.error(err);
            setErrorMsg("Couldn't generate the full PRD. Please try again.");
            setStage("error");
        }
    }

    const sectionStyle: React.CSSProperties = {
        border: "1px solid #E8E9ED",
        borderRadius: "14px",
        padding: "1.25rem",
        marginBottom: "1.25rem",
        background: "white",
    };
    const sectionTitleStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "#12131A",
        marginBottom: "0.85rem",
    };

    return (
        <main style={{ minHeight: "100vh", background: "#F7F8FA", padding: "2rem" }}>
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>
                <button
                    onClick={() => router.push("/dashboard/client")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        background: "none",
                        border: "none",
                        color: "#4A4C56",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        marginBottom: "1.5rem",
                    }}
                >
                    <ArrowLeft size={15} />
                    Back to dashboard
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
                    <Sparkles size={20} color="#2563EB" />
                    <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#12131A" }}>Adeel AI Planning Agent</h1>
                </div>
                <p style={{ color: "#9A9CA5", fontSize: "0.9rem", marginBottom: "2rem" }}>
                    Turning your brief into a full PRD with milestones and tech stack recommendations.
                </p>

                {stage === "loading" && (
                    <div style={{ textAlign: "center", padding: "3rem", color: "#9A9CA5" }}>
                        Thinking through your project...
                    </div>
                )}

                {stage === "no-brief" && (
                    <div style={sectionStyle}>
                        <p style={{ color: "#4A4C56", fontSize: "0.9rem", lineHeight: 1.6 }}>
                            No brief found. Please generate a project brief with Adeel AI in the chat first, then click
                            &quot;Upgrade to Full PRD&quot;.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/client")}
                            style={{
                                marginTop: "1rem",
                                background: "#2563EB",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                padding: "0.7rem 1.2rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Go to dashboard
                        </button>
                    </div>
                )}

                {stage === "error" && (
                    <div style={sectionStyle}>
                        <p style={{ color: "#F87171", fontSize: "0.9rem" }}>{errorMsg}</p>
                        <button
                            onClick={() => brief && fetchClarifyingQuestions(originalMessage, brief)}
                            style={{
                                marginTop: "1rem",
                                background: "#12131A",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                padding: "0.7rem 1.2rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {stage === "clarifying" && (
                    <div style={sectionStyle}>
                        <div style={sectionTitleStyle}>
                            <Target size={16} color="#2563EB" />
                            A few quick questions before I write the PRD
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {questions.map((q) => (
                                <div key={q.id}>
                                    <label style={{ display: "block", fontSize: "0.85rem", color: "#12131A", marginBottom: "0.4rem" }}>
                                        {q.question}
                                    </label>
                                    <textarea
                                        value={answers[q.id] || ""}
                                        onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                                        placeholder="Your answer (optional)"
                                        rows={2}
                                        style={{
                                            width: "100%",
                                            fontSize: "0.85rem",
                                            padding: "0.65rem",
                                            borderRadius: "8px",
                                            border: "1px solid #E8E9ED",
                                            resize: "vertical",
                                            boxSizing: "border-box",
                                            fontFamily: "inherit",
                                            outline: "none",
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleGeneratePRD}
                            style={{
                                marginTop: "1.25rem",
                                width: "100%",
                                background: "#2563EB",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                padding: "0.85rem",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                            }}
                        >
                            <Sparkles size={15} />
                            Generate Full PRD
                        </button>
                    </div>
                )}

                {stage === "generating" && (
                    <div style={{ textAlign: "center", padding: "3rem", color: "#9A9CA5" }}>
                        Writing your PRD, milestones, and tech stack...
                    </div>
                )}

                {stage === "result" && prd && (
                    <>
                        <div style={sectionStyle}>
                            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#12131A", marginBottom: "0.5rem" }}>
                                {prd.title}
                            </h2>
                            <p style={{ fontSize: "0.875rem", color: "#4A4C56", lineHeight: 1.6 }}>{prd.problemStatement}</p>
                        </div>

                        <div style={sectionStyle}>
                            <div style={sectionTitleStyle}>
                                <Target size={16} color="#2563EB" />
                                Goals
                            </div>
                            <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "#4A4C56", fontSize: "0.875rem", lineHeight: 1.8 }}>
                                {prd.goals.map((g, i) => (
                                    <li key={i}>{g}</li>
                                ))}
                            </ul>
                        </div>

                        <div style={sectionStyle}>
                            <div style={sectionTitleStyle}>Scope</div>
                            <p style={{ fontSize: "0.875rem", color: "#4A4C56", lineHeight: 1.6, marginBottom: "0.75rem" }}>{prd.scope}</p>
                            {prd.outOfScope.length > 0 && (
                                <>
                                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9A9CA5", marginBottom: "0.4rem" }}>
                                        Out of scope
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "#9A9CA5", fontSize: "0.825rem", lineHeight: 1.7 }}>
                                        {prd.outOfScope.map((o, i) => (
                                            <li key={i}>{o}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>

                        <div style={sectionStyle}>
                            <div style={sectionTitleStyle}>
                                <Layers size={16} color="#2563EB" />
                                Milestones
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                                {prd.milestones.map((m, i) => (
                                    <div key={i} style={{ borderLeft: "2px solid #2563EB", paddingLeft: "0.9rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#12131A" }}>{m.title}</span>
                                            <span style={{ fontSize: "0.75rem", color: "#9A9CA5" }}>{m.durationWeeks}w</span>
                                        </div>
                                        <p style={{ fontSize: "0.8rem", color: "#4A4C56", lineHeight: 1.5, margin: "0.3rem 0" }}>
                                            {m.description}
                                        </p>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                                            {m.deliverables.map((d, j) => (
                                                <span
                                                    key={j}
                                                    style={{
                                                        fontSize: "0.7rem",
                                                        background: "#F7F8FA",
                                                        color: "#4A4C56",
                                                        padding: "0.25rem 0.6rem",
                                                        borderRadius: "999px",
                                                        border: "1px solid #E8E9ED",
                                                    }}
                                                >
                                                    {d}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={sectionStyle}>
                            <div style={sectionTitleStyle}>
                                <Wrench size={16} color="#2563EB" />
                                Tech Stack
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                                {prd.techStack.map((t, i) => (
                                    <div key={i} style={{ display: "flex", gap: "0.75rem" }}>
                                        <span
                                            style={{
                                                fontSize: "0.7rem",
                                                fontWeight: 600,
                                                color: "#2563EB",
                                                background: "#EFF3FF",
                                                padding: "0.25rem 0.55rem",
                                                borderRadius: "6px",
                                                height: "fit-content",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {t.category}
                                        </span>
                                        <div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#12131A" }}>{t.recommendation}</div>
                                            <div style={{ fontSize: "0.78rem", color: "#9A9CA5" }}>{t.reason}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {prd.risks.length > 0 && (
                            <div style={sectionStyle}>
                                <div style={sectionTitleStyle}>
                                    <AlertTriangle size={16} color="#C9A227" />
                                    Risks to watch
                                </div>
                                <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "#4A4C56", fontSize: "0.875rem", lineHeight: 1.8 }}>
                                    {prd.risks.map((r, i) => (
                                        <li key={i}>{r}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#22C55E", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                            <CheckCircle2 size={16} />
                            PRD generated. Full unlock (code scaffold) coming soon.
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

export default function PlanningAgentPage() {
    return (
        <RequireRole role="client">
            <PlanningAgentContent />
        </RequireRole>
    );
}