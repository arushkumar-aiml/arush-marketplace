"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Briefcase, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "../../lib/useAuth";
import { useTheme } from "../../lib/useTheme";
import { ADMIN_EMAIL } from "../../lib/adminConstants";

type AdminStats = {
    users: number;
    projects: number;
    applications: number;
    conversations: number;
};

export default function AdminPage() {
    const router = useRouter();
    const { user, profile, loading } = useAuth();
    const { colors } = useTheme();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [error, setError] = useState("");

    const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        } else if (!loading && user && !isAdmin) {
            router.replace(`/dashboard/${profile?.role === "freelancer" ? "freelancer" : "client"}`);
        }
    }, [isAdmin, loading, profile?.role, router, user]);

    useEffect(() => {
        async function loadStats() {
            if (!user || !isAdmin) return;

            try {
                const idToken = await user.getIdToken();
                const res = await fetch("/api/admin/stats", {
                    headers: { Authorization: `Bearer ${idToken}` },
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Unable to load admin statistics");
                }

                setStats(data);
            } catch (err: unknown) {
                console.error("Admin dashboard statistics error:", err);
                setError(err instanceof Error ? err.message : "Unable to load admin statistics");
            }
        }

        loadStats();
    }, [isAdmin, user]);

    if (loading || !isAdmin) {
        return null;
    }

    const cards = [
        { label: "Total users", value: stats?.users, icon: Users, color: colors.accentBlue },
        { label: "Projects posted", value: stats?.projects, icon: Briefcase, color: colors.accentGold },
        { label: "Applications", value: stats?.applications, icon: BarChart3, color: colors.success },
        { label: "Conversations", value: stats?.conversations, icon: MessageCircle, color: colors.accentBlue },
    ];

    return (
        <main style={{ minHeight: "100vh", background: colors.bgCanvas, padding: "2rem" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                <header style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: colors.accentBlueSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ShieldCheck size={22} color={colors.accentBlue} />
                    </div>
                    <div>
                        <h1 style={{ color: colors.textPrimary, fontSize: "1.35rem", fontWeight: 700 }}>Arush Marketplace Admin</h1>
                        <p style={{ color: colors.textMuted, fontSize: "0.85rem", marginTop: "0.2rem" }}>Private marketplace overview</p>
                    </div>
                </header>

                {error ? (
                    <div style={{ color: colors.danger, background: colors.dangerSoft, border: `1px solid ${colors.danger}`, borderRadius: "12px", padding: "1rem" }}>{error}</div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1rem" }}>
                        {cards.map(({ label, value, icon: Icon, color }) => (
                            <section key={label} style={{ background: colors.bgPrimary, border: `1px solid ${colors.border}`, borderRadius: "14px", padding: "1.25rem" }}>
                                <Icon size={18} color={color} style={{ marginBottom: "0.8rem" }} />
                                <div style={{ color: colors.textPrimary, fontSize: "1.65rem", fontWeight: 700 }}>{typeof value === "number" ? value.toLocaleString() : "—"}</div>
                                <div style={{ color: colors.textMuted, fontSize: "0.82rem", marginTop: "0.25rem" }}>{label}</div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
