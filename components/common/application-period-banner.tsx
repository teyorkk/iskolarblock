"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { EditApplicationPeriodDialog } from "@/components/admin-dashboard/edit-application-period-dialog";
import { getCurrentTimePH } from "@/lib/utils/date-formatting";

interface ApplicationPeriodBannerProps {
  variant?: "admin" | "user";
  periodId?: string | null;
}

interface ApplicationPeriod {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  budgetId?: string | null;
}

export function ApplicationPeriodBanner({
  variant = "admin",
  periodId,
}: ApplicationPeriodBannerProps): React.JSX.Element {
  const [period, setPeriod] = useState<ApplicationPeriod | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentPeriod = async (id?: string | null, skipAuto = false) => {
    try {
      const supabase = getSupabaseBrowserClient();
      let query;

      if (id) {
        query = supabase
          .from("ApplicationPeriod")
          .select("*")
          .eq("id", id)
          .single();
      } else {
        query = supabase
          .from("ApplicationPeriod")
          .select("*")
          .order("createdAt", { ascending: false })
          .limit(1)
          .single();
      }

      const { data, error } = await query;

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned", which is fine
        console.error("Error fetching application period:", error);
      } else if (data) {
        // Only auto-update if not skipping (i.e., not a manual toggle)
        if (!skipAuto) {
          // Auto-update isOpen based on dates
          const now = new Date();
          const startDate = new Date(data.startDate);
          const endDate = new Date(data.endDate);

          let shouldBeOpen = data.isOpen;
          let needsUpdate = false;

          // Auto-open when start date is reached
          if (now >= startDate && now <= endDate && !data.isOpen) {
            shouldBeOpen = true;
            needsUpdate = true;
          }

          // Auto-close when end date has passed
          if (now > endDate && data.isOpen) {
            shouldBeOpen = false;
            needsUpdate = true;
          }

          // Update the period status if needed
          if (needsUpdate) {
            const { error: updateError } = await supabase
              .from("ApplicationPeriod")
              .update({
                isOpen: shouldBeOpen,
                updatedAt: getCurrentTimePH(),
              })
              .eq("id", data.id);

            if (updateError) {
              console.error(
                "Error auto-updating application period:",
                updateError
              );
              // Still set the period even if update fails
              setPeriod({ ...data, isOpen: shouldBeOpen });
            } else {
              setPeriod({ ...data, isOpen: shouldBeOpen });
            }
          } else {
            setPeriod(data);
          }
        } else {
          // Skip auto-update, just set the period as-is
          setPeriod(data);
        }
      }
    } catch (error) {
      console.error("Error fetching application period:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchCurrentPeriod(periodId);
  }, [periodId]);

  // Set up periodic check to auto-update status based on dates (every minute)
  useEffect(() => {
    if (!period) return;

    const interval = setInterval(() => {
      const now = new Date();
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);

      // Check if status needs to be updated
      const shouldBeOpen =
        now >= startDate && now <= endDate
          ? true
          : now > endDate
          ? false
          : period.isOpen;

      if (shouldBeOpen !== period.isOpen) {
        // Status needs updating, refetch to trigger auto-update
        void fetchCurrentPeriod(periodId);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [period, periodId]);

  const styles =
    variant === "user"
      ? {
          card: "border-orange-200",
          icon: "bg-orange-100 text-orange-600",
        }
      : {
          card: "border-red-200",
          icon: "bg-red-100 text-red-600",
        };

  if (isLoading) {
    return (
      <Card
        className={`p-4 md:p-5 mb-6 border-2 bg-white shadow-sm ${styles.card}`}
      >
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
        </div>
      </Card>
    );
  }

  if (!period) {
    return (
      <Card
        className={`p-4 md:p-5 mb-6 border-2 bg-white shadow-sm ${styles.card}`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${styles.icon}`}>
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              No Application Cycle Set
            </h2>
            <p className="text-sm text-gray-600">
              Please set an application cycle to begin accepting applications.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const startDate = new Date(period.startDate);
  const endDate = new Date(period.endDate);
  const now = new Date();
  const isActive = now >= startDate && now <= endDate && period.isOpen;
  const isPast = now > endDate;

  return (
    <Card
      className={`p-4 md:p-5 mb-6 border-2 bg-white shadow-sm ${styles.card}`}
    >
      <div className="flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-full shrink-0 ${styles.icon}`}>
            <CalendarRange className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2 mb-1.5">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                {period.title}
              </h2>
              <Badge
                className={
                  isActive
                    ? "bg-green-100 text-green-700 hover:bg-green-100 w-fit"
                    : period.isOpen
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-100 w-fit"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-100 w-fit"
                }
              >
                {isActive ? "On-going" : period.isOpen ? "Upcoming" : "Closed"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {period.description}
            </p>
          </div>
        </div>

        {/* Dates Section - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 border-t-2 border-gray-200">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-gray-50 p-2.5 text-gray-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Start Date
              </p>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {startDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-gray-50 p-2.5 text-gray-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                End Date
              </p>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {endDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Button - Mobile Optimized */}
        {variant === "admin" && !isPast && (
          <div className="flex justify-end pt-3 border-t-2 border-gray-200">
            <EditApplicationPeriodDialog
              period={{
                id: period.id,
                title: period.title,
                description: period.description,
                startDate: period.startDate,
                endDate: period.endDate,
                isOpen: period.isOpen,
                budgetId: period.budgetId || null,
              }}
              onUpdate={() => {
                void fetchCurrentPeriod(periodId);
                // Trigger a custom event to refresh dashboard stats
                window.dispatchEvent(new CustomEvent("refreshDashboard"));
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
