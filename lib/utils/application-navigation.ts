import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Determines the correct application route based on user's application history and current period
 * @param user - The current user
 * @returns The target route path
 */
export async function getApplicationRoute(
  user: SupabaseUser | null
): Promise<string> {
  if (!user) {
    return "/login";
  }

  try {
    const supabase = getSupabaseBrowserClient();

    // Check if there's an open application period
    const { data: periodData, error: periodError } = await supabase
      .from("ApplicationPeriod")
      .select("id")
      .eq("isOpen", true)
      .order("createdAt", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (periodError) {
      console.error("Error fetching application period:", periodError);
    }

    // Get user's applications
    const { data: applications, error: applicationsError } = await supabase
      .from("Application")
      .select("id, applicationPeriodId")
      .eq("userId", user.id);

    if (applicationsError) {
      throw applicationsError;
    }

    const hasPastApplication = Boolean(applications?.length);
    const currentApplication =
      periodData && applications
        ? applications.find((app) => app.applicationPeriodId === periodData.id)
        : null;

    // Determine target route
    if (!periodData) {
      return "/application";
    } else if (currentApplication) {
      return "/application";
    } else if (hasPastApplication) {
      return "/application/renewal";
    } else {
      return "/application/new";
    }
  } catch (error) {
    console.error("Failed to determine application destination:", error);
    // Fallback to application page
    return "/application";
  }
}
