"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useAuth } from "../../../../lib/useAuth";
import { useTheme } from "../../../../lib/useTheme";
import RequireRole from "../../../../components/RequireRole";
import Sidebar from "../../../../components/dashboard/Sidebar";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";

function ProfileForm() {
    const { user, profile } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();

    const [skills, setSkills] = useState("");
    const [bio, setBio] = useState("");
    const [portfolioUrl, setPortfolioUrl] = useState("");
    const [hourlyRate, setHourlyRate] = useState("");
    const [priceSuggestion, setPriceSuggestion] = useState("");
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setSkills((profile.skills || []).join(", "));
            setBio(profile.bio || "");
            setPortfolioUrl(profile.portfolioUrl || "");
            setHourlyRate(profile.hourlyRate ? String(profile.hourlyRate) : "");
        }
    }, [profile]);

    useEffect(() => {
        const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
        if (!skillsArray.length) {
            setPriceSuggestion("");
            return;
        }

        const timeout = window.setTimeout(async () => {
            try {
                const res = await fetch("/api/ml/pricing-suggestion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ skills: skillsArray }),
                });
                if (!res.ok) throw new Error("Pricing suggestion failed");
                const data = await res.json();
                if (data.suggestion) {
                    setPriceSuggestion(`Suggested range: $${data.suggestion.min}-$${data.suggestion.max}/hr based on ${data.suggestion.sampleSize} similar freelancers.`);
                } else {
                    setPriceSuggestion("");
                }
            } catch (err) {
                console.error(err);
                setPriceSuggestion("");
            }
        }, 600);

        return () => window.clearTimeout(timeout);
    }, [skills]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;
        setError("");
        setSaved(false);
        setLoading(true);

        try {
            const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);

            await updateDoc(doc(db, "users", user.uid), {
                skills: skillsArray,
                bio,
                portfolioUrl,
                hourlyRate: hourlyRate ? Number(hourlyRate) : null,
            });

            fetch("/api/ml/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid }),
            }).catch((err) => console.error("Profile ML update error:", err));

            setSaved(true);
        } catch (err) {
            setError("Couldn't save profile. Try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: colors.bgCanvas }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <DashboardHeader subtitle="Keep your profile updated for better matches." />

                <div style={{ flex: 1, padding: "2rem", maxWidth: "600px" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: colors.textPrimary, marginBottom: "0.5rem" }}>
                        Complete your profile
                    </h2>
                    <p style={{ color: colors.textMuted, fontSize: "0.9rem", marginBottom: "2rem" }}>
                        This is what Adeel AI uses to match you with the right projects.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", color: colors.textSecondary, marginBottom: "0.5rem" }}>
                                Skills (comma separated)
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. React, UI Design, Copywriting"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: `1px solid ${colors.border}`, boxSizing: "border-box", background: colors.bgSecondary, color: colors.textPrimary }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", color: colors.textSecondary, marginBottom: "0.5rem" }}>
                                Short bio
                            </label>
                            <textarea
                                required
                                rows={4}
                                placeholder="What you do and the kind of work you're looking for."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: `1px solid ${colors.border}`, boxSizing: "border-box", resize: "none", background: colors.bgSecondary, color: colors.textPrimary }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", color: colors.textSecondary, marginBottom: "0.5rem" }}>
                                Portfolio link
                            </label>
                            <input
                                type="url"
                                placeholder="https://your-portfolio.com"
                                value={portfolioUrl}
                                onChange={(e) => setPortfolioUrl(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: `1px solid ${colors.border}`, boxSizing: "border-box", background: colors.bgSecondary, color: colors.textPrimary }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", color: colors.textSecondary, marginBottom: "0.5rem" }}>
                                Hourly rate ($)
                            </label>
                            <input
                                type="number"
                                min={1}
                                placeholder="35"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: `1px solid ${colors.border}`, boxSizing: "border-box", background: colors.bgSecondary, color: colors.textPrimary }}
                            />
                            {priceSuggestion && <p style={{ color: colors.accentBlue, fontSize: "0.8rem", marginTop: "0.45rem" }}>{priceSuggestion}</p>}
                        </div>

                        {error && <p style={{ color: colors.danger, fontSize: "0.875rem" }}>{error}</p>}
                        {saved && <p style={{ color: colors.success, fontSize: "0.875rem" }}>Profile saved ✓</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ padding: "0.75rem", borderRadius: "8px", border: "none", background: colors.accentBlue, color: "white", fontWeight: 600, cursor: "pointer" }}
                        >
                            {loading ? "Saving..." : "Save profile"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <RequireRole role="freelancer">
            <ProfileForm />
        </RequireRole>
    );
}
