import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { LogEventRecord, LogEventType } from "@/types/log-event";

type SupabaseClient = ReturnType<typeof getSupabaseServerClient>;

interface LogEventPayload {
  eventType: LogEventType;
  message: string;
  actorId?: string | null;
  actorRole?: string | null;
  actorName?: string | null;
  actorUsername?: string | null;
  actorAvatarUrl?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function logEvent(
  payload: LogEventPayload,
  client?: SupabaseClient
): Promise<void> {
  try {
    const supabase = client ?? getSupabaseServerClient();
    const { error } = await supabase.from("LogEvent").insert({
      actor_id: payload.actorId ?? null,
      actor_role: payload.actorRole ?? null,
      actor_name: payload.actorName ?? null,
      actor_username: payload.actorUsername ?? null,
      actor_avatar_url: payload.actorAvatarUrl ?? null,
      event_type: payload.eventType,
      message: payload.message,
      metadata: payload.metadata ?? null,
    });

    if (error) {
      console.error("Failed to log event:", error);
    }
  } catch (error) {
    console.error("Unexpected error while logging event:", error);
  }
}

interface FetchLogEventsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function fetchLogEvents(
  params: FetchLogEventsParams
): Promise<{ events: LogEventRecord[]; total: number }> {
  const { page = 1, pageSize = 10, search } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("LogEvent")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search && search.trim().length > 0) {
    const term = `%${search.trim()}%`;
    query = query.or(
      `actor_name.ilike.${term},actor_username.ilike.${term},event_type.ilike.${term}`
    );
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Failed to fetch log events:", error);
    return { events: [], total: 0 };
  }

  return { events: data ?? [], total: count ?? 0 };
}








