import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

type MinimalDatabase = {
  public: {
    Tables: {
      Application: {
        Row: {
          id: string;
          userId: string;
          applicationPeriodId: string | null;
          status: "PENDING" | "APPROVED" | "REJECTED";
          updatedAt: string;
        };
        Insert: Partial<
          MinimalDatabase["public"]["Tables"]["Application"]["Row"]
        >;
        Update: Partial<
          MinimalDatabase["public"]["Tables"]["Application"]["Row"]
        >;
        Relationships: [];
      };
      ApplicationPeriod: {
        Row: {
          id: string;
          endDate: string | null;
        };
        Insert: Partial<
          MinimalDatabase["public"]["Tables"]["ApplicationPeriod"]["Row"]
        >;
        Update: Partial<
          MinimalDatabase["public"]["Tables"]["ApplicationPeriod"]["Row"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type PublicClient = SupabaseClient<MinimalDatabase>;

interface PendingApplication {
  id: string;
  applicationPeriodId: string | null;
}

interface ApplicationPeriodRow {
  id: string;
  endDate: string | null;
}

/**
 * Marks pending applications as REJECTED when their application period has ended.
 * Call this in APIs that read application data to keep statuses up to date without
 * requiring a background job.
 */
export async function expirePendingApplications(
  client?: PublicClient
): Promise<void> {
  try {
    const supabase: PublicClient =
      (client as PublicClient | undefined) ??
      (getSupabaseServerClient() as PublicClient);

    // Fetch pending applications with their associated period IDs
    const { data: pendingAppsData, error: pendingError } = await supabase
      .from("Application")
      .select("id, applicationPeriodId")
      .eq("status", "PENDING");

    const pendingApps = (pendingAppsData || []) as PendingApplication[];

    if (pendingError || pendingApps.length === 0) {
      return;
    }

    const uniquePeriodIds = Array.from(
      new Set(
        pendingApps
          .map((app) => app.applicationPeriodId)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      )
    );

    if (!uniquePeriodIds.length) {
      return;
    }

    const { data: periodsData, error: periodsError } = await supabase
      .from("ApplicationPeriod")
      .select("id, endDate")
      .in("id", uniquePeriodIds);

    const periods = (periodsData || []) as ApplicationPeriodRow[];

    if (periodsError || periods.length === 0) {
      return;
    }

    const periodMap = new Map<string, string | null>(
      periods.map((period) => [period.id, period.endDate])
    );
    const now = new Date();

    const expiredApplicationIds = pendingApps
      .filter((app) => {
        const endDate = app.applicationPeriodId
          ? periodMap.get(app.applicationPeriodId)
          : null;
        if (!endDate) return false;
        const end = new Date(endDate);
        return end.getTime() < now.getTime();
      })
      .map((app) => app.id);

    if (!expiredApplicationIds.length) {
      return;
    }

    await supabase
      .from("Application")
      .update({
        status: "REJECTED",
        updatedAt: new Date().toISOString(),
      })
      .in("id", expiredApplicationIds);
  } catch (error) {
    console.error("expirePendingApplications error:", error);
  }
}
