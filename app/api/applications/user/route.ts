import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { expirePendingApplications } from "@/lib/services/application-status";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    await expirePendingApplications(supabase);

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from User table
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("id")
      .eq("email", user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userData.id;

    // Fetch user's applications with related data
    const { data: applications, error: applicationsError } = await supabase
      .from("Application")
      .select(
        `
        id,
        status,
        applicationType,
        applicationDetails,
        createdAt,
        updatedAt,
        id_image,
        applicationPeriodId
      `
      )
      .eq("userId", userId)
      .order("createdAt", { ascending: false });

    if (applicationsError) {
      console.error("Error fetching applications:", applicationsError);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedApplications = applications.map((app) => ({
      id: app.id,
      date: new Date(app.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      type:
        app.applicationType === "NEW"
          ? "New Application"
          : "Renewal Application",
      status: app.status,
      remarks: getStatusRemarks(app.status),
      details: app.applicationDetails,
      id_image: app.id_image,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      applications: transformedApplications,
    });
  } catch (error) {
    console.error("Error in user applications API:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function getStatusRemarks(status: string): string {
  switch (status) {
    case "APPROVED":
      return "Your have completed your application. It has been approved. Congratulations!";
    case "GRANTED":
      return "Your scholarship has been granted. Expect disbursement instructions soon.";
    case "PENDING":
      return "Your application is incomplete. Please provide the missing files and information.";
    case "REJECTED":
      return "Your application was not approved. You may apply again in the next period.";
    default:
      return "Status unknown";
  }
}
