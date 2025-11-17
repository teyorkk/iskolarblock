import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/utils/auth-server";

export async function GET(request: Request) {
  try {
    try {
      await requireAdmin();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unauthorized";
      const status = message.includes("Forbidden") ? 403 : 401;
      return NextResponse.json({ error: message }, { status });
    }

    const supabase = await getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("periodId");

    let query = supabase.from("Application").select(
      `
        id,
        userId,
        status,
        applicationType,
        applicationDetails,
        applicationPeriodId,
        createdAt,
        User:User!Application_userId_fkey (
          id,
          name,
          email
        )
      `
    );

    query = query.in("status", ["APPROVED", "GRANTED"]);

    if (periodId) {
      query = query.eq("applicationPeriodId", periodId);
    }

    const { data, error } = await query.order("createdAt", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching awarding candidates:", error);
      return NextResponse.json(
        { error: "Failed to fetch awarding candidates" },
        { status: 500 }
      );
    }

    return NextResponse.json({ applications: data ?? [] });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
