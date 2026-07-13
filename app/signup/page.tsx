"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import type { UserRole } from "../../types/user";
import AuthTransition from "../../components/AuthTransition";
import { Bot, ShieldCheck, Zap } from "lucide-react";

function getErrorMessage(err: unknown): string {
    if (err instanceof FirebaseError) {
        switch (err.code) {
            case "auth/email-already-in-use":
                return "An account with this email already exists.";
            case "auth/weak-password":
                return "Password should be at least 6 characters.";
            case "auth/invalid-email":
                return "Enter a valid email address.";
            default:
                return `Signup failed: ${err.message}`;
        }
    }
    return "Something went wrong. Please try again.";
}

export default function SignupPage() {
    const router = useRouter();
    const [role, setRole] = useState<UserRole>("client");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(cred.user, { displayName: name });
            await setDoc(doc(db, "users", cred.user.uid), {
                uid: cred.user.uid,
                email,
                displayName: name,
                role,
                createdAt: Date.now(),
            });
            router.push(`/dashboard/${role}`);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            setLoading(false);
        }
    }

    if (loading) {
        return <AuthTransition message="Creating your account..." />;
    }

    return (
        <main style={{ minHeight: "100vh", display: "flex", background: "#05060A" }}>
            {/* Left panel */}
            <div style={{ flex: 1, padding: "3rem", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, #4C6FFF22 0%, transparent 70%)", filter: "blur(40px)" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", position: "relative", zIndex: 1 }}>
                    <Image src="/logo.png" alt="Arush Labs" width={140} height={36} style={{ objectFit: "contain" }} />
                </div>

                <div style={{ position: "relative", zIndex: 1, maxWidth: "460px" }}>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: 700, color: "white", lineHeight: 1.2, marginBottom: "1rem" }}>
                        Join the Future of Freelancing.{" "}
                        <span style={{ background: "linear-gradient(135deg, #4C6FFF, #C9A227)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            Powered by AI.
                        </span>
                    </h1>
                    <p style={{ color: "#9A9CA5", fontSize: "1rem", marginBottom: "2.5rem" }}>
                        Create your account and unlock a world of opportunities with Arush Marketplace.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div style={{ display: "flex", gap: "0.9rem", alignItems: "flex-start" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#4C6FFF22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Bot size={18} color="#4C6FFF" />
                            </div>
                            <div>
                                <div style={{ color: "white", fontWeight: 600, fontSize: "0.95rem" }}>AI-Powered Matching</div>
                                <div style={{ color: "#7A7C87", fontSize: "0.85rem" }}>Get matched with the perfect opportunities.</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.9rem", alignItems: "flex-start" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#C9A22722", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <ShieldCheck size={18} color="#C9A227" />
                            </div>
                            <div>
                                <div style={{ color: "white", fontWeight: 600, fontSize: "0.95rem" }}>Secure &amp; Trusted</div>
                                <div style={{ color: "#7A7C87", fontSize: "0.85rem" }}>Your data and payments are 100% secure.</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.9rem", alignItems: "flex-start" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#4C6FFF22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Zap size={18} color="#4C6FFF" />
                            </div>
                            <div>
                                <div style={{ color: "white", fontWeight: 600, fontSize: "0.95rem" }}>Lightning Fast</div>
                                <div style={{ color: "#7A7C87", fontSize: "0.85rem" }}>Built for speed, designed for growth.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <p style={{ color: "#5B5D67", fontSize: "0.8rem", position: "relative", zIndex: 1 }}>
                    © 2026 Arush Labs. All rights reserved.
                </p>
            </div>

            {/* Right panel — form */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                <div
                    style={{
                        width: "100%",
                        maxWidth: "440px",
                        background: "rgba(15, 16, 22, 0.85)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(201, 162, 39, 0.25)",
                        borderRadius: "20px",
                        padding: "2.5rem",
                    }}
                >
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 600, color: "white", textAlign: "center", marginBottom: "1.75rem" }}>
                        Create your account
                    </h2>

                    <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.5rem", padding: "0.3rem", background: "#14161F", border: "1px solid #2A2D38", borderRadius: "10px" }}>
                        {(["client", "freelancer"] as UserRole[]).map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r)}
                                style={{
                                    flex: 1,
                                    padding: "0.55rem",
                                    borderRadius: "8px",
                                    border: "none",
                                    textTransform: "capitalize",
                                    cursor: "pointer",
                                    background: role === r ? "linear-gradient(135deg, #2563EB, #4C6FFF)" : "transparent",
                                    color: role === r ? "white" : "#9A9CA5",
                                    fontWeight: 500,
                                }}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid #2A2D38", background: "#14161F", color: "white", boxSizing: "border-box", outline: "none" }}
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid #2A2D38", background: "#14161F", color: "white", boxSizing: "border-box", outline: "none" }}
                        />
                        <input
                            type="password"
                            placeholder="Password (min 6 characters)"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid #2A2D38", background: "#14161F", color: "white", boxSizing: "border-box", outline: "none" }}
                        />

                        {error && <p style={{ color: "#F87171", fontSize: "0.85rem" }}>{error}</p>}

                        <button
                            type="submit"
                            style={{ padding: "0.9rem", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #C9A227, #E0C158)", color: "#0B0C10", fontWeight: 700, cursor: "pointer", marginTop: "0.5rem" }}
                        >
                            Create Account →
                        </button>
                    </form>

                    <p style={{ fontSize: "0.85rem", color: "#9A9CA5", marginTop: "1.5rem", textAlign: "center" }}>
                        Already have an account?{" "}
                        <a href="/login" style={{ color: "#4C6FFF", fontWeight: 600, textDecoration: "none" }}>
                            Login
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
}