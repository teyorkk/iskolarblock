"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { Loading } from "@/components/loading";
import { isAdmin } from "@/lib/utils/auth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { ready, user } = useSession();
  const hydrated = ready && typeof window !== "undefined";

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      // If user is logged in, redirect based on role
      const redirectPath = isAdmin(user) ? "/admin-dashboard" : "/user-dashboard";
      router.push(redirectPath);
    }
  }, [hydrated, user, router]);

  if (!hydrated) {
    return <Loading />;
  }

  // If user is logged in, show loading while redirecting
  if (user) {
    return <Loading />;
  }

  return <>{children}</>;
}

