import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

// POST /api/auth/register { name, email, password }
// Triggers Supabase signUp which will send an email confirmation (OTP or link based on project settings).
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // Check if email already exists BEFORE attempting signUp
    const admin = getSupabaseAdminClient()
    try {
      // Try to get user by email - more efficient than listing all users
      const { data: existingUsers } = await admin.auth.admin.listUsers()
      const emailExists = existingUsers.users.some(
        (user) => user.email?.toLowerCase() === email.toLowerCase()
      )

      if (emailExists) {
        return NextResponse.json(
          { error: "Email is taken. Please use a different email address." },
          { status: 409 }
        )
      }
    } catch (checkError) {
      // If check fails, continue with signUp and let Supabase handle the error
      console.warn("Could not check existing email:", checkError)
    }

    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) {
      // Provide clearer error messages
      const message = error.message || "Registration failed";
      const lowerMessage = message.toLowerCase();
      
      // Check for various "email is taken" error patterns from Supabase
      if (
        /user already registered/i.test(message) ||
        /already exists/i.test(message) ||
        /email.*already/i.test(message) ||
        /user.*exists/i.test(message) ||
        /a user with this email/i.test(message) ||
        /email address.*already/i.test(message) ||
        lowerMessage.includes("already registered") ||
        lowerMessage.includes("already exists") ||
        lowerMessage.includes("email already") ||
        error.status === 422 // Supabase often returns 422 for duplicate emails
      ) {
        return NextResponse.json(
          { error: "Email is taken. Please use a different email address." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: message }, { status: 400 })
    }

    // Double-check: if signUp succeeded but user already exists, return error
    if (data.user) {
      const { data: checkUsers } = await admin.auth.admin.listUsers()
      const duplicateExists = checkUsers.users.filter(
        (user) => user.email?.toLowerCase() === email.toLowerCase()
      ).length > 1

      if (duplicateExists) {
        return NextResponse.json(
          { error: "Email is taken. Please use a different email address." },
          { status: 409 }
        )
      }
    }

    return NextResponse.json({ success: true, userId: data.user?.id })
  } catch (e) {
    const error = e as Error;
    return NextResponse.json({ error: error.message ?? "Server error" }, { status: 500 })
  }
}
