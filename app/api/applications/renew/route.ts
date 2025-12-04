import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import type { GradeSubject } from "@/lib/services/document-extraction";
import { logApplicationToBlockchain } from "@/lib/services/blockchain";
import {
  capitalizeFormData,
  capitalizeName,
  capitalizeText,
} from "@/lib/utils";
import { getDocumentRemarks } from "@/lib/utils/application-remarks";
import { sendEmailNotification } from "@/lib/services/email-notification";

interface RenewApplicationRequest {
  // Images (base64 strings)
  idImage?: string; // base64
  cogFile?: string;
  corFile?: string;
  cogFileName?: string;
  corFileName?: string;

  // OCR Data
  idOcr?: {
    rawText: string;
    processedText?: string;
  };
  cogOcr?: {
    rawText: string;
    processedText?: string;
    fileUrl?: string; // Storage path from Supabase
    extractedData?: {
      school: string | null;
      school_year: string | null;
      semester: string | null;
      course: string | null;
      name: string | null;
      gwa: number | null;
      total_units: number | null;
      subjects: GradeSubject[] | null;
    } | null;
  };
  corOcr?: {
    rawText: string;
    processedText?: string;
    fileUrl?: string; // Storage path from Supabase
    extractedData?: {
      school: string | null;
      school_year: string | null;
      semester: string | null;
      course: string | null;
      name: string | null;
      total_units: number | null;
    } | null;
  };
}

interface DocumentUploadParams {
  base64: string;
  fileName: string;
  userId: string;
  applicationId: string;
  type: "cog" | "cor";
}

