import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/utils/auth-server";
import { expirePendingApplications } from "@/lib/services/application-status";
import { getCurrentTimePH } from "@/lib/utils/date-formatting";

export async function GET(request: Request) {
  try {
    // Verify admin user using database role check
    try {
      await requireAdmin();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unauthorized";
      const status = message.includes("Forbidden") ? 403 : 401;
      return NextResponse.json({ error: message }, { status });
    }

    const supabase = await getSupabaseServerClient();
    await expirePendingApplications(supabase);

    // Get periodId from query parameters
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("periodId");

    // If no periodId is provided, get the active period
    let activePeriodId = periodId;
    if (!activePeriodId) {
      const { data: activePeriod } = await supabase
        .from("ApplicationPeriod")
        .select("id")
        .lte("startDate", getCurrentTimePH())
        .gte("endDate", getCurrentTimePH())
        .single();

      if (activePeriod) {
        activePeriodId = activePeriod.id;
      } else {
        // If no active period, get the most recent one
        const { data: latestPeriod } = await supabase
          .from("ApplicationPeriod")
          .select("id")
          .order("createdAt", { ascending: false })
          .limit(1)
          .single();

        if (latestPeriod) {
          activePeriodId = latestPeriod.id;
        }
      }
    }

    // Fetch applications with user data
    let query = supabase.from("Application").select(
      `
        id,
        userId,
        status,
        applicationType,
        createdAt,
        updatedAt,
        applicationDetails,
        applicationPeriodId,
        remarks,
        User!Application_userId_fkey (
          id,
          name,
          email
        )
      `
    );

    // Filter by period
    if (activePeriodId) {
      query = query.eq("applicationPeriodId", activePeriodId);
    }

    const { data: applications, error: appsError } = await query.order(
      "createdAt",
      { ascending: false }
    );

    if (appsError) {
      console.error("Error fetching applications:", appsError);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
