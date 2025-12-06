"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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
}

export function ApplicationPeriodBanner({
  variant = "admin",
  periodId,
}: ApplicationPeriodBannerProps): React.JSX.Element {
  const [period, setPeriod] = useState<ApplicationPeriod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

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
                updatedAt: new Date().toISOString(),
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

  const handleToggleAccepting = async () => {
    if (!period) return;

    setIsToggling(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const newIsOpen = !period.isOpen;

      // Update local state immediately for better UX
      setPeriod({ ...period, isOpen: newIsOpen });

      const { error } = await supabase
        .from("ApplicationPeriod")
        .update({ isOpen: newIsOpen, updatedAt: new Date().toISOString() })
        .eq("id", period.id);

      if (error) {
        console.error("Error toggling application period:", error);
        // Revert local state on error
        setPeriod({ ...period, isOpen: !newIsOpen });
        toast.error("Failed to update application cycle status");
      } else {
        toast.success(
          `Application cycle is now ${newIsOpen ? "open" : "closed"}`
        );
        // Refresh the period data but skip auto-update to respect manual toggle
        await fetchCurrentPeriod(periodId, true);
      }
    } catch (error) {
      console.error("Error toggling application period:", error);
      // Revert local state on error
      if (period) {
        setPeriod({ ...period, isOpen: !period.isOpen });
      }
      toast.error("An unexpected error occurred");
    } finally {
      setIsToggling(false);
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
          card: "border-orange-100",
          icon: "bg-orange-100 text-orange-600",
        }
      : {
          card: "border-red-100",
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

  return (
    <Card
      className={`p-4 md:p-5 mb-6 border-2 bg-white shadow-sm ${styles.card}`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${styles.icon}`}>
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {period.title}
              </h2>
              <Badge
                className={
                  isActive
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                }
              >
                {isActive ? "On-going" : period.isOpen ? "Upcoming" : "Closed"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{period.description}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-gray-100 p-2 text-gray-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Start Date
                </p>
                <p className="font-medium text-gray-900">
                  {startDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-gray-100 p-2 text-gray-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  End Date
                </p>
                <p className="font-medium text-gray-900">
                  {endDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
          {variant === "admin" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleToggleAccepting}
              disabled={isToggling}
              className="flex items-center gap-2"
            >
              {period.isOpen ? (
                <ToggleRight className="w-5 h-5 text-green-600" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
              <span
                className={period.isOpen ? "text-green-600" : "text-gray-500"}
              >
                {isToggling
                  ? "Updating..."
                  : period.isOpen
                  ? "Accepting"
                  : "Not Accepting"}
              </span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
