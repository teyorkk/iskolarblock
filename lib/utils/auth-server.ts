/**
 * Server-side authentication utilities
 * These functions query the database to check user roles
 */

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type UserRole = "ADMIN" | "USER";

/**
 * Get user role from the User table in the database
 * @param userEmail - The user's email address
 * @returns The user's role (ADMIN or USER) or null if not found
 */
export async function getUserRoleFromDatabase(
  userEmail: string | undefined | null
): Promise<UserRole | null> {
  if (!userEmail) {
    return null;
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data: userData, error } = await supabase
      .from("User")
      .select("role")
      .eq("email", userEmail.toLowerCase().trim())
      .maybeSingle();

    if (error || !userData) {
      console.error("Error fetching user role:", error);
      return null;
    }

    return (userData.role as UserRole) || "USER";
  } catch (error) {
    console.error("Error in getUserRoleFromDatabase:", error);
    return null;
  }
}

/**
 * Check if a user is an admin based on their role in the database
 * @param userEmail - The user's email address
 * @returns true if the user is an admin, false otherwise
 */
export async function isAdminFromDatabase(
  userEmail: string | undefined | null
): Promise<boolean> {
  const role = await getUserRoleFromDatabase(userEmail);
  return role === "ADMIN";
}

/**
 * Verify that the current authenticated user is an admin
 * This should be used in API routes and server components
 * @returns The user's role if they are authenticated, null otherwise
 * @throws Error if user is not authenticated or not an admin
 */
export async function requireAdmin(): Promise<{ email: string; role: UserRole }> {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    throw new Error("Unauthorized");
  }

  const role = await getUserRoleFromDatabase(user.email);
  if (role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }

  return { email: user.email, role };
}

