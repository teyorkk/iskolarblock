import { LandingPageClient } from "@/components/landing/landing-page-client";
import { getLiveImpactAggregates } from "@/lib/services/live-impact";

export default async function Home() {
  let initialLiveImpactValues = {
    totalBudgetReimbursed: 0,
    totalApplicants: 0,
    grantedApplicants: 0,
  };

  try {
    initialLiveImpactValues = await getLiveImpactAggregates();
  } catch (error) {
    console.error("Failed to fetch live impact data on initial load:", error);
  }

  return (
    <LandingPageClient initialLiveImpactValues={initialLiveImpactValues} />
  );
}
