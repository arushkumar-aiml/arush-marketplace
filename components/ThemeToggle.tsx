"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "../lib/useTheme";

export default function ThemeToggle() {
    const { mode, colors, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                border: `1px solid ${colors.border}`,
                background: colors.bgSecondary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
            }}
        >
            {mode === "light" ? (
                <Moon size={16} color={colors.textSecondary} />
            ) : (
                <Sun size={16} color={colors.textSecondary} />
            )}
        </button>
    );
}