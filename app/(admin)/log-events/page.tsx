"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/common/pagination";
import { Loader2, RefreshCcw, Search } from "lucide-react";
import type { LogEventRecord } from "@/types/log-event";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const PAGE_SIZE = 10;

const animations = `
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

const formatTimestamp = (iso: string): string => {
  return new Date(iso).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function AdminLogEventsPage(): React.JSX.Element {
  const [events, setEvents] = useState<LogEventRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasRealtimeUpdates, setHasRealtimeUpdates] = useState(false);
  const [shouldNotify, setShouldNotify] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: PAGE_SIZE.toString(),
        });
        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }

        const response = await fetch(`/api/log-events?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load log events");
        }

        let fetchedEvents: LogEventRecord[] = data.events ?? [];

        // Fetch profile pictures for events missing avatar URLs
        const missingAvatarIds = Array.from(
          new Set(
            fetchedEvents
              .filter((event) => !event.actor_avatar_url && event.actor_id)
              .map((event) => event.actor_id as string)
          )
        );

        if (missingAvatarIds.length > 0) {
          const supabase = getSupabaseBrowserClient();
          const { data: users } = await supabase
            .from("User")
            .select("id, profilePicture")
            .in("id", missingAvatarIds);

          if (users && users.length > 0) {
            const avatarMap = new Map(
              users
                .filter((user) => Boolean(user.profilePicture))
                .map((user) => [user.id, user.profilePicture as string])
            );

            if (avatarMap.size > 0) {
              fetchedEvents = fetchedEvents.map((event) => {
                if (!event.actor_avatar_url && event.actor_id) {
                  const profilePicture = avatarMap.get(event.actor_id);
                  if (profilePicture) {
                    return { ...event, actor_avatar_url: profilePicture };
                  }
                }
                return event;
              });
            }
          }
        }

        setEvents(fetchedEvents);
        setTotal(data.total ?? 0);

        if (shouldNotify) {
          toast.success("Log events refreshed.");
        }
      } catch (error) {
        console.error("Failed to fetch log events:", error);
        setEvents([]);
        setTotal(0);

        if (shouldNotify) {
          toast.error("Failed to refresh log events. Please try again.");
        }
      } finally {
        if (shouldNotify) {
          setShouldNotify(false);
        }
        setIsLoading(false);
      }
    };

    void fetchEvents();
  }, [page, debouncedSearch, refreshKey]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("log-events-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "LogEvent" },
        () => {
          setHasRealtimeUpdates(true);
          setRefreshKey((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const totalPages = useMemo(() => {
    if (total === 0) return 1;
    return Math.ceil(total / PAGE_SIZE);
  }, [total]);

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{animations}</style>
      <AdminSidebar />

      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <Card className="max-w-5xl mx-auto shadow-sm">
            <CardHeader className="border-b space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Log Events</CardTitle>
                  <CardDescription>
                    Monitor authentication, application, and administrative
                    activities.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {hasRealtimeUpdates && !isLoading && (
                    <span className="text-xs text-green-600 flex items-center">
                      Live updates
                      <span className="ml-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShouldNotify(true);
                      setRefreshKey((prev) => prev + 1);
                    }}
                    disabled={isLoading}
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, email, or event type..."
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="divide-y">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  No log events match your criteria.
                </div>
              ) : (
                <motion.div
                  className="space-y-3"
                  initial="initial"
                  animate="animate"
                  variants={{
                    initial: {},
                    animate: {
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                >
                  {events.map((log) => (
                    <motion.div
                      key={log.id}
                      className="rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm hover:shadow-md transition-all duration-200"
                      variants={{
                        initial: { opacity: 0, y: 10 },
                        animate: { opacity: 1, y: 0 },
                      }}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-12 w-12 border border-orange-50">
                            {log.actor_avatar_url ? (
                              <AvatarImage
                                src={log.actor_avatar_url}
                                alt={log.actor_name ?? "User avatar"}
                              />
                            ) : null}
                            <AvatarFallback className="bg-orange-100 text-orange-600">
                              {(log.actor_name || log.actor_username || "?")
                                .split(" ")
                                .map((chunk) => chunk[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-gray-900">
                                {log.actor_name || "Unknown Actor"}
                              </p>
                              <Badge
                                variant="outline"
                                className="capitalize text-xs tracking-wide"
                              >
                                {log.actor_role || "Unknown"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {log.actor_username || "—"}
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {log.message}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 text-left md:text-right min-w-[180px]">
                          <p className="font-medium text-gray-800">
                            {formatTimestamp(log.created_at)}
                          </p>
                          <p className="text-[11px] uppercase tracking-wide text-gray-400">
                            {log.event_type.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
          {events.length > 0 && (
            <div className="max-w-5xl mx-auto mt-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages || 1}
                onPageChange={setPage}
                itemsPerPage={PAGE_SIZE}
                totalItems={total}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
