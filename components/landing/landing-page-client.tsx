"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { Loading } from "@/components/loading";
import { LandingNavigation } from "@/components/landing/landing-navigation";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingLiveImpact } from "@/components/landing/landing-live-impact";
import { LandingAbout } from "@/components/landing/landing-about";
import { LandingFooter } from "@/components/landing/landing-footer";
import { landingFeatures } from "@/lib/constants/landing-features";
import { landingLiveImpactStats } from "@/lib/constants/landing-live-impact";
import type { LiveImpactStat } from "@/types";
import type { LiveImpactAggregates } from "@/lib/services/live-impact";

interface LandingPageClientProps {
  initialLiveImpactValues: LiveImpactAggregates;
}

const numberFormatter = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 0,
});

const formatLiveImpactStats = (
  values: LiveImpactAggregates
): LiveImpactStat[] => {
  return landingLiveImpactStats.map((stat) => {
    let rawValue = 0;
    switch (stat.id) {
      case "budget-reimbursed":
        rawValue = values.totalBudgetReimbursed ?? 0;
        break;
      case "total-applicants":
        rawValue = values.totalApplicants ?? 0;
        break;
      case "scholars-granted":
        rawValue = values.grantedApplicants ?? 0;
        break;
      default:
        rawValue = 0;
    }

    return {
      ...stat,
      value: numberFormatter.format(rawValue),
    };
  });
};

export function LandingPageClient({
  initialLiveImpactValues,
}: LandingPageClientProps): React.JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { ready, user, isAdmin, loadingRole } = useSession();
  const hydrated = ready && typeof window !== "undefined";
  const [liveImpactValues, setLiveImpactValues] = useState(
    initialLiveImpactValues
  );

  useEffect(() => {
    if (!hydrated || loadingRole) return;
    if (user) {
      const redirectPath = isAdmin ? "/admin-dashboard" : "/user-dashboard";
      router.push(redirectPath);
    }
  }, [hydrated, user, isAdmin, loadingRole, router]);

  useEffect(() => {
    if (!hydrated || user || loadingRole) return;

    let isMounted = true;

    const fetchLiveImpactStats = async () => {
      try {
        const response = await fetch("/api/live-impact");
        if (!response.ok) {
          throw new Error("Failed to fetch live impact stats");
        }

        const data: LiveImpactAggregates = await response.json();
        if (!isMounted) return;

        setLiveImpactValues({
          totalBudgetReimbursed: data.totalBudgetReimbursed ?? 0,
          totalApplicants: data.totalApplicants ?? 0,
          grantedApplicants: data.grantedApplicants ?? 0,
        });
      } catch (error) {
        console.error("Error loading live impact stats:", error);
      }
    };

    void fetchLiveImpactStats();

    return () => {
      isMounted = false;
    };
  }, [hydrated, loadingRole, user]);

  const liveImpactStats = useMemo(
    () => formatLiveImpactStats(liveImpactValues),
    [liveImpactValues]
  );

  if (!hydrated || user || loadingRole) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <LandingNavigation
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      <LandingHero />
      <LandingLiveImpact stats={liveImpactStats} />
      <LandingFeatures features={landingFeatures} />
      <LandingAbout />
      <LandingFooter />
    </div>
  );
}
