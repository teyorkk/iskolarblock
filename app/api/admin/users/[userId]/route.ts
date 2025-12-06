import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/utils/auth-server";
import { logEvent } from "@/lib/services/log-events";
import { getCurrentTimePH } from "@/lib/utils/date-formatting";

// PATCH /api/admin/users/[userId]
// Update a user (admin only)
export async function PATCH(
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

    const body = await req.json();
    const { name, email, phone, address, role, password } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate phone format if provided
    if (phone && !/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Phone must be in format 09XXXXXXXXX" },
        { status: 400 }
      );
    }

    // Validate role
    if (role && !["ADMIN", "USER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Validate password if provided
    if (password && password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Update user in database
    const { data: updatedUser, error: updateError } = await admin
      .from("User")
      .update({
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        role: role || "USER",
        updatedAt: getCurrentTimePH(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating user:", updateError);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    // Update auth email and/or password if changed
    const { data: currentUser } = await admin
      .from("User")
      .select("email")
      .eq("id", userId)
      .single();

    const authUpdates: { email?: string; password?: string } = {};
    if (currentUser && currentUser.email !== email) {
      authUpdates.email = email.trim();
    }
    if (password) {
      authUpdates.password = password;
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await admin.auth.admin.updateUserById(
        userId,
        authUpdates
      );

      if (authError) {
        console.error("Error updating auth:", authError);
        // Don't fail the request if auth update fails
      }
    }

    const { data: adminProfile } = await admin
      .from("User")
      .select("id, name, email, role, profilePicture")
      .eq("email", adminInfo.email)
      .maybeSingle();

    await logEvent({
      eventType: "ADMIN_USER_UPDATED",
      message: `Updated user ${updatedUser.email}`,
      actorId: adminProfile?.id ?? null,
      actorRole: adminProfile?.role ?? "ADMIN",
      actorName: adminProfile?.name ?? adminInfo.email ?? "Admin",
      actorUsername: adminProfile?.email ?? adminInfo.email ?? null,
      actorAvatarUrl: adminProfile?.profilePicture ?? null,
      metadata: { updatedUserId: userId, updatedUserEmail: updatedUser.email },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 500 }
    );
  }
}

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
