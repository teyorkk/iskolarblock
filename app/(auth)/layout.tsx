"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { Loading } from "@/components/loading";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { ready, user, isAdmin, loadingRole } = useSession();
  const hydrated = ready && typeof window !== "undefined";

  useEffect(() => {
    if (!hydrated || loadingRole) return;
    if (user) {
      // If user is logged in, redirect based on role from database
      const redirectPath = isAdmin ? "/admin-dashboard" : "/user-dashboard";
      router.push(redirectPath);
    }
  }, [hydrated, user, isAdmin, loadingRole, router]);

  if (!hydrated || loadingRole) {
    return <Loading />;
  }

  // If user is logged in, show loading while redirecting
  if (user) {
    return <Loading />;
  }

  return <>{children}</>;
}