const uploadDocumentFromBase64 = async (
  supabase: ReturnType<typeof getSupabaseServerClient>,
  { base64, fileName, userId, applicationId, type }: DocumentUploadParams
): Promise<string | null> => {
  try {
    const cleaned = base64.replace(/^data:.*;base64,/, "");
    const buffer = Buffer.from(cleaned, "base64");
    const filePath = `applications/${userId}/${applicationId}/${type}-${Date.now()}-${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, buffer, {
        contentType: fileName.endsWith(".pdf")
          ? "application/pdf"
          : "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(`${type.toUpperCase()} upload error:`, uploadError);
      return null;
    }

    const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error(`Failed to upload ${type} document:`, error);
    return null;
  }
};

const resolveStoredDocumentUrl = (
  supabase: ReturnType<typeof getSupabaseServerClient>,
  path?: string | null
): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = supabase.storage.from("documents").getPublicUrl(path);
  return data.publicUrl ?? null;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const body = (await request.json()) as RenewApplicationRequest;

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
      .select("id, email")
      .eq("email", user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userData.id;

    // Fetch the most recent application for this user to get personal info
    const { data: previousApplication, error: prevAppError } = await supabase
      .from("Application")
      .select("id, applicationDetails")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();

    if (prevAppError || !previousApplication) {
      return NextResponse.json(
        { error: "No previous application found" },
        { status: 404 }
      );
    }

    // Get current application period
    const { data: periodData, error: periodError } = await supabase
      .from("ApplicationPeriod")
      .select("id")
      .eq("isOpen", true)
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();

    if (periodError || !periodData) {
      return NextResponse.json(
        { error: "No open application period found" },
        { status: 400 }
      );
    }

    const applicationId = randomUUID();
    const previousDetails = previousApplication.applicationDetails;
    const personalInfoData =
      previousDetails &&
      typeof previousDetails === "object" &&
      "personalInfo" in previousDetails
        ? (previousDetails as { personalInfo?: Record<string, string> })
            .personalInfo
        : previousDetails;

    // Upload images to storage
    let idImageUrl = "";
    let cogDocumentUrl: string | null = null;
    let corDocumentUrl: string | null = null;

    // Upload ID image
    if (body.idImage && body.idImage.trim() !== "") {
      const idImageBuffer = Buffer.from(
        body.idImage.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      const idFileName = `applications/${userId}/${applicationId}/id-${Date.now()}.jpg`;
      const { error: idUploadError } = await supabase.storage
        .from("documents")
        .upload(idFileName, idImageBuffer, {
          contentType: "image/jpeg",
          cacheControl: "3600",
        });

      if (idUploadError) {
        console.error("ID image upload error:", idUploadError);
        // Continue without image URL if upload fails
      } else {
        const { data: idUrlData } = supabase.storage
          .from("documents")
          .getPublicUrl(idFileName);
        idImageUrl = idUrlData.publicUrl;
      }
    }

    if (body.cogFile && body.cogFileName) {
      cogDocumentUrl = await uploadDocumentFromBase64(supabase, {
        base64: body.cogFile,
        fileName: body.cogFileName,
        userId,
        applicationId,
        type: "cog",
      });
    } else if (body.cogOcr?.fileUrl) {
      cogDocumentUrl = resolveStoredDocumentUrl(supabase, body.cogOcr.fileUrl);
    }

    if (body.corFile && body.corFileName) {
      corDocumentUrl = await uploadDocumentFromBase64(supabase, {
        base64: body.corFile,
        fileName: body.corFileName,
        userId,
        applicationId,
        type: "cor",
      });
    } else if (body.corOcr?.fileUrl) {
      corDocumentUrl = resolveStoredDocumentUrl(supabase, body.corOcr.fileUrl);
    }

    const hasCogDocument = Boolean(cogDocumentUrl);
    const hasCorDocument = Boolean(corDocumentUrl);
    const applicationStatus = "PENDING" as const;
    const remarks = getDocumentRemarks(hasCogDocument, hasCorDocument);

    // Capitalize personal info data before saving (even if from previous application)
    const capitalizedPersonalInfo = personalInfoData
      ? capitalizeFormData(personalInfoData as Record<string, unknown>)
      : {};

    // Create Application record using personal info from previous application
    const now = new Date().toISOString();
    const { error: appError } = await supabase.from("Application").insert({
      id: applicationId,
      userId: userId,
      applicationPeriodId: periodData.id,
      status: applicationStatus,
      applicationType: "RENEWAL",
      applicationDetails: { personalInfo: capitalizedPersonalInfo },
      id_image: idImageUrl,
      remarks,
      createdAt: now,
      updatedAt: now,
    });

    if (appError) {
      console.error("Application creation error:", appError);
      return NextResponse.json(
        {
          error: "Failed to create application",
          details: appError.message,
        },
        { status: 500 }
      );
    }

    // Create OCRRaw records
    const ocrRawRecords = [];

    // ID OCR
    if (body.idOcr?.rawText) {
      const idOcrRawId = randomUUID();
      ocrRawRecords.push({
        id: idOcrRawId,
        userId: userId,
        applicationId: applicationId,
        rawText: body.idOcr.rawText,
        file_type: "id",
      });

      // Create OCRProcessed if processed text exists
      if (body.idOcr.processedText) {
        const idOcrProcessedId = randomUUID();
        await supabase.from("OCRProcessed").insert({
          id: idOcrProcessedId,
          ocrRawId: idOcrRawId,
          cleanedText: body.idOcr.processedText,
          accuracyPercent: 100,
        });
      }
    }

    // COG OCR
    if (body.cogOcr?.rawText) {
      const cogOcrRawId = randomUUID();
      ocrRawRecords.push({
        id: cogOcrRawId,
        userId: userId,
        applicationId: applicationId,
        rawText: body.cogOcr.rawText,
        file_type: "cog",
      });

      if (body.cogOcr.processedText) {
        const cogOcrProcessedId = randomUUID();
        await supabase.from("OCRProcessed").insert({
          id: cogOcrProcessedId,
          ocrRawId: cogOcrRawId,
          cleanedText: body.cogOcr.processedText,
          accuracyPercent: 100,
        });
      }
    }

    // COR OCR
    if (body.corOcr?.rawText) {
      const corOcrRawId = randomUUID();
      ocrRawRecords.push({
        id: corOcrRawId,
        userId: userId,
        applicationId: applicationId,
        rawText: body.corOcr.rawText,
        file_type: "cor",
      });

      if (body.corOcr.processedText) {
        const corOcrProcessedId = randomUUID();
        await supabase.from("OCRProcessed").insert({
          id: corOcrProcessedId,
          ocrRawId: corOcrRawId,
          cleanedText: body.corOcr.processedText,
          accuracyPercent: 100,
        });
      }
    }

    // Insert all OCRRaw records
    if (ocrRawRecords.length > 0) {
      const { error: ocrError } = await supabase
        .from("OCRRaw")
        .insert(ocrRawRecords);

      if (ocrError) {
        console.error("OCRRaw creation error:", ocrError);
      }
    }

    // Create CertificateOfGrades record
    if (body.cogOcr?.extractedData) {
      const cogId = randomUUID();
      const { error: cogError } = await supabase
        .from("CertificateOfGrades")
        .insert({
          id: cogId,
          applicationId: applicationId,
          school: body.cogOcr.extractedData.school
            ? capitalizeText(body.cogOcr.extractedData.school)
            : "",
          schoolYear: body.cogOcr.extractedData.school_year || "",
          semester: body.cogOcr.extractedData.semester
            ? capitalizeText(body.cogOcr.extractedData.semester)
            : "",
          course: body.cogOcr.extractedData.course
            ? capitalizeText(body.cogOcr.extractedData.course)
            : "",
          name: body.cogOcr.extractedData.name
            ? capitalizeName(body.cogOcr.extractedData.name)
            : "",
          gwa: body.cogOcr.extractedData.gwa || 0,
          totalUnits: body.cogOcr.extractedData.total_units || 0,
          subjects: body.cogOcr.extractedData.subjects || [],
          fileUrl: cogDocumentUrl,
        });

      if (cogError) {
        console.error("CertificateOfGrades creation error:", cogError);
      }
    }

    // Create CertificateOfRegistration record (no subjects)
    if (body.corOcr?.extractedData) {
      const corId = randomUUID();
      const { error: corError } = await supabase
        .from("CertificateOfRegistration")
        .insert({
          id: corId,
          applicationId: applicationId,
          school: body.corOcr.extractedData.school
            ? capitalizeText(body.corOcr.extractedData.school)
            : "",
          schoolYear: body.corOcr.extractedData.school_year || "",
          semester: body.corOcr.extractedData.semester
            ? capitalizeText(body.corOcr.extractedData.semester)
            : "",
          course: body.corOcr.extractedData.course
            ? capitalizeText(body.corOcr.extractedData.course)
            : "",
          name: body.corOcr.extractedData.name
            ? capitalizeName(body.corOcr.extractedData.name)
            : "",
          totalUnits: body.corOcr.extractedData.total_units || 0,
          fileUrl: corDocumentUrl,
        });

      if (corError) {
        console.error("CertificateOfRegistration creation error:", corError);
      }
    }

    let transactionHash: string | null = null;
    try {
      transactionHash = await logApplicationToBlockchain(applicationId, userId);
      if (transactionHash) {
        await supabase.from("BlockchainRecord").insert({
          id: randomUUID(),
          recordType: "APPLICATION",
          transactionHash,
          applicationId,
          userId,
          timestamp: now,
        });
      }
    } catch (error) {
      console.error("Blockchain logging failed (renewal application):", error);
    }

    // Send email notification for renewal submission
    if (userData.email) {
      const applicantFullName =
        capitalizedPersonalInfo.firstName && capitalizedPersonalInfo.lastName
          ? `${capitalizedPersonalInfo.firstName} ${
              capitalizedPersonalInfo.middleName
                ? capitalizedPersonalInfo.middleName + " "
                : ""
            }${capitalizedPersonalInfo.lastName}`.trim()
          : "Applicant";

      await sendEmailNotification({
        applicantName: applicantFullName,
        applicantEmail: userData.email,
        applicationId,
        applicationType: "RENEWAL",
        status: "PENDING",
        submissionDate: now,
      }).catch((error) => {
        console.error("Failed to send renewal confirmation email:", error);
        // Don't fail the renewal submission if email fails
      });
    }

    return NextResponse.json({
      success: true,
      applicationId: applicationId,
      status: applicationStatus,
      remarks,
      personalInfo: capitalizedPersonalInfo,
      transactionHash,
    });
  } catch (error) {
    console.error("Renewal application submission error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
