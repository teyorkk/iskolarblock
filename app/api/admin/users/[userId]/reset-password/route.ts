import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

// POST /api/admin/users/[userId]/reset-password
// Send password reset OTP to user's email (admin only)
export async function POST(
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

    // Get user email from database
    const { data: userData, error: userError } = await admin
      .from("User")
      .select("email")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Send password reset OTP using signInWithOtp
    const { error: signInOtpError } = await admin.auth.signInWithOtp({
      email: userData.email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (signInOtpError) {
      return NextResponse.json(
        { error: signInOtpError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset OTP sent successfully",
      email: userData.email,
    });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 500 }
    );
  }
}
