"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/useAuth";
import type { UserRole } from "../types/user";

export default function RequireRole({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!user.emailVerified) {
      router.replace("/verify-email");
      return;
    }

    if (profile && profile.role !== role) {
      router.replace(`/dashboard/${profile.role}`);
    }
  }, [user, profile, loading, role, router]);

  if (loading || !user || !user.emailVerified || !profile || profile.role !== role) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#666" }}>Loading...</p>
      </main>
    );
  }

  return <>{children}</>;
}