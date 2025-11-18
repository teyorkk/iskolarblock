import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data from User table
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("*")
      .eq("email", user.email)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Error in user profile API:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = getSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, name, phone, address, bio } = body;

    // Get user data from User table to verify ownership
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("id, email")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const trimmedCurrentEmail = userData.email.toLowerCase().trim();
    const trimmedNextEmail = email?.toLowerCase().trim();
    const isEmailChanged =
      trimmedNextEmail && trimmedNextEmail !== trimmedCurrentEmail;

    // If email is being changed, update auth.users table using admin client
    if (isEmailChanged) {
      const admin = getSupabaseAdminClient();
      const { error: authUpdateError } = await admin.auth.admin.updateUserById(
        user.id,
        {
          email: trimmedNextEmail,
          email_confirm: true, // Immediately confirm the email
        }
      );

      if (authUpdateError) {
        console.error("Error updating auth email:", authUpdateError);
        return NextResponse.json(
          {
            error: "Failed to update email",
            details: authUpdateError.message,
          },
          { status: 400 }
        );
      }
    }

    // Update User table
    const updateData: {
      name?: string;
      email?: string;
      phone?: string | null;
      address?: string | null;
      bio?: string | null;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = trimmedNextEmail || email;
    if (phone !== undefined) updateData.phone = phone || null;
    if (address !== undefined) updateData.address = address || null;
    if (bio !== undefined) updateData.bio = bio || null;

    const { error: updateError } = await supabase
      .from("User")
      .update(updateData)
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user profile:", updateError);
      // If User table update fails but auth was updated, try to revert auth
      if (isEmailChanged) {
        const admin = getSupabaseAdminClient();
        await admin.auth.admin.updateUserById(user.id, {
          email: trimmedCurrentEmail,
          email_confirm: true,
        });
      }
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isEmailChanged
        ? "Email and profile updated successfully"
        : "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error in user profile update API:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
