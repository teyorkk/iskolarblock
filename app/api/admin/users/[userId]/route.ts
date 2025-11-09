import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

// DELETE /api/admin/users/[userId]
// Delete a user (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  try {
    const admin = getSupabaseAdminClient();
    const resolvedParams = await Promise.resolve(params);
    const { userId } = resolvedParams;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
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
