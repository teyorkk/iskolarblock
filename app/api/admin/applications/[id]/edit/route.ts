import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/utils/auth-server";
import { logEvent } from "@/lib/services/log-events";
import { getCurrentTimePH } from "@/lib/utils/date-formatting";

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

    const { applicationDetails } = body;

    let adminProfile: {
      id: string;
      name: string | null;
      email: string | null;
      role: string | null;
      profilePicture: string | null;
    } | null = null;
    if (adminInfo?.email) {
      const { data: adminUser } = await supabase
        .from("User")
        .select("id, name, email, role, profilePicture")
        .eq("email", adminInfo.email)
        .maybeSingle();
      adminProfile = adminUser ?? null;
    }

    // Update application
    const { data, error } = await supabase
      .from("Application")
      .update({
        applicationDetails,
        updatedAt: getCurrentTimePH(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating application:", error);
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    await logEvent(
      {
        eventType: "ADMIN_APPLICATION_EDIT",
        message: `Admin updated application ${id}`,
        actorId: adminProfile?.id ?? null,
        actorRole: adminProfile?.role ?? adminInfo?.role ?? "ADMIN",
        actorName: adminProfile?.name ?? adminInfo?.email ?? "Admin",
        actorUsername: adminProfile?.email ?? adminInfo?.email ?? null,
        actorAvatarUrl: adminProfile?.profilePicture ?? null,
        metadata: { applicationId: id },
      },
      supabase
    );

    return NextResponse.json({ application: data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
