"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { getApplicationRoute } from "@/lib/utils/application-navigation";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserData {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  bio: string | null;
}

interface UserDashboardHeaderProps {
  user: SupabaseUser | null;
  userData?: UserData | null;
}

export function UserDashboardHeader({
  user,
  userData,
}: UserDashboardHeaderProps): React.JSX.Element {
  const router = useRouter();
  const { user: sessionUser } = useSession();
  const [isNavigating, setIsNavigating] = useState(false);
  const userName = userData?.name || user?.email?.split("@")[0] || "User";

  const handleNewApplication = async () => {
    if (isNavigating) return;

    setIsNavigating(true);
    try {
      const target = await getApplicationRoute(sessionUser);
      router.push(target);
    } catch (error) {
      console.error("Failed to navigate to application:", error);
      toast.error(
        "Unable to open your application form right now. Please try again."
      );
    } finally {
      setIsNavigating(false);
    }
  };

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
          with IskolarBlock.
        </p>
        <Button
          variant="secondary"
          className="bg-white text-orange-600 hover:bg-gray-100"
          onClick={handleNewApplication}
          disabled={isNavigating}
        >
          New Application
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
