import { useMemo } from "react";
import type { AwardingApplication } from "@/lib/utils/awarding-utils";
import { deriveLevel, getScholarAmount } from "@/lib/utils/awarding-utils";

export function useAwardingStats(applications: AwardingApplication[]) {
  const stats = useMemo(() => {
    const totalGranted = applications.filter(
      (app) => app.status === "GRANTED"
    ).length;
    const totalPending = applications.filter(
      (app) => app.status === "APPROVED"
    ).length;
    const totalAmount = applications.reduce((sum, app) => {
      const level = deriveLevel(app);
      return sum + getScholarAmount(level);
    }, 0);

    return {
      totalApproved: applications.length,
      pending: totalPending,
      granted: totalGranted,
      totalAmount,
    };
  }, [applications]);

  return stats;
}


