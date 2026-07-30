"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Bot, FileText, Plus, Users } from "lucide-react";
import Sidebar from "../../../components/dashboard/Sidebar";
import RequireRole from "../../../components/RequireRole";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../lib/useAuth";
import { useTheme } from "../../../lib/useTheme";
import type { Project } from "../../../types/project";

function ClientDashboardContent() {
    const { user } = useAuth();
    const { colors } = useTheme();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        getDocs(query(collection(db, "projects"), where("clientId", "==", user.uid)))
            .then((snapshot) => setProjects(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Project).sort((a, b) => b.createdAt - a.createdAt)))
            .catch((error) => console.error("Could not load projects", error))
            .finally(() => setLoading(false));
    }, [user]);

    const cardLink = { background: colors.bgPrimary, color: colors.textPrimary, border: `1px solid ${colors.border}`, padding: "1.2rem", borderRadius: "14px", textDecoration: "none", display: "flex", alignItems: "flex-start", gap: ".75rem" } as const;
    const muted = { color: colors.textMuted, fontSize: ".84rem", lineHeight: 1.5, margin: ".35rem 0 0" } as const;
    const emptyStyle = { background: colors.bgPrimary, color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: "14px", padding: "2rem", textAlign: "center" as const };

    return <div style={{ display: "flex", minHeight: "100vh", background: colors.bgCanvas }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "2.5rem", maxWidth: "1100px", width: "100%", margin: "0 auto" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
                <div><h1 style={{ color: colors.textPrimary, fontSize: "1.75rem", margin: 0 }}>Product Workspace</h1><p style={{ color: colors.textMuted }}>Create a real project or plan one with Adeel AI.</p></div>
                <Link href="/dashboard/client/post" style={{ background: colors.accentBlue, color: "white", padding: "0.75rem 1rem", borderRadius: "10px", textDecoration: "none", fontWeight: 700, display: "inline-flex", gap: "0.45rem", alignItems: "center" }}><Plus size={17} /> New project</Link>
            </header>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2.25rem" }}>
                <Link href="/dashboard/client/planning-agent" style={cardLink}><Bot color={colors.accentBlue} /><div><b>AI Planning Agent</b><p style={muted}>Generate a real brief, PRD and UI concept.</p></div></Link>
                <Link href="/dashboard/client/freelancers" style={cardLink}><Users color={colors.accentGold} /><div><b>Find freelancers</b><p style={muted}>Search profiles and skills in the marketplace.</p></div></Link>
                <Link href="/dashboard/client/projects" style={cardLink}><FileText color={colors.success} /><div><b>My projects</b><p style={muted}>Review applications and manage work.</p></div></Link>
            </div>
            <section><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}><h2 style={{ color: colors.textPrimary, fontSize: "1.1rem" }}>Your projects</h2><Link href="/dashboard/client/projects" style={{ color: colors.accentBlue, textDecoration: "none", fontSize: ".85rem" }}>View all</Link></div>
            {loading ? <p style={muted}>Loading projects…</p> : projects.length === 0 ? <div style={emptyStyle}>No projects yet. Start with the AI planner or post a project yourself.</div> : <div style={{ display: "grid", gap: ".75rem" }}>{projects.slice(0, 5).map((project) => <Link key={project.id} href="/dashboard/client/projects" style={{ ...cardLink, justifyContent: "space-between" }}><div><b>{project.title}</b><p style={muted}>{project.rawDescription}</p></div><span style={{ color: colors.accentBlue, textTransform: "capitalize", fontSize: ".8rem" }}>{project.status.replace("_", " ")}</span></Link>)}</div>}</section>
        </main>
    </div>;
}
export default function ClientDashboardPage() { return <RequireRole role="client"><ClientDashboardContent /></RequireRole>; }
