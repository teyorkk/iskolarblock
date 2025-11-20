"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { Loading } from "@/components/loading";
import { LandingNavigation } from "@/components/landing/landing-navigation";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingLiveImpact } from "@/components/landing/landing-live-impact";
import { LandingBlockchainFeed } from "@/components/landing/landing-blockchain-feed";
import { LandingAbout } from "@/components/landing/landing-about";
import { LandingFooter } from "@/components/landing/landing-footer";
import { landingFeatures } from "@/lib/constants/landing-features";
import { landingLiveImpactStats } from "@/lib/constants/landing-live-impact";
import type { LiveBlockchainRecord, LiveImpactStat } from "@/types";
import type { LiveImpactAggregates } from "@/lib/services/live-impact";

interface LandingPageClientProps {
  initialLiveImpactValues: LiveImpactAggregates;
  initialBlockchainFeed: LiveBlockchainRecord[];
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
  initialBlockchainFeed,
}: LandingPageClientProps): React.JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { ready, user, isAdmin, loadingRole } = useSession();
  const hydrated = ready && typeof window !== "undefined";
  const [liveImpactValues, setLiveImpactValues] = useState(
    initialLiveImpactValues
  );
  const [blockchainFeed, setBlockchainFeed] = useState<LiveBlockchainRecord[]>(
    initialBlockchainFeed
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

    const fetchLandingData = async () => {
      try {
        const [impactResponse, feedResponse] = await Promise.all([
          fetch("/api/live-impact"),
          fetch("/api/live-blockchain-feed"),
        ]);

        if (impactResponse.ok) {
          const impactData: LiveImpactAggregates = await impactResponse.json();
          if (isMounted) {
            setLiveImpactValues({
              totalBudgetReimbursed: impactData.totalBudgetReimbursed ?? 0,
              totalApplicants: impactData.totalApplicants ?? 0,
              grantedApplicants: impactData.grantedApplicants ?? 0,
            });
          }
        }

        if (feedResponse.ok) {
          const feedData: LiveBlockchainRecord[] = await feedResponse.json();
          if (isMounted) {
            setBlockchainFeed(feedData ?? []);
          }
        }
      } catch (error) {
        console.error("Error loading landing data:", error);
      }
    };

    void fetchLandingData();

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
      <LandingBlockchainFeed records={blockchainFeed} />
      <LandingFeatures features={landingFeatures} />
      <LandingAbout />
      <LandingFooter />
    </div>
  );
}
