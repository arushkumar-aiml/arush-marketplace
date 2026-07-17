"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { Award, Check, ChevronDown } from "lucide-react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../lib/useAuth";
import { useTheme } from "../../lib/useTheme";

const COMMUNITY_ITEMS = [
    { key: "linkedin-company", label: "LinkedIn · Arush Labs" },
    { key: "linkedin-founder", label: "LinkedIn · Founder" },
    { key: "instagram-founder", label: "Instagram · Founder" },
    { key: "instagram-arush-labs", label: "Instagram · Arush Labs" },
    { key: "x-founder", label: "X · Founder" },
    { key: "youtube-founder", label: "YouTube · Founder" },
    { key: "youtube-team", label: "YouTube · Team" },
    { key: "github", label: "GitHub" },
    { key: "telegram", label: "Telegram" },
    { key: "whatsapp-channel", label: "WhatsApp Channel" },
];

export default function CommunityProgress() {
    const { user } = useAuth();
    const { colors } = useTheme();
    const [open, setOpen] = useState(false);
    const [clicks, setClicks] = useState<string[]>([]);
    const [credits, setCredits] = useState(0);

    useEffect(() => {
        if (!user) return;
        return onSnapshot(doc(db, "users", user.uid), (snapshot) => {
            const data = snapshot.data();
            setClicks(Array.isArray(data?.communityClicks) ? data.communityClicks : []);
            setCredits(typeof data?.aiCredits === "number" ? data.aiCredits : 0);
        });
    }, [user]);

    if (!user) return null;

    return (
        <div style={{ position: "relative" }}>
            <button type="button" onClick={() => setOpen((value) => !value)} style={{ display: "flex", alignItems: "center", gap: "0.4rem", border: `1px solid ${colors.border}`, background: colors.bgPrimary, color: colors.textSecondary, borderRadius: "8px", padding: "0.5rem 0.65rem", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>
                <Award size={15} color={colors.accentGold} /> {clicks.length === 10 ? "Founding Member · " : ""}{credits} credits · {clicks.length}/10 <ChevronDown size={14} />
            </button>
            {open && <div style={{ position: "absolute", right: 0, top: "calc(100% + 0.5rem)", width: "260px", zIndex: 30, background: colors.bgPrimary, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "0.8rem", boxShadow: "0 12px 28px rgba(0,0,0,0.16)" }}>
                <p style={{ color: colors.textPrimary, fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.55rem" }}>Community checklist</p>
                {COMMUNITY_ITEMS.map((item) => <div key={item.key} style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: colors.textMuted, fontSize: "0.72rem", padding: "0.18rem 0" }}><Check size={13} color={clicks.includes(item.key) ? colors.success : colors.textMuted} /> {item.label}</div>)}
                <a href="/community" style={{ display: "block", color: colors.accentBlue, fontSize: "0.78rem", fontWeight: 700, marginTop: "0.6rem", textDecoration: "none" }}>Earn more credits →</a>
            </div>}
        </div>
    );
}
