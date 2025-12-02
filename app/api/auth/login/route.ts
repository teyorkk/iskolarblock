import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { logEvent } from "@/lib/services/log-events";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Create Supabase client with cookie handling
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase environment variables are missing");
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    // Authenticate with Supabase Auth (email and password from auth table)
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      // Handle common error cases
      if (authError.message.includes("Invalid login credentials")) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
      if (authError.message.includes("Email not confirmed")) {
        return NextResponse.json(
          { error: "Please verify your email before logging in" },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Get user role from User table
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("id, email, name, role")
      .eq("id", authData.user.id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user information" },
        { status: 500 }
      );
    }

    // Log the successful login event
    await logEvent(
      {
        eventType: "USER_LOGIN",
        message: "User signed in successfully",
        actorId: userData.id,
        actorRole: userData.role,
        actorName: userData.name || userData.email,
        actorUsername: userData.email,
      },
      supabase
    );

    // Determine redirect URL based on role
    const redirectUrl =
      userData.role === "ADMIN" ? "/admin-dashboard" : "/user-dashboard";

    // Return success with user data and redirect URL
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      },
      role: userData.role,
      redirectUrl,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
