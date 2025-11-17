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

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const supabase = getSupabaseServerClient();
    await expirePendingApplications(supabase);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userRecord, error: userError } = await supabase
      .from("User")
      .select("id")
      .eq("email", auth.user.email)
      .single();

    if (userError || !userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { applicationId } = await context.params;

    const { data: application, error: appError } = await supabase
      .from("Application")
      .select(
        `
        id,
        userId,
        status,
        applicationType,
        applicationDetails,
        applicationPeriodId,
        createdAt,
        CertificateOfGrades ( id, school, schoolYear, semester, course, name, gwa, totalUnits, fileUrl ),
        CertificateOfRegistration ( id, school, schoolYear, semester, course, name, totalUnits, fileUrl )
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

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userRecord, error: userError } = await supabase
      .from("User")
      .select("id")
      .eq("email", auth.user.email)
      .single();

    if (userError || !userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { applicationId } = await context.params;

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

    let body: CompletionRequestBody;
    try {
      body = (await request.json()) as CompletionRequestBody;
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const existingCogRecord = application.CertificateOfGrades?.[0] ?? null;
    const existingCorRecord =
      application.CertificateOfRegistration?.[0] ?? null;

    const {
      cogDetails,
      corDetails,
      cogFile,
      corFile,
      cogFileName,
      corFileName,
    } = body;

    const willUploadCog = Boolean(cogFile && cogFileName && cogDetails);
    const willUploadCor = Boolean(corFile && corFileName && corDetails);

    if (
      (cogFile && (!cogFileName || !cogDetails)) ||
      (corFile && (!corFileName || !corDetails))
    ) {
      return NextResponse.json(
        { error: "Uploaded documents must include their extracted details" },
        { status: 400 }
      );
    }

    if (!willUploadCog && !existingCogRecord) {
      return NextResponse.json(
        { error: "Certificate of Grades is required" },
        { status: 400 }
      );
    }

    if (!willUploadCor && !existingCorRecord) {
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

    const uploadDocument = async (
      base64: string,
      fileName: string,
      prefix: string
    ): Promise<string> => {
      const cleaned = base64.replace(/^data:.*;base64,/, "");
      const buffer = Buffer.from(cleaned, "base64");
      const storagePath = `applications/${
        userRecord.id
      }/${applicationId}/${prefix}-${Date.now()}-${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, buffer, {
          contentType: fileName.endsWith(".pdf")
            ? "application/pdf"
            : "image/jpeg",
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

    let cogFileUrl: string | null = existingCogRecord?.fileUrl || null;
    let corFileUrl: string | null = existingCorRecord?.fileUrl || null;

    if (willUploadCog && cogFile && cogFileName) {
      try {
        cogFileUrl = await uploadDocument(cogFile, cogFileName, "cog");
      } catch (uploadError) {
        const errorMessage =
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload Certificate of Grades";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
      }
    }

    if (willUploadCor && corFile && corFileName) {
      try {
        corFileUrl = await uploadDocument(corFile, corFileName, "cor");
      } catch (uploadError) {
        const errorMessage =
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload Certificate of Registration";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
      }
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
        console.error("COG record insert error:", cogInsertError);
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
        console.error("COR record insert error:", corInsertError);
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
      {
        error: "Failed to complete application",
        details: message,
      },
      { status: 500 }
    );
  }
}
