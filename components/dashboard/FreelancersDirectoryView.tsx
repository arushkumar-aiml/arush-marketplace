"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ExternalLink, Search, SlidersHorizontal, Star, UserRound } from "lucide-react";
import { db } from "../../lib/firebase";
import { useTheme } from "../../lib/useTheme";
import type { UserProfile } from "../../types/user";

type FreelancerProfile = UserProfile & {
    hourlyRate?: number;
    photoURL?: string;
    trustScore?: number;
    matchScore?: number;
};

const CATEGORIES = ["Web Development", "Design", "Writing", "Video Editing", "Marketing", "Data/AI", "Other"] as const;

function getFreelancerCategory(freelancer: FreelancerProfile) {
    if (freelancer.freelanceWorkType) return freelancer.freelanceWorkType;

    const skills = (freelancer.skills || []).join(" ").toLowerCase();
    if (/figma|ui|ux|graphic|illustrat|photoshop|brand/.test(skills)) return "Design";
    if (/writer|writing|copy|content|seo|blog/.test(skills)) return "Writing";
    if (/video|premiere|after effects|motion|editor/.test(skills)) return "Video Editing";
    if (/market|growth|ads|social media|campaign/.test(skills)) return "Marketing";
    if (/ai|ml|machine learning|data |python|analytics/.test(skills)) return "Data/AI";
    if (/react|next|web|frontend|backend|node|mobile|android|ios|flutter/.test(skills)) return "Web Development";
    return "Other";
}

export default function FreelancersDirectoryView() {
    const { colors } = useTheme();
    const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [skill, setSkill] = useState("all");
    const [category, setCategory] = useState("all");
    const [smartResults, setSmartResults] = useState<FreelancerProfile[] | null>(null);
    const [smartLoading, setSmartLoading] = useState(false);

    useEffect(() => {
        async function fetchFreelancers() {
            const q = query(collection(db, "users"), where("role", "==", "freelancer"));
            const snap = await getDocs(q);
            setFreelancers(snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as FreelancerProfile));
            setLoading(false);
        }
        fetchFreelancers();
    }, []);

    useEffect(() => {
        const queryText = search.trim();
        if (queryText.length < 4) {
            setSmartResults(null);
            return;
        }

        const timeout = window.setTimeout(async () => {
            setSmartLoading(true);
            try {
                const res = await fetch("/api/ml/search-freelancers", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: queryText }),
                });
                if (!res.ok) throw new Error("Smart search failed");
                const data = await res.json();
                setSmartResults(data.freelancers || null);
            } catch (err) {
                console.error(err);
                setSmartResults(null);
            } finally {
                setSmartLoading(false);
            }
        }, 700);

        return () => window.clearTimeout(timeout);
    }, [search]);

    const skills = useMemo(() => {
        const all = freelancers.flatMap((f) => f.skills || []);
        return Array.from(new Set(all.map((s) => s.trim()).filter(Boolean))).sort();
    }, [freelancers]);

    const filtered = useMemo(() => {
        const needle = search.trim().toLowerCase();
        const source = smartResults || freelancers;
        return source.filter((f) => {
            const haystack = `${f.displayName} ${f.bio || ""} ${(f.skills || []).join(" ")}`.toLowerCase();
            const matchesSearch = !needle || haystack.includes(needle);
            const matchesSkill = skill === "all" || (f.skills || []).some((s) => s.toLowerCase() === skill.toLowerCase());
            const matchesCategory = category === "all" || getFreelancerCategory(f) === category;
            return matchesSearch && matchesSkill && matchesCategory;
        });
    }, [category, freelancers, search, skill, smartResults]);

    return (
        <div style={{ maxWidth: "980px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) 180px 180px", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <label style={{ position: "relative" }}>
                    <Search size={16} color={colors.textMuted} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, bio, or skill"
                        style={{ width: "100%", padding: "0.75rem 0.9rem 0.75rem 2.4rem", borderRadius: "9px", border: `1px solid ${colors.border}`, background: colors.bgPrimary, color: colors.textPrimary, boxSizing: "border-box", outline: "none" }}
                    />
                    {smartLoading && (
                        <span style={{ position: "absolute", right: "0.85rem", top: "50%", transform: "translateY(-50%)", color: colors.textMuted, fontSize: "0.75rem" }}>
                            Ranking...
                        </span>
                    )}
                </label>
                <label style={{ position: "relative" }}>
                    <SlidersHorizontal size={16} color={colors.textMuted} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem 0.9rem 0.75rem 2.4rem", borderRadius: "9px", border: `1px solid ${colors.border}`, background: colors.bgPrimary, color: colors.textPrimary, boxSizing: "border-box", outline: "none" }}
                    >
                        <option value="all">All categories</option>
                        {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                </label>
                <label style={{ position: "relative" }}>
                    <SlidersHorizontal size={16} color={colors.textMuted} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
                    <select
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem 0.9rem 0.75rem 2.4rem", borderRadius: "9px", border: `1px solid ${colors.border}`, background: colors.bgPrimary, color: colors.textPrimary, boxSizing: "border-box", outline: "none" }}
                    >
                        <option value="all">All skills</option>
                        {skills.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </label>
            </div>

            {loading ? (
                <p style={{ color: colors.textMuted }}>Loading freelancers...</p>
            ) : filtered.length === 0 ? (
                <div style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}`, borderRadius: "14px", padding: "2rem", textAlign: "center", color: colors.textMuted }}>
                    No freelancers match your filters.
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.9rem" }}>
                    {filtered.map((f) => (
                        <div key={f.uid} style={{ border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "1rem", background: colors.bgPrimary }}>
                            <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", marginBottom: "0.8rem" }}>
                                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: colors.accentBlueSoft, color: colors.accentBlue, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                                    {f.photoURL ? <UserRound size={18} /> : f.displayName?.[0] || "F"}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <h3 style={{ color: colors.textPrimary, fontSize: "0.95rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.displayName}</h3>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: colors.textMuted, fontSize: "0.76rem" }}>
                                        <Star size={12} color={colors.accentGold} /> Trust {f.trustScore ?? 80}/100
                                    </div>
                                    <div style={{ color: colors.accentBlue, fontSize: "0.72rem", fontWeight: 700, marginTop: "0.2rem" }}>{getFreelancerCategory(f)}</div>
                                </div>
                            </div>
                            <p style={{ color: colors.textSecondary, fontSize: "0.84rem", lineHeight: 1.5, minHeight: "3.8rem" }}>
                                {f.bio || "No bio added yet."}
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.85rem" }}>
                                {(f.skills || []).slice(0, 5).map((s) => (
                                    <span key={s} style={{ fontSize: "0.72rem", fontWeight: 600, color: colors.accentBlue, background: colors.accentBlueSoft, borderRadius: "999px", padding: "0.22rem 0.55rem" }}>{s}</span>
                                ))}
                            </div>
                            {f.hourlyRate ? <div style={{ marginTop: "0.85rem", color: colors.textPrimary, fontWeight: 700 }}>${f.hourlyRate}/hr</div> : null}
                            {f.portfolioUrl ? <a href={f.portfolioUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", marginTop: "0.85rem", color: colors.accentBlue, fontSize: "0.78rem", fontWeight: 700, textDecoration: "none" }}>View portfolio <ExternalLink size={13} /></a> : null}
                            {typeof f.matchScore === "number" ? (
                                <div style={{ marginTop: "0.5rem", color: colors.accentBlue, fontSize: "0.78rem", fontWeight: 700 }}>
                                    {f.matchScore}% smart match
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
