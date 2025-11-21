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
      corId,
      school,
      schoolYear,
      semester,
      course,
      name,
      totalUnits,
    } = body;

    // Find the COR record for this application
    const { data: existingCor, error: findError } = await supabase
      .from("CertificateOfRegistration")
      .select("id")
      .eq("applicationId", id)
      .single();

    if (findError && findError.code !== "PGRST116") {
      console.error("Error finding COR:", findError);
      return NextResponse.json(
        { error: "Failed to find certificate of registration" },
        { status: 500 }
      );
    }

    if (existingCor) {
      // Update existing COR
      const { data, error } = await supabase
        .from("CertificateOfRegistration")
        .update({
          school,
          schoolYear,
          semester,
          course,
          name,
          totalUnits,
        })
        .eq("id", existingCor.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating COR:", error);
        return NextResponse.json(
          { error: "Failed to update certificate of registration" },
          { status: 500 }
        );
      }

      return NextResponse.json({ cor: data });
    } else if (corId) {
      // Update by ID if provided
      const { data, error } = await supabase
        .from("CertificateOfRegistration")
        .update({
          school,
          schoolYear,
          semester,
          course,
          name,
          totalUnits,
        })
        .eq("id", corId)
        .select()
        .single();

      if (error) {
        console.error("Error updating COR:", error);
        return NextResponse.json(
          { error: "Failed to update certificate of registration" },
          { status: 500 }
        );
      }

      return NextResponse.json({ cor: data });
    } else {
      return NextResponse.json(
        { error: "Certificate of registration not found" },
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

