"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    LayoutDashboard,
    FileText,
    Users,
    MessageCircle,
    CreditCard,
    BarChart3,
    UserCircle,
    Settings,
    Sparkles,
    ChevronDown,
    Briefcase,
} from "lucide-react";
import { useAuth } from "../../lib/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useTheme } from "../../lib/useTheme";
import ThemeToggle from "../ThemeToggle";
import LanguageSwitcher from "../LanguageSwitcher";

export default function Sidebar() {
    const pathname = usePathname();
    const { profile } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();
    const t = useTranslations("nav");
    const tSidebar = useTranslations("sidebar");

    async function handleLogout() {
        await signOut(auth);
        router.push("/login");
    }

    const clientNavItems = [
        { label: t("dashboard"), href: "/dashboard/client", icon: LayoutDashboard },
        { label: t("projects"), href: "/dashboard/client/projects", icon: FileText },
        { label: t("freelancers"), href: "/dashboard/client/freelancers", icon: Users },
        { label: t("messages"), href: "/dashboard/client/messages", icon: MessageCircle },
        { label: t("payments"), href: "/dashboard/client/payments", icon: CreditCard },
        { label: t("analytics"), href: "/dashboard/client/analytics", icon: BarChart3 },
        { label: t("myProfile"), href: "/dashboard/client/profile", icon: UserCircle },
        { label: t("settings"), href: "/dashboard/client/settings", icon: Settings },
    ];

    const freelancerNavItems = [
        { label: t("findWork"), href: "/dashboard/freelancer", icon: LayoutDashboard },
        { label: t("myProposals"), href: "/dashboard/freelancer/proposals", icon: Briefcase },
        { label: t("messages"), href: "/dashboard/freelancer/messages", icon: MessageCircle },
        { label: t("payments"), href: "/dashboard/freelancer/payments", icon: CreditCard },
        { label: t("myProfile"), href: "/dashboard/freelancer/profile", icon: UserCircle },
        { label: t("settings"), href: "/dashboard/freelancer/settings", icon: Settings },
    ];

    const navItems = profile?.role === "freelancer" ? freelancerNavItems : clientNavItems;

    return (
        <aside
            style={{
                width: "280px",
                flexShrink: 0,
                background: colors.bgPrimary,
                height: "100vh",
                position: "sticky",
                top: 0,
                display: "flex",
                flexDirection: "column",
                padding: "1.5rem 1rem",
                borderRight: `1px solid ${colors.border}`,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 0.5rem", marginBottom: "1.25rem" }}>
                <Image src="/logo.png" alt="Arush" width={140} height={35} style={{ objectFit: "contain" }} />
                <ThemeToggle />
            </div>

            <div style={{ padding: "0 0.5rem", marginBottom: "1rem" }}>
                <LanguageSwitcher />
            </div>

            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {navItems.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0.65rem 0.75rem",
                                borderRadius: "8px",
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                textDecoration: "none",
                                background: active ? colors.accentBlue : "transparent",
                                color: active ? "#FFFFFF" : colors.textMuted,
                            }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <Icon size={18} />
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div style={{ background: colors.bgSecondary, borderRadius: "12px", padding: "1rem", marginBottom: "1rem", border: `1px solid ${colors.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Sparkles size={16} color={colors.accentGold} />
                    <span style={{ color: colors.textPrimary, fontSize: "0.9rem", fontWeight: 600 }}>{tSidebar("upgradeToPro")}</span>
                </div>
                <p style={{ color: colors.textMuted, fontSize: "0.75rem", lineHeight: 1.5, marginBottom: "0.75rem" }}>
                    {tSidebar("upgradeDesc")}
                </p>
                <button
                    style={{
                        width: "100%",
                        background: colors.accentBlue,
                        color: "#FFFFFF",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        borderRadius: "8px",
                        border: "none",
                        padding: "0.5rem",
                        cursor: "pointer",
                    }}
                >
                    {tSidebar("upgradeNow")}
                </button>
            </div>

            <div
                onClick={handleLogout}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.5rem",
                    borderTop: `1px solid ${colors.border}`,
                    paddingTop: "1rem",
                    cursor: "pointer",
                }}
            >
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: colors.accentBlue,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                    }}
                >
                    {profile?.displayName?.[0] || "A"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            color: colors.textPrimary,
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {profile?.displayName || "User"}
                    </div>
                    <div style={{ color: colors.textMuted, fontSize: "0.75rem", textTransform: "capitalize" }}>
                        {profile?.role || "Client"}
                    </div>
                </div>
                <ChevronDown size={16} color={colors.textMuted} />
            </div>
        </aside>
    );
}