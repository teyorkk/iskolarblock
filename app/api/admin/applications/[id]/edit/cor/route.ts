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

    const logCorUpdate = async () => {
      await logEvent(
        {
          eventType: "ADMIN_APPLICATION_EDIT_COR",
          message: `Admin updated COR for application ${id}`,
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

      await logCorUpdate();
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

      await logCorUpdate();
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

