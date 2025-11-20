import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type AwardingRow = {
  amountReceived: number | null;
};

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = getSupabaseServerClient();

    const [awardingResult, applicantsResult, grantedResult] = await Promise.all(
      [
        supabase.from("Awarding").select("amountReceived"),
        supabase
          .from("Application")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("Application")
          .select("*", { count: "exact", head: true })
          .eq("status", "GRANTED"),
      ]
    );

    const errors = [
      awardingResult.error,
      applicantsResult.error,
      grantedResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error("Live impact aggregation errors:", errors);
      return NextResponse.json(
        { error: "Failed to load live impact data." },
        { status: 500 }
      );
    }

    const awardingRows = (awardingResult.data ?? []) as AwardingRow[];
    const totalBudgetReimbursed = awardingRows.reduce(
      (sum, row) => sum + Number(row.amountReceived ?? 0),
      0
    );

    return NextResponse.json({
      totalBudgetReimbursed,
      totalApplicants: applicantsResult.count ?? 0,
      grantedApplicants: grantedResult.count ?? 0,
    });
  } catch (error) {
    console.error("Live impact aggregation failed:", error);
    return NextResponse.json(
      { error: "Failed to load live impact data." },
      { status: 500 }
    );
  }
}
