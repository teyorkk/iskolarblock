import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { logApplicationToBlockchain } from "@/lib/services/blockchain";
import { logEvent } from "@/lib/services/log-events";
import { sendEmailNotification } from "@/lib/services/email-notification";
import { getDocumentRemarks } from "@/lib/utils/application-remarks";
import { getCurrentTimePH } from "@/lib/utils/date-formatting";

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const { applicationId, userId } = body;

    // Validate required fields
    if (!applicationId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: applicationId and userId" },
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get application data
    const { data: applicationData, error: appError } = await supabase
      .from("Application")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (appError || !applicationData) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Log to blockchain
    // Blockchain stores: application ID + user ID hashed together
    // This creates an immutable record on Polygon Amoy testnet
    let transactionHash: string | null = null;
    try {
      transactionHash = await logApplicationToBlockchain(
        applicationId,
        userData.id
      );
      console.log("Blockchain transaction hash:", transactionHash);

      // Persist blockchain record in database when available
      if (transactionHash) {
        try {
          const blockchainRecord = {
            id: randomUUID(),
            recordType: "APPLICATION",
            transactionHash,
            applicationId,
            userId: userData.id,
            timestamp: getCurrentTimePH(),
          };

          const { error: brError } = await supabase
            .from("BlockchainRecord")
            .insert(blockchainRecord);

          if (brError) {
            console.error("Failed to persist blockchain record:", brError);
          } else {
            console.log("Blockchain record saved:", blockchainRecord.id);
          }
        } catch (persistError) {
          console.error("Error saving blockchain record:", persistError);
        }
      }
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
          applicationType: applicationData.applicationType || "NEW",
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
        applicantName: applicationData.applicationDetails?.personalInfo
          ?.firstName
          ? `${applicationData.applicationDetails.personalInfo.firstName} ${applicationData.applicationDetails.personalInfo.lastName}`
          : userData.name || "Applicant",
        applicantEmail: userData.email,
        applicationId,
        applicationType: applicationData.applicationType || "NEW",
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
      data: applicationData,
      transactionHash,
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
