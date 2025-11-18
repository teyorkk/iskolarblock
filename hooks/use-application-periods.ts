import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface ApplicationPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export function useApplicationPeriods() {
  const [periods, setPeriods] = useState<ApplicationPeriod[]>([]);
  const [latestPeriodId, setLatestPeriodId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: periodsData, error: periodsError } = await supabase
          .from("ApplicationPeriod")
          .select("id, title, startDate, endDate, createdAt")
          .order("createdAt", { ascending: false });

        if (periodsError) {
          console.error("Error fetching periods:", periodsError);
        } else if (periodsData) {
          setPeriods(periodsData);
          // Set the first (latest) period as default
          if (periodsData.length > 0) {
            setLatestPeriodId(periodsData[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching periods:", error);
      }
    };

    void fetchPeriods();
  }, []);

  return { periods, latestPeriodId };
}

