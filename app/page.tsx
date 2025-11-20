"use client";

import { useState, useEffect } from "react";
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

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [liveImpactStats, setLiveImpactStats] = useState<LiveImpactStat[]>(
    landingLiveImpactStats
  );
  const { ready, user, isAdmin, loadingRole } = useSession();
  const hydrated = ready && typeof window !== "undefined";

  useEffect(() => {
    if (!hydrated || loadingRole) return;
    if (user) {
      // If user is logged in, redirect based on role from database
      const redirectPath = isAdmin ? "/admin-dashboard" : "/user-dashboard";
      router.push(redirectPath);
    }
  }, [hydrated, user, isAdmin, loadingRole, router]);

  useEffect(() => {
    if (!hydrated || user || loadingRole) return;

    let isMounted = true;

    const numberFormatter = new Intl.NumberFormat("en-PH", {
      maximumFractionDigits: 0,
    });

    const updateStatValue = (
      stats: LiveImpactStat[],
      id: LiveImpactStat["id"],
      value: number
    ) =>
      stats.map((stat) =>
        stat.id === id
          ? { ...stat, value: numberFormatter.format(value) }
          : stat
      );

    const fetchLiveImpactStats = async () => {
      try {
        const response = await fetch("/api/live-impact");
        if (!response.ok) {
          throw new Error("Failed to fetch live impact stats");
        }

        const data: {
          totalBudgetReimbursed: number;
          totalApplicants: number;
          grantedApplicants: number;
        } = await response.json();

        if (!isMounted) return;

        setLiveImpactStats((prev) => {
          let updated = updateStatValue(
            prev,
            "budget-reimbursed",
            data.totalBudgetReimbursed ?? 0
          );
          updated = updateStatValue(
            updated,
            "total-applicants",
            data.totalApplicants ?? 0
          );
          updated = updateStatValue(
            updated,
            "scholars-granted",
            data.grantedApplicants ?? 0
          );
          return updated;
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

  // Show loading while checking session or redirecting
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
