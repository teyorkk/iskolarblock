import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { logEvent, fetchLogEvents } from "@/lib/services/log-events";
import type { LogEventType } from "@/types/log-event";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  const search = searchParams.get("search") ?? undefined;

  const { events, total } = await fetchLogEvents({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10,
    search,
  });

  return NextResponse.json({
    events,
    total,
    page,
    pageSize,
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      eventType: LogEventType;
      message: string;
      metadata?: Record<string, unknown>;
    };

    const { data: profile } = await supabase
      .from("User")
      .select("id, name, email, role, profilePicture")
      .eq("id", user.id)
      .maybeSingle();

    await logEvent(
      {
        eventType: body.eventType,
        message: body.message,
        metadata: body.metadata ?? null,
        actorId: profile?.id ?? user.id,
        actorRole: profile?.role ?? "USER",
        actorName: profile?.name ?? user.email ?? "Unknown",
        actorUsername: profile?.email ?? user.email ?? null,
        actorAvatarUrl: profile?.profilePicture ?? null,
      },
      supabase
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to write log event:", error);
    return NextResponse.json(
      { error: "Failed to record log event" },
      { status: 500 }
    );
  }
}



