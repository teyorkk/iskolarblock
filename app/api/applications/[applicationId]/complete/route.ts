"use server";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { expirePendingApplications } from "@/lib/services/application-status";
import { randomUUID } from "crypto";

interface RouteContext {
  params: Promise<{ applicationId: string }>;
}

interface DocumentDetails {
  school: string;
  schoolYear: string;
  semester: string;
  course: string;
  name: string;
  gwa?: string;
  totalUnits: string;
}

interface CompletionRequestBody {
  cogDetails?: DocumentDetails;
  corDetails?: Omit<DocumentDetails, "gwa">;
  cogFile?: string;
  corFile?: string;
  cogFileName?: string;
  corFileName?: string;
}

const uploadDocument = async (
  supabase: ReturnType<typeof getSupabaseServerClient>,
  {
    base64,
    fileName,
    applicationId,
    userId,
    type,
  }: {
    base64: string;
    fileName: string;
    applicationId: string;
    userId: string;
    type: "cog" | "cor";
  }
): Promise<string> => {
  const cleaned = base64.replace(/^data:.*;base64,/, "");
  const buffer = Buffer.from(cleaned, "base64");
  const storagePath = `applications/${userId}/${applicationId}/${type}-${Date.now()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, buffer, {
      contentType: fileName.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    console.error("Document upload error:", uploadError);
    throw new Error("Failed to upload document");
  }

  const { data: publicUrlData } = supabase.storage
    .from("documents")
    .getPublicUrl(storagePath);
  return publicUrlData.publicUrl;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const supabase = getSupabaseServerClient();
    await expirePendingApplications(supabase);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userRecord, error: userError } = await supabase
      .from("User")
      .select("id")
      .eq("email", user.email)
      .single();

    if (userError || !userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { applicationId } = await Promise.resolve(context.params);
    const { data: application, error: appError } = await supabase
      .from("Application")
      .select(
        `
        *,
        CertificateOfGrades (*),
        CertificateOfRegistration (*)
      `
      )
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.userId !== userRecord.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error fetching application for completion:", error);
    return NextResponse.json(
      { error: "Failed to load application details" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const supabase = getSupabaseServerClient();
    await expirePendingApplications(supabase);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userRecord, error: userError } = await supabase
      .from("User")
      .select("id")
      .eq("email", user.email)
      .single();

    if (userError || !userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { applicationId } = await Promise.resolve(context.params);
    const { data: application, error: appError } = await supabase
      .from("Application")
      .select(
        `
        id,
        userId,
        status,
        CertificateOfGrades (*),
        CertificateOfRegistration (*)
      `
      )
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.userId !== userRecord.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (application.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending applications can be edited" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as CompletionRequestBody;
    const {
      cogDetails,
      corDetails,
      cogFile,
      corFile,
      cogFileName,
      corFileName,
    } = body;

    const existingCog = application.CertificateOfGrades?.[0] ?? null;
    const existingCor = application.CertificateOfRegistration?.[0] ?? null;

    const willUploadCog = Boolean(cogFile && cogFileName && cogDetails);
    const willUploadCor = Boolean(corFile && corFileName && corDetails);

    if (willUploadCog && (!cogDetails || !cogFileName)) {
      return NextResponse.json(
        { error: "Certificate of Grades upload is missing details" },
        { status: 400 }
      );
    }

    if (willUploadCor && (!corDetails || !corFileName)) {
      return NextResponse.json(
        { error: "Certificate of Registration upload is missing details" },
        { status: 400 }
      );
    }

    if (!willUploadCog && !existingCog?.fileUrl) {
      return NextResponse.json(
        { error: "Certificate of Grades is required" },
        { status: 400 }
      );
    }

    if (!willUploadCor && !existingCor?.fileUrl) {
      return NextResponse.json(
        { error: "Certificate of Registration is required" },
        { status: 400 }
      );
    }

    if (!willUploadCog && !willUploadCor) {
      return NextResponse.json(
        { error: "Upload at least one document to complete your application" },
        { status: 400 }
      );
    }

    let cogFileUrl = existingCog?.fileUrl ?? null;
    let corFileUrl = existingCor?.fileUrl ?? null;

    if (willUploadCog && cogFile && cogFileName) {
      cogFileUrl = await uploadDocument(supabase, {
        base64: cogFile,
        fileName: cogFileName,
        applicationId,
        userId: userRecord.id,
        type: "cog",
      });
    }

    if (willUploadCor && corFile && corFileName) {
      corFileUrl = await uploadDocument(supabase, {
        base64: corFile,
        fileName: corFileName,
        applicationId,
        userId: userRecord.id,
        type: "cor",
      });
    }

    if (willUploadCog && cogDetails && cogFileUrl) {
      await supabase
        .from("CertificateOfGrades")
        .delete()
        .eq("applicationId", applicationId);
      const { error: cogInsertError } = await supabase
        .from("CertificateOfGrades")
        .insert({
          id: randomUUID(),
          applicationId,
          school: cogDetails.school,
          schoolYear: cogDetails.schoolYear,
          semester: cogDetails.semester,
          course: cogDetails.course,
          name: cogDetails.name,
          gwa: Number(cogDetails.gwa) || 0,
          totalUnits: Number(cogDetails.totalUnits) || 0,
          subjects: [],
          fileUrl: cogFileUrl,
        });

      if (cogInsertError) {
        console.error("COG insert error:", cogInsertError);
        return NextResponse.json(
          { error: "Failed to save Certificate of Grades" },
          { status: 500 }
        );
      }
    }

    if (willUploadCor && corDetails && corFileUrl) {
      await supabase
        .from("CertificateOfRegistration")
        .delete()
        .eq("applicationId", applicationId);

      const { error: corInsertError } = await supabase
        .from("CertificateOfRegistration")
        .insert({
          id: randomUUID(),
          applicationId,
          school: corDetails.school,
          schoolYear: corDetails.schoolYear,
          semester: corDetails.semester,
          course: corDetails.course,
          name: corDetails.name,
          totalUnits: Number(corDetails.totalUnits) || 0,
          fileUrl: corFileUrl,
        });

      if (corInsertError) {
        console.error("COR insert error:", corInsertError);
        return NextResponse.json(
          { error: "Failed to save Certificate of Registration" },
          { status: 500 }
        );
      }
    }

    const { error: updateError } = await supabase
      .from("Application")
      .update({
        status: "APPROVED",
        updatedAt: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Application status update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update application status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "APPROVED",
      applicationId,
    });
  } catch (error) {
    console.error("Error completing application:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to complete application", details: message },
      { status: 500 }
    );
  }
}
