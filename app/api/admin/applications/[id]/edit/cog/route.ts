import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/utils/auth-server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message.includes("Forbidden") ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { id } = await context.params;
    const body = await request.json();

    const {
      cogId,
      school,
      schoolYear,
      semester,
      course,
      name,
      gwa,
      totalUnits,
      subjects,
    } = body;

    // Find the COG record for this application
    const { data: existingCog, error: findError } = await supabase
      .from("CertificateOfGrades")
      .select("id")
      .eq("applicationId", id)
      .single();

    if (findError && findError.code !== "PGRST116") {
      console.error("Error finding COG:", findError);
      return NextResponse.json(
        { error: "Failed to find certificate of grades" },
        { status: 500 }
      );
    }

    if (existingCog) {
      // Update existing COG
      const { data, error } = await supabase
        .from("CertificateOfGrades")
        .update({
          school,
          schoolYear,
          semester,
          course,
          name,
          gwa,
          totalUnits,
          subjects: subjects || [],
        })
        .eq("id", existingCog.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating COG:", error);
        return NextResponse.json(
          { error: "Failed to update certificate of grades" },
          { status: 500 }
        );
      }

      return NextResponse.json({ cog: data });
    } else if (cogId) {
      // Update by ID if provided
      const { data, error } = await supabase
        .from("CertificateOfGrades")
        .update({
          school,
          schoolYear,
          semester,
          course,
          name,
          gwa,
          totalUnits,
          subjects: subjects || [],
        })
        .eq("id", cogId)
        .select()
        .single();

      if (error) {
        console.error("Error updating COG:", error);
        return NextResponse.json(
          { error: "Failed to update certificate of grades" },
          { status: 500 }
        );
      }

      return NextResponse.json({ cog: data });
    } else {
      return NextResponse.json(
        { error: "Certificate of grades not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

