"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useRouter } from "next/navigation";

const clientNavItems = [
    { label: "Dashboard", href: "/dashboard/client", icon: LayoutDashboard },
    { label: "Projects", href: "/dashboard/client/projects", icon: FileText },
    { label: "Freelancers", href: "/dashboard/client/freelancers", icon: Users },
    { label: "Messages", href: "/dashboard/client/messages", icon: MessageCircle },
    { label: "Payments", href: "/dashboard/client/payments", icon: CreditCard },
    { label: "Analytics", href: "/dashboard/client/analytics", icon: BarChart3 },
    { label: "My Profile", href: "/dashboard/client/profile", icon: UserCircle },
    { label: "Settings", href: "/dashboard/client/settings", icon: Settings },
];

const freelancerNavItems = [
    { label: "Find Work", href: "/dashboard/freelancer", icon: LayoutDashboard },
    { label: "My Proposals", href: "/dashboard/freelancer/proposals", icon: Briefcase },
    { label: "Messages", href: "/dashboard/freelancer/messages", icon: MessageCircle },
    { label: "Payments", href: "/dashboard/freelancer/payments", icon: CreditCard },
    { label: "My Profile", href: "/dashboard/freelancer/profile", icon: UserCircle },
    { label: "Settings", href: "/dashboard/freelancer/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { profile } = useAuth();
    const router = useRouter();
    async function handleLogout() {
        await signOut(auth);
        router.push("/login");
    }

    const navItems = profile?.role === "freelancer" ? freelancerNavItems : clientNavItems;

    return (
        <aside
            style={{
                width: "280px",
                flexShrink: 0,
                background: "#0B0C10",
                height: "100vh",
                position: "sticky",
                top: 0,
                display: "flex",
                flexDirection: "column",
                padding: "1.5rem 1rem",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0 0.5rem", marginBottom: "2rem" }}>
                <Image src="/logo.png" alt="Arush" width={140} height={35} style={{ objectFit: "contain" }} />
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
                                background: active ? "#2563EB" : "transparent",
                                color: active ? "white" : "#9A9CA5",
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

            <div style={{ background: "#161822", borderRadius: "12px", padding: "1rem", marginBottom: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Sparkles size={16} color="#C9A227" />
                    <span style={{ color: "white", fontSize: "0.9rem", fontWeight: 600 }}>Upgrade to Pro</span>
                </div>
                <p style={{ color: "#9A9CA5", fontSize: "0.75rem", lineHeight: 1.5, marginBottom: "0.75rem" }}>
                    Unlock advanced AI tools, priority matching and more.
                </p>
                <button
                    style={{
                        width: "100%",
                        background: "#2563EB",
                        color: "white",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        borderRadius: "8px",
                        border: "none",
                        padding: "0.5rem",
                        cursor: "pointer",
                    }}
                >
                    Upgrade Now
                </button>
            </div>

            <div onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", cursor: "pointer" }}>
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "#2563EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                    }}
                >
                    {profile?.displayName?.[0] || "A"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "white", fontSize: "0.9rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {profile?.displayName || "User"}
                    </div>
                    <div style={{ color: "#6B6E78", fontSize: "0.75rem", textTransform: "capitalize" }}>
                        {profile?.role || "Client"}
                    </div>
                </div>
                <ChevronDown size={16} color="#6B6E78" />
            </div>
        </aside>
    );
}