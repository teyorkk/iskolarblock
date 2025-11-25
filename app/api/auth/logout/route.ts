import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { logEvent } from "@/lib/services/log-events";

export async function POST() {
  try {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase configuration missing" },
        { status: 500 }
      );
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let profile:
      | { id: string; name: string | null; email: string | null; role: string | null; profilePicture: string | null }
      | null = null;

    if (user?.id) {
      const { data: userRecord } = await supabase
        .from("User")
        .select("id, name, email, role, profilePicture")
        .eq("id", user.id)
        .maybeSingle();
      profile = userRecord ?? null;
    }

    const { error } = await supabase.auth.signOut();

    // "Auth session missing" means already logged out, which is fine
    if (error && error.message !== "Auth session missing!") {
      console.error("Logout error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get all Supabase-related cookies and clear them
    const allCookies = cookieStore.getAll();
    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith("sb-")) {
        cookieStore.delete(cookie.name);
      }
    });

    if (user) {
      await logEvent({
        eventType: "USER_LOGOUT",
        message: "User signed out",
        actorId: profile?.id ?? user.id,
        actorRole: profile?.role ?? "USER",
        actorName: profile?.name ?? user.email ?? "User",
        actorUsername: profile?.email ?? user.email ?? null,
        actorAvatarUrl: profile?.profilePicture ?? null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const error = e as Error;
    console.error("Logout exception:", error);
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 500 }
    );
  }
}
