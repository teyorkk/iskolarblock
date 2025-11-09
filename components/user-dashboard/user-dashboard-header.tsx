"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserDashboardHeaderProps {
  user: SupabaseUser | null;
}

export function UserDashboardHeader({ user }: UserDashboardHeaderProps): React.JSX.Element {
  const userName =
    (user?.user_metadata?.name as string) ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 md:p-8 text-white mb-6"
    >
      <div className="max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-orange-100 mb-4">
          Track your scholarship applications and manage your academic journey
          with ScholarBlock.
        </p>
        <Link href="/application">
          <Button
            variant="secondary"
            className="bg-white text-orange-600 hover:bg-gray-100"
          >
            New Application
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

