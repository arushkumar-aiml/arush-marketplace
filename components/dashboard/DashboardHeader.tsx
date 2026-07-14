"use client";

import { Bell, Plus, ChevronDown } from "lucide-react";
import { useAuth } from "../../lib/useAuth";
import { useTheme } from "../../lib/useTheme";

export default function DashboardHeader({
    subtitle = "Find the best talent. Build amazing things.",
    ctaLabel,
    onCtaClick,
}: {
    subtitle?: string;
    ctaLabel?: string;
    onCtaClick?: () => void;
}) {
    const { profile } = useAuth();
    const { colors } = useTheme();

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

                <button
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
                    <span
                        style={{
                            position: "absolute",
                            top: "6px",
                            right: "8px",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: colors.accentBlue,
                        }}
                    />
                </button>

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