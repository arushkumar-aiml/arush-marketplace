"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { CreditCard, Download, Receipt, Wallet } from "lucide-react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../lib/useAuth";
import { useTheme } from "../../lib/useTheme";

type Transaction = {
    id: string;
    uid: string;
    role: "freelancer" | "client";
    amount: number;
    type: "earning" | "payment" | "withdrawal";
    status: string;
    createdAt: number;
};

function formatMoney(value: number) {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatDate(value: number) {
    return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function PaymentsView({ role }: { role: "freelancer" | "client" }) {
    const { user } = useAuth();
    const { colors } = useTheme();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTransactions() {
            if (!user) return;
            const q = query(
                collection(db, "transactions"),
                where("uid", "==", user.uid),
                where("role", "==", role),
                orderBy("createdAt", "desc")
            );
            const snap = await getDocs(q);
            setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction));
            setLoading(false);
        }
        fetchTransactions();
    }, [role, user]);

    const summary = useMemo(() => {
        const earnings = transactions.filter((t) => t.type === "earning").reduce((sum, t) => sum + t.amount, 0);
        const spending = transactions.filter((t) => t.type === "payment").reduce((sum, t) => sum + t.amount, 0);
        const withdrawals = transactions.filter((t) => t.type === "withdrawal").reduce((sum, t) => sum + t.amount, 0);
        return { earnings, spending, withdrawals };
    }, [transactions]);

    const cards =
        role === "freelancer"
            ? [
                { label: "Total earnings", value: formatMoney(summary.earnings), icon: Wallet },
                { label: "Withdrawn", value: formatMoney(summary.withdrawals), icon: Download },
                { label: "Pending balance", value: formatMoney(Math.max(summary.earnings - summary.withdrawals, 0)), icon: CreditCard },
            ]
            : [
                { label: "Total spending", value: formatMoney(summary.spending), icon: Wallet },
                { label: "Invoices", value: transactions.filter((t) => t.type === "payment").length.toString(), icon: Receipt },
                { label: "Payment methods", value: "1 saved", icon: CreditCard },
            ];

    const historyTitle = role === "freelancer" ? "Withdrawal history" : "Invoices";

    return (
        <div style={{ maxWidth: "920px" }}>
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

            <div style={{ border: `1px solid ${colors.border}`, borderRadius: "14px", padding: "1.25rem", marginBottom: "1.25rem", background: colors.bgPrimary }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
                    <CreditCard size={16} color={colors.accentBlue} />
                    <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: colors.textPrimary }}>Payment methods</h2>
                </div>
                <div style={{ border: `1px solid ${colors.border}`, borderRadius: "10px", padding: "0.9rem", background: colors.bgSecondary, color: colors.textSecondary, fontSize: "0.86rem" }}>
                    Default method ready. Connect Stripe or bank payout settings here when live payments are enabled.
                </div>
            </div>

            <div style={{ border: `1px solid ${colors.border}`, borderRadius: "14px", padding: "1.25rem", background: colors.bgPrimary }}>
                <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: colors.textPrimary, marginBottom: "1rem" }}>{historyTitle}</h2>
                {loading ? (
                    <p style={{ color: colors.textMuted }}>Loading payments...</p>
                ) : transactions.length === 0 ? (
                    <p style={{ color: colors.textMuted, fontSize: "0.88rem" }}>No transactions yet.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                        {transactions.map((tx) => (
                            <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${colors.border}`, borderRadius: "10px", padding: "0.85rem" }}>
                                <div>
                                    <div style={{ color: colors.textPrimary, fontWeight: 600, fontSize: "0.88rem", textTransform: "capitalize" }}>{tx.type}</div>
                                    <div style={{ color: colors.textMuted, fontSize: "0.76rem" }}>{formatDate(tx.createdAt)}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ color: colors.textPrimary, fontWeight: 700 }}>{formatMoney(tx.amount)}</div>
                                    <div style={{ color: tx.status === "paid" || tx.status === "completed" ? colors.success : colors.textMuted, fontSize: "0.75rem", textTransform: "capitalize" }}>{tx.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
