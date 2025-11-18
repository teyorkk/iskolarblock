import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UseRenewalEligibilityOptions {
  userId: string | undefined;
}

export function useRenewalEligibility({ userId }: UseRenewalEligibilityOptions) {
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);
  const [isPageLocked, setIsPageLocked] = useState(false);
  const [lockReason, setLockReason] = useState<string | null>(null);
  const [lockStatus, setLockStatus] = useState<string | null>(null);

  useEffect(() => {
    async function checkRenewalEligibility() {
      if (!userId) {
        setIsCheckingEligibility(false);
        setIsPageLocked(true);
        setLockReason("Please sign in to continue.");
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
          setIsCheckingEligibility(false);
          return;
        }

        const { data, error } = await supabase
          .from("Application")
          .select("id, status, applicationPeriodId")
          .eq("userId", userId);

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          setIsPageLocked(true);
          setLockReason(
            "You need to have a previous application before you can submit a renewal."
          );
          setLockStatus(null);
          setIsCheckingEligibility(false);
          return;
        }

        const currentApplication = data.find(
          (app) => app.applicationPeriodId === periodData.id
        );

        if (currentApplication) {
          setIsPageLocked(true);
          setLockReason(
            "You already submitted an application for the current period. Renewals are limited to one submission."
          );
          setLockStatus(currentApplication.status);
          setIsCheckingEligibility(false);
          return;
        }

        setIsPageLocked(false);
        setLockReason(null);
        setLockStatus(null);
        setIsCheckingEligibility(false);
      } catch (error) {
        console.error("Unexpected error checking renewal eligibility:", error);
        setIsPageLocked(true);
        setLockReason(
          "We couldn't verify your eligibility right now. Please try again later."
        );
        setLockStatus(null);
        setIsCheckingEligibility(false);
      }
    }

    void checkRenewalEligibility();
  }, [userId]);

  return {
    isCheckingEligibility,
    isPageLocked,
    lockReason,
    lockStatus,
  };
}

