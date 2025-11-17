import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/utils/auth-server";
import { expirePendingApplications } from "@/lib/services/application-status";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
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
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
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

export async function GET(request: Request, context: RouteContext) {
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
    const { id } = await context.params;

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
        CertificateOfRegistration (*),
        BlockchainRecord:BlockchainRecord_applicationId_fkey (
          id,
          transactionHash
        )
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
