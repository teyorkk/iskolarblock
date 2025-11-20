import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface LiveImpactAggregates {
  totalBudgetReimbursed: number;
  totalApplicants: number;
  grantedApplicants: number;
}

export async function getLiveImpactAggregates(): Promise<LiveImpactAggregates> {
  const supabase = getSupabaseServerClient();

  const [awardingResult, applicantsResult, grantedResult] = await Promise.all([
    supabase.from("Awarding").select("amountReceived"),
    supabase.from("Application").select("*", { count: "exact", head: true }),
    supabase
      .from("Application")
      .select("*", { count: "exact", head: true })
      .eq("status", "GRANTED"),
  ]);

  const errors = [
    awardingResult.error,
    applicantsResult.error,
    grantedResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(
      errors
        .map(
          (err) =>
            `Live impact aggregation error: ${
              err?.message ?? "Unknown Supabase error"
            }`
        )
        .join("; ")
    );
  }

  const awardingRows = (awardingResult.data ?? []) as Array<{
    amountReceived: number | null;
  }>;

  const totalBudgetReimbursed = awardingRows.reduce(
    (sum, row) => sum + Number(row.amountReceived ?? 0),
    0
  );

  return {
    totalBudgetReimbursed,
    totalApplicants: applicantsResult.count ?? 0,
    grantedApplicants: grantedResult.count ?? 0,
  };
}
