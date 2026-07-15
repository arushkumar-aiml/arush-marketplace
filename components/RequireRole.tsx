"use client";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireRole({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!user.emailVerified) {
      router.push("/verify-email");
      return;
    }
    if (userData?.role !== role) {
      router.push("/dashboard");
    }
  }, [user, userData, loading, role, router]);

  if (loading || !user || !user.emailVerified || userData?.role !== role) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return <>{children}</>;
}