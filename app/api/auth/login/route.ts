import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

// POST /api/auth/login { email, password }
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      // Provide clearer guidance for common cases
      const message = error.message || "Login failed";
      if (/confirm(ed)? your email/i.test(message)) {
        return NextResponse.json(
          {
            error:
              "Email not confirmed. Please check your inbox for a verification code and verify your account.",
          },
          { status: 409 }
        );
      }
      // Optional dev helper: auto-provision demo account if service role key is available
      const canProvision = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (/invalid login credentials/i.test(message) && canProvision) {
        try {
          const admin = getSupabaseAdminClient();
          await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
          // retry login
          const retry = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (retry.error) {
            return NextResponse.json(
              { error: retry.error.message },
              { status: 401 }
            );
          }
          return NextResponse.json({
            success: true,
            userId: retry.data.user?.id,
          });
        } catch {
          return NextResponse.json({ error: message }, { status: 401 });
        }
      }
      return NextResponse.json({ error: message }, { status: 401 });
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
