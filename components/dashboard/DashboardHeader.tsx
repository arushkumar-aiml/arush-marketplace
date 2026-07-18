"use client";

import { useEffect, useState } from "react";
import { Bell, Plus, ChevronDown } from "lucide-react";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/useAuth";
import { useTheme } from "../../lib/useTheme";
import { db } from "../../lib/firebase";
import type { MarketplaceNotification } from "../../types/notification";
import CommunityProgress from "./CommunityProgress";

export default function DashboardHeader({
    subtitle = "Find the best talent. Build amazing things.",
    ctaLabel,
    onCtaClick,
}: {
    subtitle?: string;
    ctaLabel?: string;
    onCtaClick?: () => void;
}) {
    const { user, profile } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();
    const [notifications, setNotifications] = useState<MarketplaceNotification[]>([]);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [aiCredits, setAiCredits] = useState<number | null>(null);

    useEffect(() => {
        if (!user) return;
        return onSnapshot(query(collection(db, "notifications"), where("recipientId", "==", user.uid)), (snapshot) => {
            setNotifications(snapshot.docs
                .map((item) => ({ id: item.id, ...item.data() }) as MarketplaceNotification)
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 8));
        });
    }, [user]);

    useEffect(() => {
        if (!user) {
            setAiCredits(null);
            return;
        }

        return onSnapshot(doc(db, "users", user.uid), (snapshot) => {
            const credits = snapshot.data()?.aiCredits;
            setAiCredits(typeof credits === "number" ? credits : 0);
        });
    }, [user]);

    async function openNotification(notification: MarketplaceNotification) {
        if (!notification.read) await updateDoc(doc(db, "notifications", notification.id), { read: true });
        setNotificationsOpen(false);
        if (notification.link) router.push(notification.link);
    }

    const unreadCount = notifications.filter((notification) => !notification.read).length;

    return (
        <header
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.5rem 2rem",
                borderBottom: `1px solid ${colors.border}`,
                background: colors.bgPrimary,
            }}
        >
            <div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: colors.textPrimary, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    Welcome back, {profile?.displayName?.split(" ")[0] || "there"}
                    <span>👋</span>
                </h1>
                <p style={{ fontSize: "0.875rem", color: colors.textMuted, marginTop: "0.15rem" }}>
                    {subtitle}
                </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <CommunityProgress />
                <div
                    aria-label="AI credits remaining"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        color: colors.accentGold,
                        background: colors.accentGoldSoft,
                        border: `1px solid ${colors.accentGold}55`,
                        borderRadius: "999px",
                        padding: "0.45rem 0.7rem",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                    }}
                >
                    <span aria-hidden="true">✦</span>
                    {aiCredits ?? profile?.aiCredits ?? 0} AI Credits
                </div>
                {ctaLabel && (
                    <button
                        onClick={onCtaClick}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            background: colors.accentBlue,
                            color: "#FFFFFF",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            borderRadius: "8px",
                            border: "none",
                            padding: "0.65rem 1rem",
                            cursor: "pointer",
                        }}
                    >
                        <Plus size={16} />
                        {ctaLabel}
                    </button>
                )}

                <div style={{ position: "relative" }}>
                <button
                    type="button"
                    aria-label="Notifications"
                    onClick={() => setNotificationsOpen((value) => !value)}
                    style={{
                        position: "relative",
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                        border: `1px solid ${colors.border}`,
                        background: colors.bgPrimary,
                        cursor: "pointer",
                    }}
                >
                    <Bell size={18} color={colors.textSecondary} />
                    {unreadCount > 0 && <span
                        style={{
                            position: "absolute",
                            top: "6px",
                            right: "8px",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: colors.accentBlue,
                        }}
                    />}
                </button>
                {notificationsOpen && <div style={{ position: "absolute", right: 0, top: "calc(100% + 0.5rem)", width: "320px", maxHeight: "420px", overflowY: "auto", zIndex: 30, background: colors.bgPrimary, border: `1px solid ${colors.border}`, borderRadius: "12px", boxShadow: "0 12px 28px rgba(0,0,0,0.16)" }}>
                    <div style={{ padding: "0.85rem 1rem", color: colors.textPrimary, fontWeight: 700, fontSize: "0.88rem", borderBottom: `1px solid ${colors.border}` }}>Notifications</div>
                    {notifications.length === 0 ? <p style={{ color: colors.textMuted, fontSize: "0.82rem", padding: "1rem" }}>You&apos;re all caught up.</p> : notifications.map((notification) => <button type="button" key={notification.id} onClick={() => openNotification(notification)} style={{ width: "100%", textAlign: "left", border: "none", borderBottom: `1px solid ${colors.border}`, background: notification.read ? colors.bgPrimary : colors.accentBlueSoft, color: colors.textSecondary, padding: "0.85rem 1rem", cursor: "pointer", fontSize: "0.8rem", lineHeight: 1.45 }}><span style={{ display: "block", color: colors.textPrimary, fontWeight: notification.read ? 500 : 700 }}>{notification.message}</span><span style={{ color: colors.textMuted, fontSize: "0.7rem" }}>{new Date(notification.createdAt).toLocaleString()}</span></button>)}
                </div>}
                </div>

                <button style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer" }}>
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: colors.textPrimary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: colors.bgPrimary,
                            fontSize: "0.9rem",
                            fontWeight: 600,
                        }}
                    >
                        {profile?.displayName?.[0] || "A"}
                    </div>
                    <ChevronDown size={14} color={colors.textMuted} />
                </button>
            </div>
        </header>
    );
}
