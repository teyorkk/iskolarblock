import type { User } from "@supabase/supabase-js";

export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  
  return (
    user?.email === "admin@admin.com" ||
    user?.email === "admin@scholarblock.com" ||
    user?.user_metadata?.role === "admin" ||
    user?.user_metadata?.isAdmin === true
  );
}

