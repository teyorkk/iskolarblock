import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
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

    // Fetch all applications with user data
    const { data: applications, error: appsError } = await supabase
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
        User!Application_userId_fkey (
          id,
          name,
          email
        )
      `
      )
      .order("createdAt", { ascending: false });

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

