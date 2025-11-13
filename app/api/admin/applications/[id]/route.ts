import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const supabase = await getSupabaseServerClient();
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

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

    // Validate status
    const validStatuses = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update application status
    const { data, error } = await supabase
      .from("Application")
      .update({
        status,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating application:", error);
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    return NextResponse.json({ application: data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const supabase = await getSupabaseServerClient();
    const { id } = await context.params;

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

    // Fetch application with all related data
    const { data: application, error: appError } = await supabase
      .from("Application")
      .select(
        `
        *,
        User!Application_userId_fkey (
          id,
          name,
          email,
          phone,
          address
        ),
        CertificateOfGrades (*),
        CertificateOfRegistration (*)
      `
      )
      .eq("id", id)
      .single();

    if (appError) {
      console.error("Error fetching application:", appError);
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

