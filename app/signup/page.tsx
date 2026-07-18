"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FirebaseError } from "firebase/app";
import { useAuth } from "../../lib/useAuth";
import { useTheme } from "../../lib/useTheme";
import AuthTransition from "../../components/AuthTransition";
import { Bot, ShieldCheck, Zap, ArrowRight } from "lucide-react";

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
    const { colors } = useTheme();
    const { signup } = useAuth();
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
            await signup(email, password, name);
            router.push("/onboarding");
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            setLoading(false);
        }
    }

    if (loading) {
        return <AuthTransition message="Creating your account..." />;
    }

    return (
        <main style={{ minHeight: "100vh", display: "flex", background: "#0B0C10" }}>
            <div style={{ flex: 1, padding: "3rem", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, #3B82F622 0%, transparent 70%)", filter: "blur(40px)" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                    <Image src="/logo.png" alt="Arush" width={110} height={28} style={{ objectFit: "contain" }} />
                </div>

                <div style={{ position: "relative", zIndex: 1, maxWidth: "460px" }}>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "white", lineHeight: 1.1, marginBottom: "1.5rem" }}>
                        Join the Future of <span style={{ color: "#3B82F6" }}>Product Development.</span>
                    </h1>
                    <p style={{ color: "#9CA3AF", fontSize: "1.1rem", marginBottom: "3rem", lineHeight: 1.6 }}>
                        One account. Unlimited potential. Experience AI-guided building and working.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {[
                            { icon: Bot, title: "AI-Native Workflow", desc: "AI guides you from idea to launch." },
                            { icon: ShieldCheck, title: "Secure & Trusted", desc: "Enterprise-grade security for your data." },
                            { icon: Zap, title: "Lightning Fast", desc: "Build and scale at the speed of thought." }
                        ].map((f, i) => (
                            <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <f.icon size={20} color="#3B82F6" />
                                </div>
                                <div>
                                    <div style={{ color: "white", fontWeight: 600 }}>{f.title}</div>
                                    <div style={{ color: "#6B7280", fontSize: "0.9rem" }}>{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ color: "#374151", fontSize: "0.85rem", position: "relative", zIndex: 1 }}>
                    © 2026 Arush Labs. All rights reserved.
                </p>
            </div>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                <div style={{ width: "100%", maxWidth: "400px", background: "#111827", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "2.5rem" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", textAlign: "center", marginBottom: "2rem" }}>Create Account</h2>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "white", boxSizing: "border-box", outline: "none" }}
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "white", boxSizing: "border-box", outline: "none" }}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "white", boxSizing: "border-box", outline: "none" }}
                        />

                        {error && <p style={{ color: "#EF4444", fontSize: "0.85rem", textAlign: "center" }}>{error}</p>}

                        <button
                            type="submit"
                            style={{ padding: "1rem", borderRadius: "12px", border: "none", background: "#3B82F6", color: "white", fontWeight: 700, cursor: "pointer", marginTop: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                        >
                            Get Started <ArrowRight size={18} />
                        </button>
                    </form>

                    <p style={{ fontSize: "0.9rem", color: "#6B7280", marginTop: "2rem", textAlign: "center" }}>
                        Already have an account?{" "}
                        <a href="/login" style={{ color: "#3B82F6", fontWeight: 600, textDecoration: "none" }}>Login</a>
                    </p>
                </div>
            </div>
        </main>
    );
}
