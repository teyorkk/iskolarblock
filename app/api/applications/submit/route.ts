import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import type { GradeSubject } from "@/lib/services/document-extraction";

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
  faceScanImage?: string; // base64

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
    let faceScanImageUrl = "";

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

    // Upload face scan image
    if (body.faceScanImage && body.faceScanImage.trim() !== "") {
      const faceImageBuffer = Buffer.from(
        body.faceScanImage.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      const faceFileName = `applications/${userId}/${applicationId}/face-${Date.now()}.jpg`;
      const { error: faceUploadError } = await supabase.storage
        .from("documents")
        .upload(faceFileName, faceImageBuffer, {
          contentType: "image/jpeg",
          cacheControl: "3600",
        });

      if (faceUploadError) {
        console.error("Face scan image upload error:", faceUploadError);
        // Continue without image URL if upload fails
      } else {
        const { data: faceUrlData } = supabase.storage
          .from("documents")
          .getPublicUrl(faceFileName);
        faceScanImageUrl = faceUrlData.publicUrl;
      }
    }

    // Create Application record
    const now = new Date().toISOString();
    const { error: appError } = await supabase.from("Application").insert({
      id: applicationId,
      userId: userId,
      applicationPeriodId: periodData.id,
      status: "PENDING",
      applicationType: "NEW",
      applicationDetails: body.formData,
      id_image: idImageUrl,
      face_scan_image: faceScanImageUrl,
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
          accuracyPercent: 100, // You can calculate this if needed
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
          school: body.cogOcr.extractedData.school || "",
          schoolYear: body.cogOcr.extractedData.school_year || "",
          semester: body.cogOcr.extractedData.semester || "",
          course: body.cogOcr.extractedData.course || "",
          name: body.cogOcr.extractedData.name || "",
          gwa: body.cogOcr.extractedData.gwa || 0,
          totalUnits: body.cogOcr.extractedData.total_units || 0,
          subjects: body.cogOcr.extractedData.subjects || [],
          fileUrl: body.cogOcr.fileUrl || null,
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
          school: body.corOcr.extractedData.school || "",
          schoolYear: body.corOcr.extractedData.school_year || "",
          semester: body.corOcr.extractedData.semester || "",
          course: body.corOcr.extractedData.course || "",
          name: body.corOcr.extractedData.name || "",
          totalUnits: body.corOcr.extractedData.total_units || 0,
          fileUrl: body.corOcr.fileUrl || null,
        });

      if (corError) {
        console.error("CertificateOfRegistration creation error:", corError);
      }
    }

    return NextResponse.json({
      success: true,
      applicationId: applicationId,
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
