'use client'

import { motion } from "framer-motion"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/components/session-provider"
import { Loading } from "@/components/loading"
import { isAdmin } from "@/lib/utils/auth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { ready, user } = useSession()
  const hydrated = ready && typeof window !== 'undefined'

  useEffect(() => {
    if (!hydrated) return
    if (!user) {
      router.push('/login')
      return
    }
    // If user is not admin, redirect to user dashboard
    if (!isAdmin(user)) {
      router.push('/user-dashboard')
    }
  }, [hydrated, user, router])

  if (!hydrated || !user) {
    return <Loading />
  }

  // If user is not admin, show loading while redirecting
  if (!isAdmin(user)) {
    return <Loading />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
