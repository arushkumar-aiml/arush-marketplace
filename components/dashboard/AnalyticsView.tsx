"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { BarChart3, Briefcase, CheckCircle2, Eye, Wallet } from "lucide-react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../lib/useAuth";
import { useTheme } from "../../lib/useTheme";
import type { Application } from "../../types/application";
import type { Project } from "../../types/project";

type Transaction = {
    id: string;
    amount: number;
    type: "earning" | "payment" | "withdrawal";
    createdAt: number;
};

function monthKey(ts: number) {
    return new Date(ts).toLocaleDateString(undefined, { month: "short" });
}

function money(value: number) {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function AnalyticsView({ role }: { role: "freelancer" | "client" }) {
    const { user, profile } = useAuth();
    const { colors } = useTheme();
    const [projects, setProjects] = useState<Project[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            if (!user) return;
            const txSnap = await getDocs(query(collection(db, "transactions"), where("uid", "==", user.uid), where("role", "==", role)));
            setTransactions(txSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction));

            if (role === "freelancer") {
                const appSnap = await getDocs(query(collection(db, "applications"), where("freelancerId", "==", user.uid)));
                setApplications(appSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Application));
            } else {
                const projectSnap = await getDocs(query(collection(db, "projects"), where("clientId", "==", user.uid)));
                const clientProjects = projectSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project);
                setProjects(clientProjects);
                const appSnaps = await Promise.all(clientProjects.map((p) => getDocs(query(collection(db, "applications"), where("projectId", "==", p.id)))));
                setApplications(appSnaps.flatMap((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Application)));
            }

            setLoading(false);
        }
        fetchAnalytics();
    }, [role, user]);

    const monthly = useMemo(() => {
        const wantedType = role === "freelancer" ? "earning" : "payment";
        const totals = transactions
            .filter((t) => t.type === wantedType)
            .reduce<Record<string, number>>((acc, tx) => {
                const key = monthKey(tx.createdAt);
                acc[key] = (acc[key] || 0) + tx.amount;
                return acc;
            }, {});
        return Object.entries(totals).map(([label, value]) => ({ label, value }));
    }, [role, transactions]);

    const maxMonthly = Math.max(...monthly.map((m) => m.value), 1);
    const accepted = applications.filter((a) => a.status === "accepted").length;
    const rate = applications.length ? Math.round((accepted / applications.length) * 100) : 0;
    const totalMoney = transactions
        .filter((t) => t.type === (role === "freelancer" ? "earning" : "payment"))
        .reduce((sum, t) => sum + t.amount, 0);

    const cards =
        role === "freelancer"
            ? [
                { label: "Acceptance rate", value: `${rate}%`, icon: CheckCircle2 },
                { label: "Total earnings", value: money(totalMoney), icon: Wallet },
                { label: "Profile views", value: String((profile as { profileViews?: number } | null)?.profileViews ?? 0), icon: Eye },
            ]
            : [
                { label: "Jobs posted", value: String(projects.length), icon: Briefcase },
                { label: "Hires made", value: String(accepted), icon: CheckCircle2 },
                { label: "Total spending", value: money(totalMoney), icon: Wallet },
            ];

    return (
        <div style={{ maxWidth: "920px" }}>
            {loading ? (
                <p style={{ color: colors.textMuted }}>Loading analytics...</p>
            ) : (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.9rem", marginBottom: "1.25rem" }}>
                        {cards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <div key={card.label} style={{ border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "1rem", background: colors.bgPrimary }}>
                                    <Icon size={17} color={colors.accentBlue} style={{ marginBottom: "0.65rem" }} />
                                    <div style={{ fontSize: "1.35rem", fontWeight: 700, color: colors.textPrimary }}>{card.value}</div>
                                    <div style={{ fontSize: "0.78rem", color: colors.textMuted }}>{card.label}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ border: `1px solid ${colors.border}`, borderRadius: "14px", padding: "1.25rem", background: colors.bgPrimary }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                            <BarChart3 size={16} color={colors.accentBlue} />
                            <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: colors.textPrimary }}>
                                {role === "freelancer" ? "Earnings over time" : "Spending over time"}
                            </h2>
                        </div>
                        {monthly.length === 0 ? (
                            <p style={{ color: colors.textMuted, fontSize: "0.88rem" }}>No transaction data yet.</p>
                        ) : (
                            <div style={{ display: "flex", alignItems: "end", gap: "0.7rem", height: "180px" }}>
                                {monthly.map((item) => (
                                    <div key={item.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.45rem" }}>
                                        <div style={{ color: colors.textMuted, fontSize: "0.72rem" }}>{money(item.value)}</div>
                                        <div style={{ width: "100%", minHeight: "8px", height: `${Math.max(8, (item.value / maxMonthly) * 125)}px`, borderRadius: "8px 8px 0 0", background: colors.accentBlue }} />
                                        <div style={{ color: colors.textMuted, fontSize: "0.72rem" }}>{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
