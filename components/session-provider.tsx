"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"

type UserRole = "ADMIN" | "USER" | null

type SessionContextValue = {
  ready: boolean
  session: Session | null
  user: User | null
  userRole: UserRole
  isAdmin: boolean
  loadingRole: boolean
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [loadingRole, setLoadingRole] = useState(false)

  // Fetch user role from database when session changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session?.user?.email) {
        setUserRole(null)
        return
      }

      setLoadingRole(true)
      try {
        const response = await fetch("/api/user/role")
        if (response.ok) {
          const data = await response.json()
          setUserRole(data.role || null)
        } else {
          console.error("Failed to fetch user role:", await response.text())
          setUserRole(null)
        }
      } catch (error) {
        console.error("Error fetching user role:", error)
        setUserRole(null)
      } finally {
        setLoadingRole(false)
      }
    }

    fetchUserRole()
  }, [session?.user?.email])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    // Initial load
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setReady(true)
    })

    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      // Reset role when session changes
      if (!newSession) {
        setUserRole(null)
      }
    })
    const unsub = () => sub.subscription.unsubscribe()

    return () => {
      unsub()
    }
  }, [])

  const value = useMemo<SessionContextValue>(() => ({
    ready,
    session,
    user: session?.user ?? null,
    userRole,
    isAdmin: userRole === "ADMIN",
    loadingRole,
  }), [ready, session, userRole, loadingRole])

  if (!ready) return null
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used within SessionProvider")
  return ctx
}
