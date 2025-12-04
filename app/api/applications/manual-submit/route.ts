import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { logApplicationToBlockchain } from "@/lib/services/blockchain";
import { logEvent } from "@/lib/services/log-events";
import { sendEmailNotification } from "@/lib/services/email-notification";

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const {
      userId,
      applicationPeriodId,
      applicationType,
      status,
      applicationDetails,
    } = body;

    // Validate required fields
    if (!userId || !applicationPeriodId || !applicationDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("id, name, email, role")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate application ID
    const applicationId = `APP-${Date.now()}-${randomUUID().substring(0, 8).toUpperCase()}`;

    // Prepare application data for database
    const applicationData = {
      id: applicationId,
      userId: userData.id,
      applicationPeriodId,
      applicationType: applicationType || "NEW",
      status: status || "PENDING",
      applicationDetails,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert application into database
    const { data: insertedApplication, error: insertError } = await supabase
      .from("Application")
      .insert(applicationData)
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting application:", insertError);
      return NextResponse.json(
        { error: "Failed to submit application", details: insertError.message },
        { status: 500 }
      );
    }

    // Log to blockchain
    // Blockchain stores: application ID + user ID hashed together
    // This creates an immutable record on Polygon Amoy testnet
    let transactionHash: string | null = null;
    try {
      transactionHash = await logApplicationToBlockchain(applicationId, userData.id);
      console.log("Blockchain transaction hash:", transactionHash);
    } catch (blockchainError) {
      console.error("Blockchain logging failed:", blockchainError);
      // Continue even if blockchain logging fails
    }

    // Log event
    try {
      await logEvent({
        eventType: "USER_APPLICATION_SUBMITTED",
        message: `Manual application submitted: ${applicationId}`,
        actorId: userData.id,
        actorName: userData.name || "Unknown",
        actorRole: userData.role || "USER",
        metadata: {
          applicationId,
          applicationType: applicationType || "NEW",
          submissionMethod: "MANUAL_ENTRY",
        },
      });
    } catch (logError) {
      console.error("Event logging failed:", logError);
      // Continue even if event logging fails
    }

    // Send email notification
    try {
      await sendEmailNotification({
        applicantName: applicationDetails.personalInfo?.firstName
          ? `${applicationDetails.personalInfo.firstName} ${applicationDetails.personalInfo.lastName}`
          : userData.name || "Applicant",
        applicantEmail: userData.email,
        applicationId,
        applicationType: applicationType || "NEW",
        status: "PENDING",
        submissionDate: new Date().toLocaleDateString(),
      });
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      applicationId,
      message: "Application submitted successfully",
      data: insertedApplication,
    });
  } catch (error) {
    console.error("Error in manual application submission:", error);
    return NextResponse.json(
      {
        error: "Failed to submit application",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
