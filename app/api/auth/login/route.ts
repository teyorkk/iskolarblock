import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { logEvent } from "@/lib/services/log-events";

const logSuccessfulLogin = async (
  supabase: ReturnType<typeof getSupabaseServerClient>,
  {
    actorId,
    actorName,
    actorEmail,
    actorRole,
  }: {
    actorId?: string | null;
    actorName?: string | null;
    actorEmail?: string | null;
    actorRole?: string | null;
  }
) => {
  await logEvent(
    {
      eventType: "USER_LOGIN",
      message: "User signed in",
      actorId: actorId ?? null,
      actorRole: actorRole ?? "USER",
      actorName: actorName ?? actorEmail ?? "User",
      actorUsername: actorEmail ?? null,
    },
    supabase
  );
};

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
      if (
        /invalid login credentials/i.test(message) ||
        /invalid credentials/i.test(message)
      ) {
        return NextResponse.json(
          { error: "Wrong credentials. Please check your email and password." },
          { status: 401 }
        );
      }
      if (/password/i.test(message) && !/confirm/i.test(message)) {
        return NextResponse.json(
          { error: "Wrong password. Please try again." },
          { status: 401 }
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
          // Fetch user data from User table after auto-provision
          if (retry.data.user?.email) {
            const { data: userData } = await supabase
              .from("User")
              .select("id, email, name, role")
              .eq("email", retry.data.user.email.toLowerCase().trim())
              .maybeSingle();

            await logSuccessfulLogin(supabase, {
              actorId: userData?.id ?? retry.data.user?.id,
              actorName: userData?.name ?? retry.data.user.email,
              actorEmail: userData?.email ?? retry.data.user.email,
              actorRole: userData?.role ?? "USER",
            });

            return NextResponse.json({
              success: true,
              userId: retry.data.user?.id,
              user: userData || null,
              role: userData?.role || "USER",
            });
          }
          await logSuccessfulLogin(supabase, {
            actorId: retry.data.user?.id,
            actorName: retry.data.user?.email ?? "User",
            actorEmail: retry.data.user?.email ?? email,
            actorRole: "USER",
          });
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

    // After successful login, fetch user data from User table
    if (data.user?.email) {
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("id, email, name, role")
        .eq("email", data.user.email.toLowerCase().trim())
        .maybeSingle();

      if (userError) {
        console.error("Error fetching user data after login:", userError);
        // Still return success, but log the error
      }

      await logSuccessfulLogin(supabase, {
        actorId: userData?.id ?? data.user?.id,
        actorName: userData?.name ?? data.user?.email ?? "User",
        actorEmail: userData?.email ?? data.user?.email ?? email,
        actorRole: userData?.role ?? "USER",
      });

      return NextResponse.json({
        success: true,
        userId: data.user?.id,
        user: userData || null,
        role: userData?.role || "USER",
      });
    }

    if (data.user) {
      await logSuccessfulLogin(supabase, {
        actorId: data.user.id,
        actorName: data.user.email ?? "User",
        actorEmail: data.user.email ?? email,
        actorRole: "USER",
      });
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
