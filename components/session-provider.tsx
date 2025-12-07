"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type UserRole = "ADMIN" | "USER" | null;

type SessionContextValue = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  userRole: UserRole;
  isAdmin: boolean;
  loadingRole: boolean;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

// Session timeout duration: 15 minutes in milliseconds
const SESSION_TIMEOUT = 15 * 60 * 1000;

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loadingRole, setLoadingRole] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const router = useRouter();

  // Handle logout
  const handleLogout = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setSession(null);
    setUserRole(null);
    router.push("/login");
  }, [router]);

  // Update last activity time
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Track user activity
  useEffect(() => {
    if (!session) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    events.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [session, updateActivity]);

  // Check for session timeout (skip for admin users)
  useEffect(() => {
    if (!session) return;
    // Skip timeout check for admin users
    if (userRole === "ADMIN") return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= SESSION_TIMEOUT) {
        toast.error("Session expired due to inactivity. Please log in again.");
        handleLogout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [session, lastActivity, handleLogout, userRole]);

  // Fetch user role from database when session changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session?.user?.email) {
        setUserRole(null);
        return;
      }

      setLoadingRole(true);
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: userData, error } = await supabase
          .from("User")
          .select("role")
          .eq("email", session.user.email.toLowerCase().trim())
          .maybeSingle();

        if (error) {
          console.error("Error fetching user role:", error);
          setUserRole(null);
        } else {
          setUserRole((userData?.role as UserRole) || null);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole(null);
      } finally {
        setLoadingRole(false);
      }
    };

    fetchUserRole();
  }, [session?.user?.email]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // Initial load
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setReady(true);
    });

    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        // Reset role when session changes
        if (!newSession) {
          setUserRole(null);
        }
      }
    );
    const unsub = () => sub.subscription.unsubscribe();

    return () => {
      unsub();
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      userRole,
      isAdmin: userRole === "ADMIN",
      loadingRole,
    }),
    [ready, session, userRole, loadingRole]
  );

  if (!ready) return null;
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
