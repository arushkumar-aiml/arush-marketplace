"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../lib/useAuth";
import { useTheme } from "../../lib/useTheme";
import { MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, profile, loading } = useAuth();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");

  function nextRoute() {
    return profile?.onboardingCompleted ? `/dashboard/${profile.role}` : "/onboarding";
  }

  // Redirect away if not logged in, otherwise resume the required setup flow.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.emailVerified && profile) {
      router.replace(nextRoute());
    }
  }, [user, profile, loading, router]);

  // Poll every 3 seconds to check if the user has clicked the verification link
  useEffect(() => {
    if (!user || user.emailVerified) return;

    const interval = setInterval(async () => {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified && profile) {
        router.replace(nextRoute());
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user, profile, router]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleResend() {
    if (!auth.currentUser || resendCooldown > 0) return;
    try {
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/verify-email`,
      });
      setResendMessage("Verification email sent again. Check your inbox.");
      setResendCooldown(30);
    } catch {
      setResendMessage("Couldn't resend right now. Try again in a moment.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: colors.bgCanvas,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: colors.bgPrimary,
          border: `1px solid ${colors.border}`,
          borderRadius: "20px",
          padding: "2.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: colors.accentBlueSoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <MailCheck size={26} color={colors.accentBlue} />
        </div>

        <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: colors.textPrimary, marginBottom: "0.6rem" }}>
          Verify your email
        </h1>
        <p style={{ color: colors.textMuted, fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.75rem" }}>
          We sent a verification link to <strong>{user?.email}</strong>. Click the
          link to activate your account — this page will update automatically.
        </p>

        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          style={{
            width: "100%",
            padding: "0.85rem",
            borderRadius: "10px",
            border: `1px solid ${colors.border}`,
            background: colors.bgSecondary,
            color: colors.textPrimary,
            fontWeight: 600,
            cursor: resendCooldown > 0 ? "default" : "pointer",
            opacity: resendCooldown > 0 ? 0.6 : 1,
          }}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend verification email"}
        </button>

        {resendMessage && (
          <p style={{ fontSize: "0.8rem", color: colors.textMuted, marginTop: "1rem" }}>
            {resendMessage}
          </p>
        )}
      </div>
    </main>
  );
}
