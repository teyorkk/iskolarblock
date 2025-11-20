import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type {
  AwardingApplication,
  ApplicationPeriod,
} from "@/lib/utils/awarding-utils";

export function useAwardingApplications() {
  const [applications, setApplications] = useState<AwardingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periods, setPeriods] = useState<ApplicationPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(
    null
  );
  const [latestPeriodId, setLatestPeriodId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("ApplicationPeriod")
          .select("id, title, startDate, endDate, createdAt")
          .order("createdAt", { ascending: false });

        if (error) {
          throw error;
        }

        setPeriods(data ?? []);
        if (data && data.length > 0) {
          setLatestPeriodId(data[0].id);
          setSelectedPeriodId((prev) => prev ?? data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch periods:", err);
        toast.error("Failed to load application periods");
      }
    };

    void fetchPeriods();
  }, []);

  useEffect(() => {
    if (!selectedPeriodId) {
      setApplications([]);
      return;
    }

    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/admin/awardings?periodId=${selectedPeriodId}`
        );
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "Failed to fetch awarding data");
          setApplications([]);
          return;
        }

        setApplications(data.applications ?? []);
      } catch (error) {
        console.error("Failed to fetch awarding applications:", error);
        toast.error("An error occurred while fetching awarding data");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchApplications();
  }, [selectedPeriodId]);

  return {
    applications,
    isLoading,
    periods,
    selectedPeriodId,
    setSelectedPeriodId,
    latestPeriodId,
  };
}


