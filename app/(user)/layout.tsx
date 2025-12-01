"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { Loading } from "@/components/loading";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { ready, user, isAdmin, loadingRole } = useSession();
  const hydrated = ready && typeof window !== "undefined";

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.push("/login");
      return;
    }
    // Only redirect if role is fully loaded and user is confirmed admin
    if (!loadingRole && isAdmin) {
      console.log("User layout: redirecting admin to admin-dashboard");
      router.push("/admin-dashboard");
    }
  }, [hydrated, user, isAdmin, loadingRole, router]);

  if (!hydrated || !user || loadingRole) {
    return <Loading />;
  }

  // If user is admin, show loading while redirecting
  if (isAdmin) {
    return <Loading />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
