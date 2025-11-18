import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { logApplicationToBlockchain } from "@/lib/services/blockchain";
import type { GradeSubject } from "@/lib/services/document-extraction";
import {
  uploadDocumentFromBase64,
  resolveStoredDocumentUrl,
} from "@/lib/services/document-upload";
import { createOCRRecords } from "@/lib/services/ocr-records";
import { createCertificateRecords } from "@/lib/services/certificate-records";

interface SubmitApplicationRequest {
  // Form data
  formData: {
    lastName: string;
    firstName: string;
    middleName?: string | null;
    dateOfBirth: string;
    placeOfBirth: string;
    age: string;
    sex: "male" | "female";
    houseNumber: string;
    purok: string;
    barangay: string;
    municipality: string;
    province: string;
    citizenship: string;
    contactNumber: string;
    religion: string;
    course: string;
    yearLevel: string;
  };

  // Images (base64 strings)
  idImage?: string; // base64
  cogFile?: string; // base64
  corFile?: string; // base64
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

  // Note: Files are sent as base64 strings, not File objects
}


export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = (await request.json()) as SubmitApplicationRequest;

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

    // Upload images to storage
    let idImageUrl = "";
    let cogDocumentUrl: string | null = null;
    let corDocumentUrl: string | null = null;

    // Upload ID image
    if (body.idImage && body.idImage.trim() !== "") {
      idImageUrl =
        (await uploadDocumentFromBase64(supabase, {
          base64: body.idImage,
          fileName: `id-${Date.now()}.jpg`,
          userId,
          applicationId,
          type: "id",
        })) || "";
    }

    // Upload or resolve COG document
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

    // Upload or resolve COR document
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

    const hasIdDocument = Boolean(idImageUrl);
    const hasCogDocument = Boolean(cogDocumentUrl);
    const hasCorDocument = Boolean(corDocumentUrl);
    const applicationStatus: "APPROVED" | "PENDING" =
      hasIdDocument && hasCogDocument && hasCorDocument
        ? "APPROVED"
        : "PENDING";

    // Create Application record
    const now = new Date().toISOString();
    const { error: appError } = await supabase.from("Application").insert({
      id: applicationId,
      userId: userId,
      applicationPeriodId: periodData.id,
      status: applicationStatus,
      applicationType: "NEW",
      applicationDetails: { personalInfo: body.formData },
      id_image: idImageUrl,
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

    // Create OCR records
    await createOCRRecords({
      supabase,
      userId,
      applicationId,
      idOcr: body.idOcr,
      cogOcr: body.cogOcr,
      corOcr: body.corOcr,
    });

    // Create certificate records
    await createCertificateRecords({
      supabase,
      applicationId,
      cogData: body.cogOcr?.extractedData || undefined,
      corData: body.corOcr?.extractedData || undefined,
      cogDocumentUrl,
      corDocumentUrl,
    });

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
      console.error("Blockchain logging failed (new application):", error);
    }

    return NextResponse.json({
      success: true,
      applicationId: applicationId,
      status: applicationStatus,
      transactionHash,
    });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
