"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [checking, setChecking] = useState(false);

  // Poll in the background every 3s to check if verified
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      await user.reload();
      if (user.emailVerified) {
        clearInterval(interval);
        router.push("/dashboard");
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [user, router]);

  // Cooldown timer for the resend button (to prevent spam)
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (!user || cooldown > 0) return;
    setSending(true);
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/verify-email`,
      });
      setCooldown(60); // 60 second cooldown
    } catch (err: any) {
      if (err.code === "auth/too-many-requests") {
        setCooldown(60);
      }
    } finally {
      setSending(false);
    }
  };

  const handleCheckNow = async () => {
    if (!user) return;
    setChecking(true);
    await user.reload();
    if (user.emailVerified) {
      router.push("/dashboard");
    }
    setChecking(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto mt-20 text-center px-4">
      <h1 className="text-2xl font-semibold mb-2">Verify your email</h1>
      <p className="text-gray-600 mb-6">
        We sent a verification link to <strong>{user.email}</strong>.
        Click the link, and this page will automatically take you to the dashboard.
      </p>

      <button
        onClick={handleCheckNow}
        disabled={checking}
        className="w-full mb-3 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {checking ? "Checking..." : "I've verified, check now"}
      </button>

      <button
        onClick={handleResend}
        disabled={sending || cooldown > 0}
        className="w-full py-2 rounded border disabled:opacity-50"
      >
        {cooldown > 0 ? `Resend (${cooldown}s)` : sending ? "Sending..." : "Resend email"}
      </button>
    </div>
  );
}