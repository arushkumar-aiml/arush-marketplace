"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/useAuth";
import type { UserRole } from "../types/user";

const EMAIL_VERIFICATION_CUTOFF = new Date("2026-07-16T11:49:37+05:30").getTime();

function requiresEmailVerification(creationTime?: string) {
  if (!creationTime) return true;

  const accountCreatedAt = new Date(creationTime).getTime();
  return Number.isNaN(accountCreatedAt) || accountCreatedAt >= EMAIL_VERIFICATION_CUTOFF;
}

export default function RequireRole({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const emailVerificationRequired = user
    ? requiresEmailVerification(user.metadata.creationTime)
    : true;

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (emailVerificationRequired && !user.emailVerified) {
      router.replace("/verify-email");
      return;
    }

    if (profile && profile.role !== role) {
      router.replace(`/dashboard/${profile.role}`);
    }
  }, [user, profile, loading, role, router, emailVerificationRequired]);

  if (loading || !user || (emailVerificationRequired && !user.emailVerified) || !profile || profile.role !== role) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#666" }}>Loading...</p>
      </main>
    );
  }

  return <>{children}</>;
}
