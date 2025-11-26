"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { UserSidebar } from "@/components/user-sidebar";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSession } from "@/components/session-provider";
import { ApplicationSuccess } from "@/components/application/application-success";

export default function ApplicationPage() {
  const { user } = useSession();
  const [hasCurrentApplication, setHasCurrentApplication] = useState(false);
  const [currentApplicationStatus, setCurrentApplicationStatus] = useState<
    string | null
  >(null);
  const [hasOpenPeriod, setHasOpenPeriod] = useState(true);
  const [isCheckingApplications, setIsCheckingApplications] = useState(true);

  useEffect(() => {
    async function checkUserApplications() {
      if (!user) {
        setIsCheckingApplications(false);
        setHasOpenPeriod(true);
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const { data: periodData, error: periodError } = await supabase
          .from("ApplicationPeriod")
          .select("id")
          .eq("isOpen", true)
          .order("createdAt", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (periodError) {
          console.error("Error fetching application period:", periodError);
        }

        if (!periodData) {
          setHasOpenPeriod(false);
        } else {
          setHasOpenPeriod(true);
        }

        const { data, error } = await supabase
          .from("Application")
          .select("id, status, applicationPeriodId")
          .eq("userId", user.id);

        if (error) {
          console.error("Error checking applications:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));

          setHasCurrentApplication(false);
          setCurrentApplicationStatus(null);
          setIsCheckingApplications(false);
          return;
        }

        if (periodData && data?.length) {
          const currentApplication = data.find(
            (app) => app.applicationPeriodId === periodData.id
          );
          if (currentApplication) {
            setHasCurrentApplication(true);
            setCurrentApplicationStatus(currentApplication.status);
          } else {
            setHasCurrentApplication(false);
            setCurrentApplicationStatus(null);
          }
        } else {
          setHasCurrentApplication(false);
          setCurrentApplicationStatus(null);
        }
      } catch (error) {
        console.error("Unexpected error checking applications:", error);
        // Fail gracefully - assume no past applications
        setHasCurrentApplication(false);
        setCurrentApplicationStatus(null);
        setHasOpenPeriod(true);
      } finally {
        setIsCheckingApplications(false);
      }
    }

    void checkUserApplications();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar />

      {/* Main Content */}
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {!hasOpenPeriod && !isCheckingApplications && (
              <div className="mb-6 flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">No active application period.</p>
                  <p>
                    Please wait for the next application cycle or watch for
                    announcements.
                  </p>
                </div>
              </div>
            )}

            {hasCurrentApplication && !isCheckingApplications && (
              <ApplicationSuccess
                status={
                  (currentApplicationStatus as
                    | "PENDING"
                    | "APPROVED"
                    | "GRANTED"
                    | "REJECTED") || "PENDING"
                }
              />
            )}

            {isCheckingApplications ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
