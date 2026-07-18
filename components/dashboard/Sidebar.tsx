"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    LogOut,
    Plus,
    Compass,
    Bot,
    Bell
} from "lucide-react";
import { useAuth } from "../../lib/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useTheme } from "../../lib/useTheme";

export default function Sidebar() {
    const pathname = usePathname();
    const { user, profile } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();
    const [isStartingSubscription, setIsStartingSubscription] = useState(false);

    async function handleLogout() {
        await signOut(auth);
        router.push("/login");
    }

    async function handleUpgrade() {
        if (!user) {
            router.push("/login");
            return;
        }

        setIsStartingSubscription(true);

        try {
            const idToken = await user.getIdToken();
            const res = await fetch("/api/create-subscription-session", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });
            const data = await res.json();

            if (!res.ok || !data.url) {
                throw new Error(data.error || "Failed to start subscription checkout");
            }

            window.location.href = data.url;
        } catch (err: unknown) {
            console.error("Start subscription checkout error:", err);
            window.alert("Couldn't start subscription checkout. Please try again.");
            setIsStartingSubscription(false);
        }
    }

    const clientNavItems = [
        { label: "Overview", href: "/dashboard/client", icon: LayoutDashboard },
        { label: "My Products", href: "/dashboard/client/projects", icon: FileText },
        { label: "Planning Agent", href: "/dashboard/client/planning-agent", icon: Bot },
        { label: "Marketplace", href: "/dashboard/client/freelancers", icon: Compass },
        { label: "Messages", href: "/dashboard/client/messages", icon: MessageCircle },
        { label: "Payments", href: "/dashboard/client/payments", icon: CreditCard },
    ];

    const freelancerNavItems = [
        { label: "Discover", href: "/dashboard/freelancer", icon: Compass },
        { label: "My Proposals", href: "/dashboard/freelancer/proposals", icon: Briefcase },
        { label: "Messages", href: "/dashboard/freelancer/messages", icon: MessageCircle },
        { label: "Payments", href: "/dashboard/freelancer/payments", icon: CreditCard },
        { label: "Analytics", href: "/dashboard/freelancer/analytics", icon: BarChart3 },
    ];

    const navItems = profile?.role === "freelancer" ? freelancerNavItems : clientNavItems;

    return (
        <aside
            style={{
                width: "240px",
                flexShrink: 0,
                background: "#0B0C10",
                height: "100vh",
                position: "sticky",
                top: 0,
                display: "flex",
                flexDirection: "column",
                padding: "1.25rem",
                borderRight: "1px solid rgba(255,255,255,0.05)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0 0.5rem", marginBottom: "2rem" }}>
                <Image src="/logo.png" alt="Arush" width={90} height={24} style={{ objectFit: "contain" }} />
            </div>

            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", padding: "0 0.75rem 0.5rem", textTransform: "uppercase" }}>
                    Workspace
                </div>
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
                                gap: "0.75rem",
                                padding: "0.5rem 0.75rem",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                textDecoration: "none",
                                background: active ? "rgba(255,255,255,0.05)" : "transparent",
                                color: active ? "#FFFFFF" : "#9CA3AF",
                                transition: "all 0.2s ease"
                            }}
                        >
                            <Icon size={16} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div style={{ padding: "1.25rem 0", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                 <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", padding: "0 0.75rem 0.25rem", textTransform: "uppercase" }}>
                    Account
                </div>
                <Link
                    href={`/dashboard/${profile?.role}/settings`}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        textDecoration: "none",
                        color: "#9CA3AF",
                    }}
                >
                    <Settings size={16} />
                    Settings
                </Link>
                <div
                    onClick={handleLogout}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        color: "#EF4444",
                        cursor: "pointer",
                    }}
                >
                    <LogOut size={16} />
                    Log Out
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.05)",
                }}
            >
                <div
                    style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "#3B82F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                    }}
                >
                    {profile?.displayName?.[0] || "A"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            color: "#FFFFFF",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {profile?.displayName || "User"}
                    </div>
                    <div style={{ color: "#4B5563", fontSize: "0.7rem", fontWeight: 500 }}>
                        {profile?.plan?.toUpperCase()} Plan
                    </div>
                </div>
            </div>
        </aside>
    );
}
