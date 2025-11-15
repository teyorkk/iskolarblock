import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUserRoleFromDatabase } from "@/lib/utils/auth-server";

/**
 * GET /api/user/role
 * Returns the current user's role from the database
 */
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    // Get current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role from database
    const role = await getUserRoleFromDatabase(user.email);

    if (!role) {
      return NextResponse.json(
        { error: "User role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      role,
      isAdmin: role === "ADMIN",
    });
  } catch (error) {
    console.error("Error in user role API:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

