import type { SupabaseClient } from "@supabase/supabase-js";

interface Period {
  id: string;
  startDate: string;
  endDate: string;
}

interface BudgetRecommendationResult {
  recommendedBudget: number;
  budgetChange: number;
  budgetChangePercent: number;
}

/**
 * Calculates the recommended budget for the next cycle based on historical data
 * @param supabase - Supabase client instance
 * @param periods - Array of application periods sorted by date
 * @returns Budget recommendation with change percentage
 */
export async function calculateBudgetRecommendation(
  supabase: SupabaseClient,
  periods: Period[]
): Promise<BudgetRecommendationResult> {
  let recommendedBudget = 0;
  let budgetChange = 0;
  let budgetChangePercent = 0;

  if (periods.length === 0) {
    return { recommendedBudget, budgetChange, budgetChangePercent };
  }

  // Sort periods by start date (most recent first)
  const sortedPeriods = [...periods].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Use the most recent period as the base for calculation
  const basePeriod = sortedPeriods[0];
  const previousPeriod = sortedPeriods.length > 1 ? sortedPeriods[1] : null;

  if (!basePeriod) {
    return { recommendedBudget, budgetChange, budgetChangePercent };
  }

  // Fetch base period's budget
  const { data: basePeriodData } = await supabase
    .from("ApplicationPeriod")
    .select("budgetId")
    .eq("id", basePeriod.id)
    .single();

  if (!basePeriodData?.budgetId) {
    return { recommendedBudget, budgetChange, budgetChangePercent };
  }

  const { data: budgetData } = await supabase
    .from("Budget")
    .select("totalAmount, remainingAmount")
    .eq("id", basePeriodData.budgetId)
    .single();

  if (!budgetData) {
    return { recommendedBudget, budgetChange, budgetChangePercent };
  }

  const basePeriodBudget = budgetData.totalAmount;
  const basePeriodSpent = basePeriodBudget - budgetData.remainingAmount;

  // Fetch base period's applications
  const { data: baseApplications } = await supabase
    .from("Application")
    .select("status, applicationDetails")
    .eq("applicationPeriodId", basePeriod.id);

  if (!baseApplications) {
    return { recommendedBudget, budgetChange, budgetChangePercent };
  }

  const baseTotalApplicants = baseApplications.length;
  const baseApprovedCount = baseApplications.filter(
    (app) => app.status === "APPROVED"
  ).length;

  // Calculate approval rate
  const approvalRate =
    baseTotalApplicants > 0 ? baseApprovedCount / baseTotalApplicants : 0.5; // Default 50% if no data

  // Calculate applicant growth rate if we have previous period data
  let applicantGrowthRate = 0;
  if (previousPeriod) {
    const { data: prevApplications } = await supabase
      .from("Application")
      .select("id")
      .eq("applicationPeriodId", previousPeriod.id);

    const prevTotalApplicants = prevApplications?.length || 0;
    if (prevTotalApplicants > 0) {
      applicantGrowthRate =
        (baseTotalApplicants - prevTotalApplicants) / prevTotalApplicants;
    }
  }

  // Use spent budget if significant (>20% spent), otherwise use total budget
  const baseBudget =
    basePeriodSpent > basePeriodBudget * 0.2
      ? basePeriodSpent
      : basePeriodBudget;

  // Adjust for applicant growth (cap at 50% increase/decrease)
  const growthFactor = Math.max(-0.5, Math.min(0.5, applicantGrowthRate));

  // Adjust for approval rate (if approval rate is high, expect more grants)
  const approvalFactor =
    approvalRate > 0.7 ? 1.1 : approvalRate > 0.5 ? 1.0 : 0.9;

  // Buffer for unexpected approvals (10%)
  const bufferFactor = 1.1;

  // Calculate recommended budget
  recommendedBudget = Math.round(
    baseBudget * (1 + growthFactor) * approvalFactor * bufferFactor
  );

  // Ensure minimum budget (at least 50% of base period budget)
  recommendedBudget = Math.max(recommendedBudget, basePeriodBudget * 0.5);

  // Calculate change compared to base period budget
  budgetChange = recommendedBudget - basePeriodBudget;
  budgetChangePercent =
    basePeriodBudget > 0 ? (budgetChange / basePeriodBudget) * 100 : 0;

  return { recommendedBudget, budgetChange, budgetChangePercent };
}
