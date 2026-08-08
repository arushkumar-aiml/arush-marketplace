"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { Sparkles, Wallet, Clock, ListChecks, PenLine } from "lucide-react";
import { db } from "../../../../lib/firebase";
import { useAuth } from "../../../../lib/useAuth";
import { useTheme } from "../../../../lib/useTheme";
import { SERVICE_CATEGORIES } from "../../../../lib/categories";
import RequireRole from "../../../../components/RequireRole";

interface GeneratedBrief {
  overview: string;
  budgetMin: number;
  budgetMax: number;
  timelineWeeksMin: number;
  timelineWeeksMax: number;
  skills: string[];
}

function PostProjectForm() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [stage, setStage] = useState<"describe" | "generating" | "review">("describe");
  const [idea, setIdea] = useState("");
  const [genError, setGenError] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [timelineDays, setTimelineDays] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [aiScope, setAiScope] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!idea.trim() || !user) return;
    setStage("generating");
    setGenError("");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/scope-project", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: idea.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate a brief");

      const brief = data as GeneratedBrief;
      setTitle(idea.trim().slice(0, 70));
      setDescription(brief.overview);
      setAiScope(brief.overview);
      setBudget(String(Math.round((brief.budgetMin + brief.budgetMax) / 2)));
      setTimelineDays(String(Math.round(((brief.timelineWeeksMin + brief.timelineWeeksMax) / 2) * 7)));
      setSkills(brief.skills || []);
      setStage("review");
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Adeel AI couldn't generate a brief. Try again or write it manually.");
      setStage("describe");
    }
  }

  function skipToManual() {
    setDescription(idea);
    setStage("review");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    try {
      const projectRef = await addDoc(collection(db, "projects"), {
        clientId: user.uid,
        title,
        category: category || null,
        rawDescription: description,
        budget: Number(budget),
        timelineDays: Number(timelineDays),
        status: "open",
        createdAt: Date.now(),
        ...(aiScope ? { aiScope } : {}),
        ...(skills.length ? { aiSkillTags: skills } : {}),
      });

      fetch("/api/ml/recommend-freelancers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: projectRef.id, title, description }),
      }).catch((err) => console.error("Freelancer recommendation error:", err));

      router.push("/dashboard/client");
    } catch (err) {
      setError("Couldn't post the project. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "2rem", maxWidth: "680px", margin: "0 auto", background: colors.bgCanvas }}>
      <button
        onClick={() => router.push("/dashboard/client")}
        style={{ background: "none", border: "none", color: colors.textMuted, cursor: "pointer", marginBottom: "1.5rem", fontSize: "0.9rem" }}
      >
        ← Back to dashboard
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
        <Sparkles size={20} color={colors.accentBlue} />
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
          Post a project
        </h1>
      </div>
      <p style={{ color: colors.textMuted, marginBottom: "2rem" }}>
        Describe your idea in plain language — Adeel AI will draft the brief, budget, and timeline for you.
      </p>

      {stage !== "review" && (
        <div style={{ background: colors.bgPrimary, border: `1px solid ${colors.border}`, borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.85rem", color: colors.textSecondary, marginBottom: "0.6rem" }}>
            What do you need built?
          </label>
          <textarea
            required
            rows={5}
            placeholder="e.g. I need a landing page for my startup with a waitlist signup form and modern design."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            disabled={stage === "generating"}
            style={{
              width: "100%", padding: "0.85rem", borderRadius: "10px", border: `1px solid ${colors.border}`,
              boxSizing: "border-box", resize: "none", background: colors.bgSecondary, color: colors.textPrimary,
              fontFamily: "inherit", fontSize: "0.9rem", outline: "none", marginBottom: "1rem",
            }}
          />

          {genError && <p style={{ color: colors.danger, fontSize: "0.85rem", marginBottom: "1rem" }}>{genError}</p>}

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!idea.trim() || stage === "generating"}
              style={{
                flex: 1, minWidth: "200px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                padding: "0.85rem", borderRadius: "10px", border: "none", background: colors.accentBlue, color: "#fff",
                fontWeight: 700, cursor: stage === "generating" ? "default" : "pointer", opacity: !idea.trim() ? 0.6 : 1,
              }}
            >
              <Sparkles size={16} />
              {stage === "generating" ? "Adeel AI is drafting your brief..." : "Generate Brief with Adeel AI"}
            </button>
            <button
              type="button"
              onClick={skipToManual}
              disabled={!idea.trim() || stage === "generating"}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.85rem 1rem", borderRadius: "10px",
                border: `1px solid ${colors.border}`, background: colors.bgSecondary, color: colors.textSecondary,
                fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
              }}
            >
              <PenLine size={14} /> Write manually
            </button>
          </div>
        </div>
      )}

      {stage === "review" && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {aiScope && (
            <div style={{ background: colors.accentBlueSoft, border: `1px solid ${colors.accentBlue}40`, borderRadius: "12px", padding: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                <Sparkles size={14} color={colors.accentBlue} />
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: colors.accentBlue }}>Adeel AI Brief</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>{aiScope}</p>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: colors.textSecondary, marginBottom: "0.5rem" }}>
              Project title
            </label>
            <input
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              style={inputStyle(colors)}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: colors.textSecondary, marginBottom: "0.5rem" }}>
              Category
            </label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle(colors)}>
              <option value="">Select a category (optional)</option>
              {SERVICE_CATEGORIES.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.services.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: colors.textSecondary, marginBottom: "0.5rem" }}>
              Description
            </label>
            <textarea
              required rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle(colors), resize: "none" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", color: colors.textSecondary, marginBottom: "0.5rem" }}>
                <Wallet size={13} /> Budget (₹)
              </label>
              <input type="number" required min={0} value={budget} onChange={(e) => setBudget(e.target.value)} style={inputStyle(colors)} />
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", color: colors.textSecondary, marginBottom: "0.5rem" }}>
                <Clock size={13} /> Timeline (days)
              </label>
              <input type="number" required min={1} value={timelineDays} onChange={(e) => setTimelineDays(e.target.value)} style={inputStyle(colors)} />
            </div>
          </div>

          {skills.length > 0 && (
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", color: colors.textSecondary, marginBottom: "0.5rem" }}>
                <ListChecks size={13} /> Required skills
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {skills.map((s) => (
                  <span key={s} style={{ fontSize: "0.75rem", background: colors.bgSecondary, color: colors.textSecondary, padding: "0.35rem 0.75rem", borderRadius: "999px", border: `1px solid ${colors.border}` }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {error && <p style={{ color: colors.danger, fontSize: "0.875rem" }}>{error}</p>}

          <button
            type="submit" disabled={loading}
            style={{ padding: "0.9rem", borderRadius: "10px", border: "none", background: colors.accentBlue, color: "#fff", fontWeight: 700, cursor: "pointer" }}
          >
            {loading ? "Posting..." : "Post project"}
          </button>
        </form>
      )}
    </main>
  );
}

function inputStyle(colors: ReturnType<typeof useTheme>["colors"]) {
  return {
    width: "100%", padding: "0.75rem", borderRadius: "8px", border: `1px solid ${colors.border}`,
    boxSizing: "border-box" as const, background: colors.bgSecondary, color: colors.textPrimary, fontFamily: "inherit", fontSize: "0.9rem", outline: "none",
  };
}

export default function PostProjectPage() {
  return (
    <RequireRole role="client">
      <PostProjectForm />
    </RequireRole>
  );
}
