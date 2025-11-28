"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { Loading } from "@/components/loading";
import { AppBackground } from "@/components/common/app-background";

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

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4">
      <AppBackground className="opacity-60" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
