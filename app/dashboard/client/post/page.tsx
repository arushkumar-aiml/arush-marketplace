"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useAuth } from "../../../../lib/useAuth";
import RequireRole from "../../../../components/RequireRole";

function PostProjectForm() {
    const { user } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [timelineDays, setTimelineDays] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;
        setError("");
        setLoading(true);

        try {
            const projectRef = await addDoc(collection(db, "projects"), {
                clientId: user.uid,
                title,
                rawDescription: description,
                budget: Number(budget),
                timelineDays: Number(timelineDays),
                status: "draft",
                createdAt: Date.now(),
            });

            fetch("/api/ml/recommend-freelancers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: projectRef.id,
                    title,
                    description,
                }),
            }).catch((err) => console.error("Freelancer recommendation error:", err));

            router.push("/dashboard/client");
        } catch (err) {
            setError("Couldn't post the project. Try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ minHeight: "100vh", padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
            <button
                onClick={() => router.push("/dashboard/client")}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer", marginBottom: "1.5rem" }}
            >
                ← Back to dashboard
            </button>

            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Post a project
            </h1>
            <p style={{ color: "#666", marginBottom: "2rem" }}>
                Describe what you need in plain language.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>
                        Project title
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. Build a landing page for my startup"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>
                        Describe what you need
                    </label>
                    <textarea
                        required
                        rows={6}
                        placeholder="Explain the project like you would to a freelancer over chat."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box", resize: "none" }}
                    />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>
                            Budget (₹)
                        </label>
                        <input
                            type="number"
                            required
                            min={0}
                            placeholder="25000"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>
                            Timeline (days)
                        </label>
                        <input
                            type="number"
                            required
                            min={1}
                            placeholder="14"
                            value={timelineDays}
                            onChange={(e) => setTimelineDays(e.target.value)}
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
                        />
                    </div>
                </div>

                {error && <p style={{ color: "red", fontSize: "0.875rem" }}>{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: "0.75rem", borderRadius: "8px", border: "none", background: "#2563EB", color: "white", fontWeight: 600, cursor: "pointer" }}
                >
                    {loading ? "Posting..." : "Post project"}
                </button>
            </form>
        </main>
    );
}

export default function PostProjectPage() {
    return (
        <RequireRole role="client">
            <PostProjectForm />
        </RequireRole>
    );
}
