import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/utils/auth-server";
import { logEvent } from "@/lib/services/log-events";

// DELETE /api/admin/users/[userId]
// Delete a user (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  try {
    const adminInfo = await requireAdmin();
    const admin = getSupabaseAdminClient();
    const resolvedParams = await Promise.resolve(params);
    const { userId } = resolvedParams;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { data: deletedUser } = await admin
      .from("User")
      .select("id, name, email")
      .eq("id", userId)
      .maybeSingle();

    // Check if user has active applications (PENDING, APPROVED, or GRANTED)
    const { data: activeApplications, error: appCheckError } = await admin
      .from("Application")
      .select("id, status")
      .eq("userId", userId)
      .in("status", ["PENDING", "APPROVED", "GRANTED"]);

    if (appCheckError) {
      console.error("Error checking applications:", appCheckError);
      return NextResponse.json(
        { error: "Failed to verify user applications" },
        { status: 500 }
      );
    }

    if (activeApplications && activeApplications.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete user with active applications. User has applications that are pending, approved, or granted.",
          hasActiveApplications: true,
          activeCount: activeApplications.length,
        },
        { status: 400 }
      );
    }

    // Delete user from auth
    const { error: authError } = await admin.auth.admin.deleteUser(userId);

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Delete user from database (cascade should handle related records)
    const { error: dbError } = await admin
      .from("User")
      .delete()
      .eq("id", userId);

    if (dbError) {
      console.error("Error deleting User record:", dbError);
      // Don't fail if database delete fails, auth user is already deleted
    }

    const { data: adminProfile } = await admin
      .from("User")
      .select("id, name, email, role, profilePicture")
      .eq("email", adminInfo.email)
      .maybeSingle();

    await logEvent({
      eventType: "ADMIN_USER_DELETED",
      message: `Deleted user ${deletedUser?.email ?? userId}`,
      actorId: adminProfile?.id ?? null,
      actorRole: adminProfile?.role ?? "ADMIN",
      actorName: adminProfile?.name ?? adminInfo.email ?? "Admin",
      actorUsername: adminProfile?.email ?? adminInfo.email ?? null,
      actorAvatarUrl: adminProfile?.profilePicture ?? null,
      metadata: { deletedUserId: userId, deletedUserEmail: deletedUser?.email },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 500 }
    );
  }
}
