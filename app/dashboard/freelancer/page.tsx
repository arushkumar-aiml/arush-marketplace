"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Briefcase, Clock, Search, Sparkles, Wallet, X } from "lucide-react";
import Sidebar from "../../../components/dashboard/Sidebar";
import AIChatPanel from "../../../components/dashboard/AIChatPanel";
import BriefPanel from "../../../components/dashboard/BriefPanel";
import RequireRole from "../../../components/RequireRole";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../lib/useAuth";
import { useTheme } from "../../../lib/useTheme";
import type { Project } from "../../../types/project";
import type { ProjectBrief } from "../../../types/brief";

function FreelancerDashboardContent() {
    const { user, profile } = useAuth();
    const { colors } = useTheme();
    const [projects, setProjects] = useState<Project[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [workingId, setWorkingId] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [showPlanner, setShowPlanner] = useState(false);
    const [brief, setBrief] = useState<ProjectBrief | null>(null);

    useEffect(() => {
        getDocs(query(collection(db, "projects"), where("status", "==", "open")))
            .then((snapshot) => setProjects(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Project).sort((a, b) => b.createdAt - a.createdAt)))
            .catch((error) => { console.error("Could not load open projects", error); setMessage("Projects could not be loaded. Please refresh and try again."); })
            .finally(() => setLoading(false));
    }, []);

    const visibleProjects = useMemo(() => {
        const needle = search.trim().toLowerCase();
        return projects.filter((project) => !needle || `${project.title} ${project.rawDescription} ${(project.aiSkillTags || []).join(" ")}`.toLowerCase().includes(needle));
    }, [projects, search]);

    async function applyWithAI(project: Project) {
        if (!user || !profile || workingId) return;
        setWorkingId(project.id); setMessage("");
        try {
            const token = await user.getIdToken();
            const response = await fetch("/api/generate-proposal", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ project, freelancerProfile: profile }) });
            const data = await response.json();
            if (!response.ok || !data.proposal) throw new Error(data.error || "AI proposal could not be generated");
            await addDoc(collection(db, "applications"), { projectId: project.id, freelancerId: user.uid, freelancerName: profile.displayName, status: "interested", proposalText: data.proposal, createdAt: new Date().valueOf() });
            setProjects((current) => current.filter((item) => item.id !== project.id));
            setMessage("Your AI-generated proposal was sent successfully.");
        } catch (error) { setMessage(error instanceof Error ? error.message : "Could not submit your proposal. Please try again."); }
        finally { setWorkingId(null); }
    }

    const projectStyle = { background: colors.bgPrimary, border: `1px solid ${colors.border}`, borderRadius: "14px", padding: "1.25rem" } as const;
    const emptyStyle = { background: colors.bgPrimary, border: `1px solid ${colors.border}`, borderRadius: "14px", padding: "2rem", textAlign: "center" as const, color: colors.textMuted };
    const buttonStyle = { display: "inline-flex", alignItems: "center", gap: ".4rem", background: colors.accentBlue, color: "white", border: 0, borderRadius: "8px", padding: ".55rem .8rem", fontWeight: 700, cursor: "pointer" } as const;

    if (showPlanner) {
        return <div style={{ display: "flex", minHeight: "100vh", background: colors.bgCanvas }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "1.25rem 1.5rem", borderBottom: `1px solid ${colors.border}` }}>
                    <div>
                        <h1 style={{ color: colors.textPrimary, fontSize: "1.25rem", margin: 0 }}>Plan your own idea with Adeel AI</h1>
                        <p style={{ color: colors.textMuted, fontSize: "0.85rem", margin: "0.2rem 0 0" }}>Draft a brief and a full PRD for your own project or portfolio piece.</p>
                    </div>
                    <button onClick={() => setShowPlanner(false)} style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", background: colors.bgPrimary, border: `1px solid ${colors.border}`, color: colors.textPrimary, borderRadius: "8px", padding: ".55rem .8rem", fontWeight: 600, cursor: "pointer" }}>
                        <X size={15} /> Back to projects
                    </button>
                </header>
                <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                    <AIChatPanel onBriefGenerated={setBrief} />
                    <BriefPanel brief={brief} role="freelancer" />
                </div>
            </div>
        </div>;
    }

    return <div style={{ display: "flex", minHeight: "100vh", background: colors.bgCanvas }}><Sidebar /><main style={{ flex: 1, padding: "2.5rem", maxWidth: "1100px", width: "100%", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "2rem" }}>
            <div><h1 style={{ color: colors.textPrimary, fontSize: "1.75rem", margin: 0 }}>Discover projects</h1><p style={{ color: colors.textMuted }}>Only real open projects are shown here. Apply with a personalized Adeel AI proposal.</p></div>
            <button onClick={() => setShowPlanner(true)} style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", background: colors.accentBlueSoft, border: `1px solid ${colors.accentBlue}40`, color: colors.accentBlue, borderRadius: "10px", padding: ".65rem 1rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Sparkles size={15} /> Plan an idea with AI
            </button>
        </header>
        <div style={{ position: "relative", maxWidth: "500px", marginBottom: "1.5rem" }}><Search size={16} color={colors.textMuted} style={{ position: "absolute", left: ".85rem", top: ".8rem" }} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects by title, brief or skills" style={{ width: "100%", boxSizing: "border-box", padding: ".75rem .75rem .75rem 2.5rem", borderRadius: "10px", border: `1px solid ${colors.border}`, background: colors.bgPrimary, color: colors.textPrimary }} /></div>
        {message && <p style={{ color: message.includes("successfully") ? colors.success : colors.danger, marginBottom: "1rem" }}>{message}</p>}
        {loading ? <p style={{ color: colors.textMuted }}>Loading open projects…</p> : visibleProjects.length === 0 ? <div style={emptyStyle}><Briefcase size={22} /><p>{projects.length ? "No projects match your search." : "There are no open projects yet."}</p><Link href="/dashboard/freelancer/proposals" style={{ color: colors.accentBlue }}>View my proposals</Link></div> : <div style={{ display: "grid", gap: "1rem" }}>{visibleProjects.map((project) => <article key={project.id} style={projectStyle}><div><h2 style={{ color: colors.textPrimary, fontSize: "1.05rem", margin: "0 0 .5rem" }}>{project.title}</h2><p style={{ color: colors.textMuted, lineHeight: 1.5, margin: 0 }}>{project.rawDescription}</p>{project.aiSkillTags?.length ? <p style={{ color: colors.accentBlue, fontSize: ".8rem" }}>{project.aiSkillTags.join(" · ")}</p> : null}</div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", borderTop: `1px solid ${colors.border}`, paddingTop: ".9rem", marginTop: ".9rem" }}><span style={{ display: "flex", gap: "1rem", color: colors.textMuted, fontSize: ".8rem" }}><span><Wallet size={13} /> ₹{project.budget.toLocaleString()}</span><span><Clock size={13} /> {project.timelineDays} days</span></span><button onClick={() => applyWithAI(project)} disabled={workingId !== null} style={buttonStyle}><Sparkles size={14} /> {workingId === project.id ? "Writing proposal…" : "Apply with AI"}</button></div></article>)}</div>}
    </main></div>;
}
export default function FreelancerDashboardPage() { return <RequireRole role="freelancer"><FreelancerDashboardContent /></RequireRole>; }
