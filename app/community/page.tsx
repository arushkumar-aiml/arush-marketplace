"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, runTransaction } from "firebase/firestore";
import { Check, ExternalLink, Users } from "lucide-react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../lib/useAuth";
import { useTheme } from "../../lib/useTheme";

const COMMUNITY_LINKS = [
  { key: "linkedin-company", label: "LinkedIn · Arush Labs", url: "https://www.linkedin.com/company/arush-labs" },
  { key: "linkedin-founder", label: "LinkedIn · Founder", url: "https://www.linkedin.com/in/arushkumar9983" },
  { key: "instagram-founder", label: "Instagram · Founder", url: "https://instagram.com/arushkumar9983" },
  { key: "instagram-arush-labs", label: "Instagram · Arush Labs", url: "https://instagram.com/arushlabs" },
  { key: "x-founder", label: "X · Founder", url: "https://x.com/arushkumar9983" },
  { key: "youtube-founder", label: "YouTube · Founder", url: "https://youtube.com/@ArushLabs" },
  { key: "youtube-team", label: "YouTube · Team", url: "https://youtube.com/@ArushLabsTeam" },
  { key: "github", label: "GitHub · Arush Labs", url: "https://github.com/ArushLabs" },
  { key: "telegram", label: "Telegram · Arush Labs", url: "https://t.me/arushlabs" },
  { key: "whatsapp-channel", label: "WhatsApp Channel", url: "https://whatsapp.com/channel/0029VbDwLTSEawdvb00wfu34" },
];

export default function CommunityPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { colors } = useTheme();
  const [clicked, setClicked] = useState<string[]>([]);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user || !profile) {
      router.replace("/login");
      return;
    }
    setClicked(profile.communityClicks || []);
    setCredits(profile.aiCredits || 0);
  }, [loading, profile, router, user]);

  const complete = useMemo(
    () => COMMUNITY_LINKS.every(({ key }) => clicked.includes(key)),
    [clicked]
  );

  async function markClicked(key: string) {
    if (!user || clicked.includes(key)) return;

    const nextClicks = [...clicked, key];
    const earnsFoundingBonus = nextClicks.length === COMMUNITY_LINKS.length && !profile?.foundingMember;
    setClicked(nextClicks);
    setCredits((value) => value + 50 + (earnsFoundingBonus ? 200 : 0));

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);
        const snapshot = await transaction.get(userRef);
        const data = snapshot.data();
        const existingClicks = Array.isArray(data?.communityClicks) ? data.communityClicks : [];
        if (existingClicks.includes(key)) return;

        const allClicks = [...existingClicks, key];
        const foundingMember = allClicks.length === COMMUNITY_LINKS.length && !data?.foundingMember;
        transaction.update(userRef, {
          communityClicks: allClicks,
          aiCredits: (typeof data?.aiCredits === "number" ? data.aiCredits : 0) + 50 + (foundingMember ? 200 : 0),
          ...(foundingMember ? { foundingMember: true } : {}),
        });
      });
    } catch {
      setClicked((value) => value.filter((item) => item !== key));
      setCredits(profile?.aiCredits || 0);
    }
  }

  function continueToDashboard() {
    if (profile) router.replace(`/dashboard/${profile.role}`);
  }

  return (
    <main style={{ minHeight: "100vh", background: colors.bgCanvas, padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", background: colors.bgPrimary, border: `1px solid ${colors.border}`, borderRadius: "20px", padding: "2rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.75rem" }}>
          <div style={{ background: colors.accentBlueSoft, color: colors.accentBlue, borderRadius: "12px", padding: "0.7rem", display: "flex" }}><Users size={22} /></div>
          <div>
            <h1 style={{ color: colors.textPrimary, fontSize: "1.35rem", fontWeight: 700 }}>Join the Community</h1>
            <p style={{ color: colors.textMuted, fontSize: "0.85rem", marginTop: "0.2rem" }}>Honor-system rewards: open a link once to earn 50 AI credits.</p>
          </div>
        </div>
        <div style={{ color: colors.accentGold, background: colors.accentGoldSoft, borderRadius: "10px", padding: "0.75rem 0.9rem", fontSize: "0.85rem", fontWeight: 700, marginBottom: "1rem" }}>
          {credits} AI credits · {clicked.length}/{COMMUNITY_LINKS.length} links opened{complete ? " · Founding Member unlocked" : ""}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.7rem" }}>
          {COMMUNITY_LINKS.map((link) => {
            const done = clicked.includes(link.key);
            return <a key={link.key} href={link.url} target="_blank" rel="noreferrer" onClick={() => markClicked(link.key)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", padding: "0.85rem", border: `1px solid ${done ? colors.accentBlue : colors.border}`, background: done ? colors.accentBlueSoft : colors.bgSecondary, color: colors.textPrimary, borderRadius: "10px", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
              <span>{link.label}</span>{done ? <Check size={16} color={colors.accentBlue} /> : <ExternalLink size={15} color={colors.textMuted} />}
            </a>;
          })}
        </div>
        <button type="button" onClick={continueToDashboard} style={{ marginTop: "1.5rem", width: "100%", border: "none", borderRadius: "10px", padding: "0.85rem", background: colors.accentBlue, color: "#FFFFFF", fontWeight: 700, cursor: "pointer" }}>{complete ? "Go to dashboard" : "Skip for now"}</button>
      </div>
    </main>
  );
}
