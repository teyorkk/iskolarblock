import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/utils/auth-server";
import { logAwardingToBlockchain } from "@/lib/services/blockchain";
import { logEvent } from "@/lib/services/log-events";
import { sendEmailNotification } from "@/lib/services/email-notification";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  let adminInfo: { email: string; role: string } | null = null;
  try {
    try {
      adminInfo = await requireAdmin();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unauthorized";
      const status = message.includes("Forbidden") ? 403 : 401;
      return NextResponse.json({ error: message }, { status });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body as { status?: string };

    if (status !== "GRANTED") {
      return NextResponse.json(
        { error: "Invalid status update. Only GRANTED is allowed." },
        { status: 400 }
      );
    }

    const { data: existingApplication, error: fetchError } = await supabaseAdmin
      .from("Application")
      .select(
        `
        id,
        userId,
        status,
        applicationDetails,
        applicationPeriodId,
        applicationType,
        createdAt,
        User!Application_userId_fkey (
          id,
          name,
          email
        )
      `
      )
      .eq("id", id)
      .single();

    if (fetchError || !existingApplication) {
      console.error("Application not found for awarding update:", fetchError);
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const previousStatus = existingApplication.status ?? "PENDING";
    const statusValue = "GRANTED";
    const scholarAmount = determineScholarAmount(
      existingApplication.applicationDetails
    );

    const { data, error } = await supabaseAdmin
      .from("Application")
      .update({
        status: statusValue,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating awarding status:", error);
      return NextResponse.json(
        { error: "Failed to update awarding status" },
        { status: 500 }
      );
    }

    const budgetAdjustmentResult = await adjustBudgetBalance({
      supabase: supabaseAdmin,
      applicationPeriodId: existingApplication.applicationPeriodId,
      previousStatus,
      newStatus: statusValue,
      amount: scholarAmount,
    });

    if (!budgetAdjustmentResult.success) {
      console.error("Budget adjustment failed:", budgetAdjustmentResult.error);
      // Attempt to revert awarding status changes to keep data consistent
      await supabaseAdmin
        .from("Application")
        .update({
          status: previousStatus,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id);

      return NextResponse.json(
        { error: "Failed to update budget for granted scholarship" },
        { status: 500 }
      );
    }

    const awardeeName = getAwardeeName(existingApplication);
    const awardingRecordResult = await ensureAwardingRecord({
      supabase: supabaseAdmin,
      applicationId: id,
      amount: scholarAmount,
      name: awardeeName,
    });

    if (!awardingRecordResult.success || !awardingRecordResult.awardingId) {
      return NextResponse.json(
        { error: "Failed to record awarding details" },
        { status: 500 }
      );
    }

    const blockchainRecordResult = await logAwardingBlockchainRecord({
      supabase: supabaseAdmin,
      awardingId: awardingRecordResult.awardingId,
      applicationId: id,
      userId: existingApplication.userId ?? null,
      amount: scholarAmount,
    });

    if (!blockchainRecordResult.success) {
      return NextResponse.json(
        { error: "Failed to log awarding on blockchain" },
        { status: 500 }
      );
    }

    let adminProfile: {
      id: string;
      name: string | null;
      email: string | null;
      role: string | null;
      profilePicture: string | null;
    } | null = null;
    if (adminInfo?.email) {
      const { data: adminUser } = await supabaseAdmin
        .from("User")
        .select("id, name, email, role, profilePicture")
        .eq("email", adminInfo.email)
        .maybeSingle();
      adminProfile = adminUser ?? null;
    }

    await logEvent({
      eventType: "ADMIN_AWARD_GRANTED",
      message: `Marked application ${id} as granted`,
      actorId: adminProfile?.id ?? null,
      actorRole: adminProfile?.role ?? adminInfo?.role ?? "ADMIN",
      actorName: adminProfile?.name ?? adminInfo?.email ?? "Admin",
      actorUsername: adminProfile?.email ?? adminInfo?.email ?? null,
      actorAvatarUrl: adminProfile?.profilePicture ?? null,
      metadata: { applicationId: id, amount: scholarAmount },
    });

    // Send email notification for GRANTED status
    const userData = Array.isArray(existingApplication.User)
      ? existingApplication.User[0]
      : existingApplication.User;
    const userEmail = userData?.email;

    if (userEmail) {
      const applicantName = getAwardeeName(existingApplication);

      await sendEmailNotification({
        applicantName,
        applicantEmail: userEmail,
        applicationId: id,
        applicationType: existingApplication.applicationType || "NEW",
        status: "GRANTED",
        submissionDate: existingApplication.createdAt,
      }).catch((error) => {
        console.error("Failed to send granted notification email:", error);
        // Don't fail the awarding if email fails
      });
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

function extractPersonalInfo(details: unknown): Record<string, unknown> | null {
  if (!details || typeof details !== "object") {
    return null;
  }

  if ("personalInfo" in details) {
    const personalInfo = (details as Record<string, unknown>).personalInfo;
    if (personalInfo && typeof personalInfo === "object") {
      return personalInfo as Record<string, unknown>;
    }
  }

  return details as Record<string, unknown>;
}

function determineScholarAmount(details: unknown): number {
  const personalInfo = extractPersonalInfo(details);
  const yearLevelRaw = personalInfo?.yearLevel;
  const yearLevel =
    typeof yearLevelRaw === "string" ? yearLevelRaw.toLowerCase() : "";
  const seniorHighTokens = [
    "g11",
    "grade 11",
    "grade11",
    "g12",
    "grade 12",
    "grade12",
    "senior high",
    "shs",
  ];
  const isSeniorHigh = seniorHighTokens.some((token) =>
    yearLevel.includes(token)
  );

  return isSeniorHigh ? 500 : 1000;
}

async function adjustBudgetBalance({
  supabase,
  applicationPeriodId,
  previousStatus,
  newStatus,
  amount,
}: {
  supabase: ReturnType<typeof getSupabaseAdminClient>;
  applicationPeriodId: string | null;
  previousStatus: string;
  newStatus: string;
  amount: number;
}): Promise<{ success: boolean; error?: string }> {
  const previouslyGranted = previousStatus === "GRANTED";
  const newlyGranted = newStatus === "GRANTED";

  if (previouslyGranted === newlyGranted || !applicationPeriodId) {
    return { success: true };
  }

  const { data: period, error: periodError } = await supabase
    .from("ApplicationPeriod")
    .select("id, budgetId")
    .eq("id", applicationPeriodId)
    .single();

  if (periodError || !period || !period.budgetId) {
    if (periodError) {
      console.error(
        "Failed to fetch application period for budget update:",
        periodError
      );
      return {
        success: false,
        error: "Unable to locate application period budget",
      };
    }

    return { success: true };
  }

  const { data: budget, error: budgetError } = await supabase
    .from("Budget")
    .select("id, remainingAmount")
    .eq("id", period.budgetId)
    .single();

  if (budgetError || !budget) {
    console.error("Failed to fetch budget for awarding update:", budgetError);
    return { success: false, error: "Budget record not found" };
  }

  const currentRemaining = budget.remainingAmount ?? 0;
  const delta = newlyGranted ? -amount : amount;
  const newRemaining = newlyGranted
    ? Math.max(0, currentRemaining + delta)
    : currentRemaining + delta;

  const { error: updateError } = await supabase
    .from("Budget")
    .update({
      remainingAmount: newRemaining,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", period.budgetId);

  if (updateError) {
    console.error("Failed to adjust budget balance:", updateError);
    return { success: false, error: "Budget update failed" };
  }

  return { success: true };
}

function getAwardeeName(application: { applicationDetails: unknown }): string {
  const personalInfo = extractPersonalInfo(application.applicationDetails);
  if (personalInfo) {
    const firstName = readStringField(personalInfo, "firstName");
    const middleName = readStringField(personalInfo, "middleName");
    const lastName = readStringField(personalInfo, "lastName");
    const parts = [firstName, middleName, lastName].filter(Boolean);
    if (parts.length) {
      return parts.join(" ");
    }
  }
  return "Scholarship Awardee";
}

function readStringField(
  source: Record<string, unknown>,
  key: string
): string | undefined {
  const value = source[key];
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

async function ensureAwardingRecord({
  supabase,
  applicationId,
  amount,
  name,
}: {
  supabase: ReturnType<typeof getSupabaseAdminClient>;
  applicationId: string;
  amount: number;
  name: string;
}): Promise<{ success: boolean; awardingId?: string }> {
  const { data: existing, error } = await supabase
    .from("Awarding")
    .select("id")
    .eq("applicationId", applicationId)
    .limit(1);

  if (error) {
    console.error("Failed to query awarding record:", error);
    return { success: false };
  }

  if (existing && existing.length > 0) {
    return { success: true, awardingId: existing[0].id };
  }

  const awardingId = randomUUID();
  const { error: insertError } = await supabase.from("Awarding").insert({
    id: awardingId,
    name,
    applicationId,
    amountReceived: amount,
    timestamp: new Date().toISOString(),
  });

  if (insertError) {
    console.error("Failed to insert awarding record:", insertError);
    return { success: false };
  }

  return { success: true, awardingId };
}

async function logAwardingBlockchainRecord({
  supabase,
  awardingId,
  applicationId,
  userId,
  amount,
}: {
  supabase: ReturnType<typeof getSupabaseAdminClient>;
  awardingId: string;
  applicationId: string;
  userId: string | null;
  amount: number;
}): Promise<{ success: boolean }> {
  try {
    const blockchainTxHash = await logAwardingToBlockchain(
      awardingId,
      applicationId,
      amount
    );

    const transactionHash =
      blockchainTxHash ??
      `local-${awardingId}-${applicationId}-${Date.now().toString(16)}`;

    if (!blockchainTxHash) {
      console.warn(
        "Blockchain transaction hash unavailable. Using locally generated reference instead."
      );
    }

    const { error: insertError } = await supabase
      .from("BlockchainRecord")
      .insert({
        id: randomUUID(),
        recordType: "AWARDING",
        transactionHash,
        awardingId,
        applicationId,
        userId,
      });

    if (insertError) {
      console.error("Failed to insert blockchain record:", insertError);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to log awarding blockchain record:", error);
    return { success: false };
  }
}
