import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// POST /api/auth/forgot-password { email }
// Sends an email OTP for authentication (no user creation). After verification, user can update password.
export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid request format. Please provide a valid JSON body." },
        { status: 400 }
      );
    }

    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    });

    if (error) {
      // Handle specific Supabase error cases
      let errorMessage = "Failed to send verification code. Please try again.";

      if (
        error.message.includes("signups not allowed") ||
        error.message.includes("signup") ||
        error.message.includes("Signups not allowed")
      ) {
        // When signups are disabled and user doesn't exist, show user-friendly message
        errorMessage =
          "No account found with this email address. Please check your email and try again.";
      } else if (
        error.message.includes("rate limit") ||
        error.message.includes("too many")
      ) {
        errorMessage =
          "Too many requests. Please wait a few minutes before trying again.";
      } else if (
        error.message.includes("invalid email") ||
        error.message.includes("email")
      ) {
        errorMessage = "Invalid email address. Please check and try again.";
      } else if (
        error.message.includes("user not found") ||
        error.message.includes("not found")
      ) {
        // Don't reveal if user exists for security
        errorMessage =
          "If an account exists with this email, a verification code has been sent.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("connection")
      ) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else {
        // For any other error, use a user-friendly message
        errorMessage =
          "Failed to send verification code. Please try again later.";
      }

      console.error("Forgot password error:", error.message);
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Success - always return same message for security (don't reveal if user exists)
    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, a verification code has been sent.",
    });
  } catch (e) {
    const error = e as Error;
    console.error("Unexpected error in forgot-password route:", error);

    return NextResponse.json(
      {
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
