import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

// POST /api/auth/verify-otp { email, code, context }
// context: 'register' | 'forgot'
export async function POST(req: Request) {
  try {
    const { email, code, context } = await req.json();
    if (!email || !code || !context) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // Map to Supabase OTP verification types
    const type = context === "register" ? "signup" : "email";

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: type as "signup" | "email",
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // After successful OTP verification, ensure User record exists in database
    if (data.user && context === "register") {
      const admin = getSupabaseAdminClient();

      // Get user metadata from auth
      const { data: authUser } = await admin.auth.admin.getUserById(
        data.user.id
      );
      const name = authUser?.user?.user_metadata?.name || email.split("@")[0];
      const role = authUser?.user?.user_metadata?.role || "USER";

      // Insert or update User record
      const { error: dbError } = await admin.from("User").upsert(
        {
          id: data.user.id,
          email: data.user.email || email,
          name: name,
          password: "", // Password is stored in auth.users, not in User table
          role: role,
          updatedAt: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (dbError) {
        console.error("Error creating User record:", dbError);
        // Don't fail the request if User record creation fails
        // The trigger should handle it, but we log the error
      }
    }

    return NextResponse.json({ success: true, userId: data.user?.id });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 500 }
    );
  }
}
