import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface ApplicationPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export function useApplicationPeriodsSelector() {
  const [periods, setPeriods] = useState<ApplicationPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: periodsData, error: periodsError } = await supabase
          .from("ApplicationPeriod")
          .select("id, title, startDate, endDate")
          .order("createdAt", { ascending: false });

        if (periodsError) {
          console.error("Error fetching periods:", periodsError);
        } else if (periodsData) {
          setPeriods(periodsData);
          // Set the first period as default if none selected
          if (periodsData.length > 0) {
            setSelectedPeriodId((prev) => prev || periodsData[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching periods:", error);
      }
    };

    void fetchPeriods();
  }, []);

  return {
    periods,
    selectedPeriodId,
    setSelectedPeriodId,
  };
}

