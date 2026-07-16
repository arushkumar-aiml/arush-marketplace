"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLocale, type LocaleCode } from "../lib/useLocale";
import { useTheme } from "../lib/useTheme";
import { LANGUAGES } from "../lib/data/language";

export default function LanguageSwitcher() {
    const { locale, setLocale } = useLocale();
    const { colors } = useTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

    function handleSelect(code: LocaleCode) {
        setLocale(code);
        setOpen(false);
    }

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: colors.bgSecondary,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    padding: "0.45rem 0.7rem",
                    fontSize: "0.8rem",
                    color: colors.textSecondary,
                    cursor: "pointer",
                }}
            >
                <Globe size={14} />
                {current.name}
                <ChevronDown size={13} style={{ opacity: 0.7 }} />
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        right: 0,
                        background: colors.bgPrimary,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "10px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        maxHeight: "280px",
                        overflowY: "auto",
                        minWidth: "180px",
                        zIndex: 100,
                        padding: "0.4rem",
                    }}
                >
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background: lang.code === locale ? colors.accentBlueSoft : "transparent",
                                border: "none",
                                borderRadius: "6px",
                                padding: "0.5rem 0.6rem",
                                fontSize: "0.83rem",
                                color: colors.textPrimary,
                                cursor: "pointer",
                                textAlign: "left",
                            }}
                        >
                            {lang.name}
                            {lang.code === locale && <Check size={13} color={colors.accentBlue} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}