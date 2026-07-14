"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { themeColors, ThemeMode, ThemeColors } from "./theme";

interface ThemeContextValue {
    mode: ThemeMode;
    colors: ThemeColors;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "arush-theme-mode";

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>("light");
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        if (stored === "light" || stored === "dark") {
            setMode(stored);
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setMode("dark");
        }
        setHydrated(true);
    }, []);

    function setTheme(newMode: ThemeMode) {
        setMode(newMode);
        localStorage.setItem(STORAGE_KEY, newMode);
    }

    function toggleTheme() {
        setTheme(mode === "light" ? "dark" : "light");
    }

    const colors = themeColors[mode];

    // Avoid a flash of wrong theme on first paint
    if (!hydrated) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ mode, colors, toggleTheme, setTheme }}>
            <div style={{ background: colors.bgCanvas, minHeight: "100vh" }}>{children}</div>
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return ctx;
}