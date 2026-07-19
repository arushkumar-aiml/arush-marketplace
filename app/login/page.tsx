"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import type { UserProfile } from "../../types/user";
import AuthTransition from "../../components/AuthTransition";
import { useTheme } from "../../lib/useTheme";

function getErrorMessage(err: unknown): string {
    if (err instanceof FirebaseError) {
        switch (err.code) {
            case "auth/invalid-credential":
            case "auth/wrong-password":
            case "auth/user-not-found":
                return "Incorrect email or password.";
            case "auth/too-many-requests":
                return "Too many attempts. Please wait a bit and try again.";
            case "auth/network-request-failed":
                return "Network issue reaching Firebase. Check your internet connection.";
            default:
                return `Login failed: ${err.message}`;
        }
    }
    return "Something went wrong. Please try again.";
}

export default function LoginPage() {
    const router = useRouter();
    const { colors } = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [resetMessage, setResetMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setResetMessage("");
        setLoading(true);

        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const snap = await getDoc(doc(db, "users", cred.user.uid));

            if (!snap.exists()) {
                setError("Account exists but profile data is missing. Contact support.");
                setLoading(false);
                return;
            }

            const profile = snap.data() as UserProfile;
            if (!cred.user.emailVerified) {
                router.replace("/verify-email");
            } else if (!profile.onboardingCompleted) {
                router.replace("/onboarding");
            } else {
                router.replace(`/dashboard/${profile.role}`);
            }
        } catch (err: unknown) {
            console.error("Login error:", err);
            setError(getErrorMessage(err));
            setLoading(false);
        }
    }

    async function handleForgotPassword() {
        setError("");
        setResetMessage("");

        if (!email) {
            setError("Enter your email above first, then click 'Forgot password?'");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setResetMessage("If an account exists for this email, a password reset link will be sent. Check your inbox.");
        } catch (err: unknown) {
            console.error("Reset error:", err);
            setError(getErrorMessage(err));
        }
    }

    if (loading) {
        return <AuthTransition message="Logging you in..." />;
    }

    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                background: colors.codeBg,
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: "-10%",
                    left: "-10%",
                    width: "500px",
                    height: "500px",
                    background: `radial-gradient(circle, ${colors.accentBlue}33 0%, transparent 70%)`,
                    filter: "blur(40px)",
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "-15%",
                    right: "-10%",
                    width: "600px",
                    height: "600px",
                    background: `radial-gradient(circle, ${colors.accentGold}33 0%, transparent 70%)`,
                    filter: "blur(40px)",
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    background: "rgba(15, 16, 22, 0.85)",
                    backdropFilter: "blur(12px)",
                    border: `1px solid ${colors.accentBlue}40`,
                    borderRadius: "20px",
                    padding: "2.5rem",
                    position: "relative",
                    zIndex: 1,
                    boxShadow: `0 0 60px ${colors.accentBlue}15`,
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
                    <Image src="/logo.png" alt="Arush Marketplace" width={170} height={44} style={{ objectFit: "contain" }} priority />
                    <p style={{ fontSize: "0.7rem", color: "#5B5D67", marginTop: "0.4rem" }}>
                        Powered by Arush Labs
                    </p>
                </div>

                <h1 style={{ fontSize: "1.6rem", fontWeight: 600, color: "white", textAlign: "center", marginBottom: "0.4rem" }}>
                    Welcome back
                </h1>
                <p style={{ color: "#9A9CA5", textAlign: "center", fontSize: "0.9rem", marginBottom: "2rem" }}>
                    Login to access Arush Marketplace
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.85rem", color: "#C9CBD3", marginBottom: "0.5rem" }}>
                            Email address
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.85rem 1rem",
                                borderRadius: "10px",
                                border: "1px solid #2A2D38",
                                background: "#14161F",
                                color: "white",
                                boxSizing: "border-box",
                                outline: "none",
                            }}
                        />
                    </div>

                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <label style={{ fontSize: "0.85rem", color: "#C9CBD3" }}>Password</label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                style={{ background: "none", border: "none", color: colors.accentBlue, fontSize: "0.8rem", cursor: "pointer" }}
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.85rem 3rem 0.85rem 1rem",
                                    borderRadius: "10px",
                                    border: "1px solid #2A2D38",
                                    background: "#14161F",
                                    color: "white",
                                    boxSizing: "border-box",
                                    outline: "none",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "0.9rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: colors.accentGold,
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                }}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {error && <p style={{ color: "#F87171", fontSize: "0.85rem" }}>{error}</p>}
                    {resetMessage && <p style={{ color: "#4ADE80", fontSize: "0.85rem" }}>{resetMessage}</p>}

                    <button
                        type="submit"
                        style={{
                            padding: "0.9rem",
                            borderRadius: "10px",
                            border: "none",
                            background: `linear-gradient(135deg, ${colors.accentBlue}, #4C6FFF)`,
                            color: "white",
                            fontWeight: 600,
                            cursor: "pointer",
                            marginTop: "0.5rem",
                        }}
                    >
                        Login
                    </button>
                </form>

                <p style={{ fontSize: "0.85rem", color: "#9A9CA5", marginTop: "1.75rem", textAlign: "center" }}>
                    Don&apos;t have an account?{" "}
                    <a href="/signup" style={{ color: colors.accentGold, fontWeight: 600, textDecoration: "none" }}>
                        Sign up
                    </a>
                </p>
            </div>
        </main>
    );
}
