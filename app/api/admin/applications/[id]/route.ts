import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/utils/auth-server";
import { expirePendingApplications } from "@/lib/services/application-status";
import { sendEmailNotification } from "@/lib/services/email-notification";
import { getCurrentTimePH } from "@/lib/utils/date-formatting";

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
    const { status, remarks } = body;

    // Validate status
    const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Prepare update object
    const updateData: {
      status: string;
      updatedAt: string;
      remarks?: string | null;
    } = {
      status,
      updatedAt: getCurrentTimePH(),
    };

    // Handle remarks based on status
    if (status === "APPROVED") {
      // Set remarks to "Cleared" when approved
      updateData.remarks = "Cleared";
    } else if (status === "REJECTED") {
      // Include remarks for rejections if provided
      if (remarks !== undefined) {
        updateData.remarks = remarks;
      }
    } else if (status === "GRANTED") {
      // Don't update remarks for granted status
      // Don't include remarks in updateData
    } else {
      // For other statuses, include remarks if provided
      if (remarks !== undefined) {
        updateData.remarks = remarks;
      }
    }

    // Update application status
    const { data, error } = await supabase
      .from("Application")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        User!Application_userId_fkey (
          id,
          name,
          email
        )
      `
      )
      .single();

    if (error) {
      console.error("Error updating application:", error);
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    // Send email notification for APPROVED or REJECTED status
    if (data && (status === "APPROVED" || status === "REJECTED")) {
      const userData = Array.isArray(data.User) ? data.User[0] : data.User;
      const userEmail = userData?.email;

      if (userEmail) {
        // Extract applicant name from application details
        const applicationDetails =
          typeof data.applicationDetails === "object" &&
          data.applicationDetails !== null
            ? data.applicationDetails
            : {};
        const personalInfo =
          "personalInfo" in applicationDetails &&
          typeof applicationDetails.personalInfo === "object"
            ? (applicationDetails.personalInfo as Record<string, unknown>)
            : {};

        const firstName =
          typeof personalInfo.firstName === "string"
            ? personalInfo.firstName
            : "";
        const middleName =
          typeof personalInfo.middleName === "string"
            ? personalInfo.middleName
            : "";
        const lastName =
          typeof personalInfo.lastName === "string"
            ? personalInfo.lastName
            : "";
        const applicantName =
          `${firstName} ${middleName} ${lastName}`.trim() || "Applicant";

        await sendEmailNotification({
          applicantName,
          applicantEmail: userEmail,
          applicationId: id,
          applicationType: data.applicationType || "NEW",
          status: status as "APPROVED" | "REJECTED",
          rejectionReason: status === "REJECTED" ? remarks : undefined,
          submissionDate: data.createdAt,
        }).catch((error) => {
          console.error("Failed to send status update email:", error);
          // Don't fail the status update if email fails
        });
      }
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
