import type { User } from "@supabase/supabase-js";

export function isAdmin(
  user: User | null,
  userRole?: "ADMIN" | "USER" | null
): boolean {
  if (!user) return false;

  // If userRole is provided (from database), use it
  if (userRole) {
    return userRole === "ADMIN";
  }

  // Fallback: This should not be used in production
  // Only for backward compatibility during migration
  // TODO: Remove this fallback after all components are updated
  return false;
}
