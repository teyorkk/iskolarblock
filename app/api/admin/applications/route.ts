import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();

    // Verify admin user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("role")
      .eq("email", user.email)
      .single();

    if (userError || userData?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get periodId from query parameters
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("periodId");

    // Fetch applications with user data
    let query = supabase
      .from("Application")
      .select(
        `
        id,
        userId,
        status,
        applicationType,
        createdAt,
        updatedAt,
        applicationDetails,
        applicationPeriodId,
        User!Application_userId_fkey (
          id,
          name,
          email
        )
      `
      );

    // Filter by period if provided
    if (periodId) {
      query = query.eq("applicationPeriodId", periodId);
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

