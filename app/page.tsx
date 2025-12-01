import { LandingPageClient } from "@/components/landing/landing-page-client";
import { getLiveImpactAggregates } from "@/lib/services/live-impact";
import { getLiveBlockchainFeed } from "@/lib/services/live-blockchain";
import type { LiveBlockchainRecord } from "@/types";

// Use ISR (Incremental Static Regeneration) with 5 minute revalidation
// This balances data freshness with performance
export const revalidate = 300; // Revalidate every 5 minutes

export default async function Home() {
  let initialLiveImpactValues = {
    totalBudgetReimbursed: 0,
    totalApplicants: 0,
    grantedApplicants: 0,
  };

  let initialBlockchainFeed: LiveBlockchainRecord[] = [];

  try {
    const [impactData, blockchainFeed] = await Promise.all([
      getLiveImpactAggregates(),
      getLiveBlockchainFeed(),
    ]);
    initialLiveImpactValues = impactData;
    initialBlockchainFeed = blockchainFeed;
  } catch (error) {
    console.error("Failed to fetch landing data on initial load:", error);
  }

  return (
    <LandingPageClient
      initialLiveImpactValues={initialLiveImpactValues}
      initialBlockchainFeed={initialBlockchainFeed}
    />
  );
}
