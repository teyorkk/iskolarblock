import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/utils/auth-server";
import { logEvent } from "@/lib/services/log-events";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  let adminInfo: { email: string; role: string } | null = null;
  try {
    adminInfo = await requireAdmin();
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

    let adminProfile:
      | { id: string; name: string | null; email: string | null; role: string | null; profilePicture: string | null }
      | null = null;
    if (adminInfo?.email) {
      const { data: adminUser } = await supabase
        .from("User")
        .select("id, name, email, role, profilePicture")
        .eq("email", adminInfo.email)
        .maybeSingle();
      adminProfile = adminUser ?? null;
    }

    const logCogUpdate = async () => {
      await logEvent(
        {
          eventType: "ADMIN_APPLICATION_EDIT_COG",
          message: `Admin updated COG for application ${id}`,
          actorId: adminProfile?.id ?? null,
          actorRole: adminProfile?.role ?? adminInfo?.role ?? "ADMIN",
          actorName: adminProfile?.name ?? adminInfo?.email ?? "Admin",
          actorUsername: adminProfile?.email ?? adminInfo?.email ?? null,
          actorAvatarUrl: adminProfile?.profilePicture ?? null,
          metadata: { applicationId: id },
        },
        supabase
      );
    };

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

      await logCogUpdate();
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

      await logCogUpdate();
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

