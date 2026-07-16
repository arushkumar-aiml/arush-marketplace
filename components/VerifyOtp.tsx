"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/useAuth";

export default function VerifyOtp() {
    const { user } = useAuth();
    const router = useRouter();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resent, setResent] = useState(false);

    async function handleVerify() {
        if (!user) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid, code }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Verification failed");
                return;
            }
            await user.reload();
            router.push("/dashboard");
        } catch {
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        if (!user || !user.email) return;
        setResent(false);
        await fetch("/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, uid: user.uid }),
        });
        setResent(true);
    }

    return (
        <div style={{ maxWidth: 360, margin: "4rem auto", textAlign: "center" }}>
            <h2>Verify your email</h2>
            <p>Enter the 6-digit code sent to {user?.email}</p>
            <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                style={{ fontSize: "1.4rem", letterSpacing: "6px", textAlign: "center", padding: "0.6rem", width: "100%" }}
            />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button onClick={handleVerify} disabled={loading} style={{ marginTop: "1rem", width: "100%", padding: "0.7rem" }}>
                {loading ? "Verifying..." : "Verify"}
            </button>
            <button onClick={handleResend} style={{ marginTop: "0.5rem", background: "none", border: "none", color: "blue" }}>
                Resend code
            </button>
            {resent && <p style={{ fontSize: "0.8rem" }}>New code sent!</p>}
        </div>
    );
}