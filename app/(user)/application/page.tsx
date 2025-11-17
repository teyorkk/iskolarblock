"use client";

import { motion } from "framer-motion";
import { FileText, Zap, Lock, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserSidebar } from "@/components/user-sidebar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSession } from "@/components/session-provider";

export default function ApplicationPage() {
  const { user } = useSession();
  const [hasPastApplication, setHasPastApplication] = useState(false);
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

          setHasPastApplication(false);
          setHasCurrentApplication(false);
          setCurrentApplicationStatus(null);
          setIsCheckingApplications(false);
          return;
        }

        setHasPastApplication(Boolean(data && data.length > 0));

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
        setHasPastApplication(false);
        setHasCurrentApplication(false);
        setCurrentApplicationStatus(null);
        setHasOpenPeriod(true);
      } finally {
        setIsCheckingApplications(false);
      }
    }

    void checkUserApplications();
  }, [user]);

  const disableAll = hasCurrentApplication || !hasOpenPeriod || !user;

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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Scholarship Application
              </h1>
              <p className="text-gray-600">
                Choose the type of application you want to submit
              </p>
            </div>

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
              <div className="mb-6 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">
                    You already submitted for this period.
                  </p>
                  <p>
                    Current status:{" "}
                    <span className="font-semibold">
                      {currentApplicationStatus || "PENDING"}
                    </span>
                    . Please monitor your history page for updates.
                  </p>
                </div>
              </div>
            )}

            {isCheckingApplications ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!hasPastApplication && !disableAll ? (
                  <Link href="/application/new" className="block h-full">
                    <Card className="flex h-full cursor-pointer flex-col transition-all hover:shadow-lg hover:scale-105">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="w-5 h-5 text-orange-500" />
                          </div>
                          New Application
                        </CardTitle>
                        <CardDescription>
                          First-time scholarship applicant
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col justify-between">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Apply for a scholarship for the first time. You will
                          need to complete your personal information and upload
                          required documents.
                        </p>
                        <div className="mt-4 text-sm font-medium text-orange-500">
                          4 steps • ~12 minutes
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <div className="block h-full cursor-not-allowed">
                    <Card className="flex h-full flex-col opacity-60 bg-gray-50 relative overflow-hidden">
                      <div className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Locked
                      </div>
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-500">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                          </div>
                          New Application
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          First-time scholarship applicant
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="text-sm text-gray-500 leading-relaxed mb-3">
                            Apply for a scholarship for the first time. You will
                            need to complete your personal information and
                            upload required documents.
                          </p>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                            <p className="text-xs text-yellow-800 font-medium">
                              New Application Not Available
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              {disableAll
                                ? hasCurrentApplication
                                  ? "You already submitted for the current period. Please wait for the review of your existing application."
                                  : "Applications are currently closed until the next period opens."
                                : "You already have an application on record. Please submit a Renewal Application instead."}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 text-sm font-medium text-gray-400">
                          4 steps • ~12 minutes
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {hasPastApplication && !disableAll ? (
                  <Link href="/application/renewal" className="block h-full">
                    <Card className="flex h-full cursor-pointer flex-col transition-all hover:shadow-lg hover:scale-105">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                            <Zap className="w-5 h-5 text-orange-500" />
                          </div>
                          Renewal Application
                        </CardTitle>
                        <CardDescription>
                          Renew your scholarship
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col justify-between">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Renew your scholarship. Your personal information will
                          be auto-filled from your previous application so you
                          can focus on uploading updated documents.
                        </p>
                        <div className="mt-4 text-sm font-medium text-orange-500">
                          2 steps • ~5 minutes
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <div className="block h-full cursor-not-allowed">
                    <Card className="flex h-full flex-col opacity-60 bg-gray-50 relative overflow-hidden">
                      <div className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Locked
                      </div>
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-500">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                            <Zap className="w-5 h-5 text-gray-400" />
                          </div>
                          Renewal Application
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Renew your scholarship
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="text-sm text-gray-500 leading-relaxed mb-3">
                            Renew your scholarship. Your personal information
                            will be auto-filled from your previous application
                            so you only need to upload updated documents.
                          </p>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                            <p className="text-xs text-yellow-800 font-medium">
                              Renewal Not Available
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              {disableAll
                                ? hasCurrentApplication
                                  ? "A submission for this period already exists. You can only have one active application."
                                  : "Applications are closed until the next period."
                                : "You need to submit a new application first."}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 text-sm font-medium text-gray-400">
                          2 steps • ~5 minutes
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
