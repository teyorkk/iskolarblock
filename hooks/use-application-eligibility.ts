import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UseApplicationEligibilityOptions {
  userId: string | undefined;
}

export function useApplicationEligibility({ userId }: UseApplicationEligibilityOptions) {
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isPageLocked, setIsPageLocked] = useState(false);
  const [lockReason, setLockReason] = useState<string | null>(null);
  const [lockStatus, setLockStatus] = useState<string | null>(null);

  useEffect(() => {
    async function checkEligibility() {
      if (!userId) {
        setIsPageLocked(true);
        setLockReason("Please sign in to continue your application.");
        setLockStatus(null);
        setEligibilityChecked(true);
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
          throw periodError;
        }

        if (!periodData) {
          setIsPageLocked(true);
          setLockReason("No application period is currently open.");
          setLockStatus(null);
          setEligibilityChecked(true);
          return;
        }

        const { data: existingApplications, error: applicationError } =
          await supabase
            .from("Application")
            .select("id, status")
            .eq("userId", userId)
            .eq("applicationPeriodId", periodData.id)
            .limit(1);

        if (applicationError) {
          throw applicationError;
        }

        if (existingApplications && existingApplications.length > 0) {
          setIsPageLocked(true);
          setLockReason(
            "You already submitted an application for the current period. Please wait for updates or check your history."
          );
          setLockStatus(existingApplications[0].status);
        } else {
          setIsPageLocked(false);
          setLockReason(null);
          setLockStatus(null);
        }
      } catch (error) {
        console.error("Eligibility check failed:", error);
        setIsPageLocked(true);
        setLockReason(
          "We couldn't verify your eligibility right now. Please try again later."
        );
        setLockStatus(null);
      } finally {
        setEligibilityChecked(true);
      }
    }

    void checkEligibility();
  }, [userId]);

  return {
    eligibilityChecked,
    isPageLocked,
    lockReason,
    lockStatus,
  };
}

