"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import {
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useAuth } from "../../lib/useAuth";
import { useTheme } from "../../lib/useTheme";
import { useLocale } from "../../lib/useLocale";
import { LANGUAGES } from "../../lib/data/languages";
import { User, Lock, Globe, Check, Loader2 } from "lucide-react";

export default function SettingsView() {
    const { user, profile } = useAuth();
    const { colors } = useTheme();
    const { locale, setLocale } = useLocale();

    const [displayName, setDisplayName] = useState(profile?.displayName || "");
    const [bio, setBio] = useState(profile?.bio || "");
    const [skillsInput, setSkillsInput] = useState((profile?.skills || []).join(", "));
    const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolioUrl || "");
    const [companyName, setCompanyName] = useState(profile?.companyName || "");
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileError, setProfileError] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordSaved, setPasswordSaved] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const isFreelancer = profile?.role === "freelancer";

    async function handleSaveProfile() {
        if (!user) return;
        setSavingProfile(true);
        setProfileError("");
        setProfileSaved(false);
        try {
            const updates: Record<string, unknown> = {
                displayName: displayName.trim(),
                bio: bio.trim(),
            };
            if (isFreelancer) {
                updates.skills = skillsInput
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                updates.portfolioUrl = portfolioUrl.trim();
            } else {
                updates.companyName = companyName.trim();
            }
            await updateDoc(doc(db, "users", user.uid), updates);
            setProfileSaved(true);
        } catch (err: unknown) {
            console.error("Save profile error:", err);
            setProfileError("Couldn't save your profile. Please try again.");
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleChangePassword() {
        if (!user || !user.email) return;
        setPasswordError("");
        setPasswordSaved(false);

        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords don't match.");
            return;
        }

        setSavingPassword(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setPasswordSaved(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            console.error("Change password error:", err);
            setPasswordError("Couldn't change password. Check your current password and try again.");
        } finally {
            setSavingPassword(false);
        }
    }

    const cardStyle: React.CSSProperties = {
        border: `1px solid ${colors.border}`,
        borderRadius: "14px",
        padding: "1.5rem",
        marginBottom: "1.25rem",
        background: colors.bgPrimary,
    };
    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "0.82rem",
        fontWeight: 500,
        color: colors.textPrimary,
        marginBottom: "0.4rem",
    };
    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "0.7rem 0.9rem",
        borderRadius: "9px",
        border: `1px solid ${colors.border}`,
        background: colors.bgSecondary,
        color: colors.textPrimary,
        fontSize: "0.88rem",
        outline: "none",
        boxSizing: "border-box",
        fontFamily: "inherit",
    };
    const sectionTitle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.95rem",
        fontWeight: 600,
        color: colors.textPrimary,
        marginBottom: "1.1rem",
    };
    const saveBtn: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        background: colors.accentBlue,
        color: "#FFFFFF",
        border: "none",
        borderRadius: "9px",
        padding: "0.65rem 1.2rem",
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: "pointer",
        marginTop: "1rem",
    };

    return (
        <div style={{ maxWidth: "620px" }}>
            <div style={cardStyle}>
                <div style={sectionTitle}>
                    <User size={16} color={colors.accentBlue} />
                    Profile
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>Full name</label>
                    <input style={inputStyle} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>Bio</label>
                    <textarea
                        style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder={isFreelancer ? "Tell clients about your experience..." : "Tell freelancers about your company..."}
                    />
                </div>

                {isFreelancer ? (
                    <>
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={labelStyle}>Skills (comma separated)</label>
                            <input
                                style={inputStyle}
                                value={skillsInput}
                                onChange={(e) => setSkillsInput(e.target.value)}
                                placeholder="React, Node.js, Figma"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Portfolio URL</label>
                            <input style={inputStyle} value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://..." />
                        </div>
                    </>
                ) : (
                    <div>
                        <label style={labelStyle}>Company name</label>
                        <input style={inputStyle} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </div>
                )}

                {profileError && <p style={{ color: colors.danger, fontSize: "0.82rem", marginTop: "0.75rem" }}>{profileError}</p>}

                <button onClick={handleSaveProfile} disabled={savingProfile} style={{ ...saveBtn, opacity: savingProfile ? 0.7 : 1 }}>
                    {savingProfile ? <Loader2 size={15} /> : profileSaved ? <Check size={15} /> : null}
                    {savingProfile ? "Saving..." : profileSaved ? "Saved" : "Save profile"}
                </button>
            </div>

            <div style={cardStyle}>
                <div style={sectionTitle}>
                    <Globe size={16} color={colors.accentBlue} />
                    Language
                </div>
                <label style={labelStyle}>Preferred language</label>
                <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as (typeof LANGUAGES)[number]["code"])}
                    style={{ ...inputStyle, cursor: "pointer" }}
                >
                    {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </select>
            </div>

            <div style={cardStyle}>
                <div style={sectionTitle}>
                    <Lock size={16} color={colors.accentBlue} />
                    Change password
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>Current password</label>
                    <input type="password" style={inputStyle} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>New password</label>
                    <input type="password" style={inputStyle} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div>
                    <label style={labelStyle}>Confirm new password</label>
                    <input type="password" style={inputStyle} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>

                {passwordError && <p style={{ color: colors.danger, fontSize: "0.82rem", marginTop: "0.75rem" }}>{passwordError}</p>}
                {passwordSaved && <p style={{ color: colors.success, fontSize: "0.82rem", marginTop: "0.75rem" }}>Password changed successfully.</p>}

                <button onClick={handleChangePassword} disabled={savingPassword} style={{ ...saveBtn, opacity: savingPassword ? 0.7 : 1 }}>
                    {savingPassword ? <Loader2 size={15} /> : null}
                    {savingPassword ? "Updating..." : "Change password"}
                </button>
            </div>
        </div>
    );
}