"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "./session-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMobile } from "@/hooks/use-mobile";
import { AdminSidebarMobile } from "./admin-sidebar/admin-sidebar-mobile";
import { AdminSidebarDesktop } from "./admin-sidebar/admin-sidebar-desktop";

export function AdminSidebar(): React.JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useSession();
  const isMobile = useMobile();

  const handleLogout = async (): Promise<void> => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore errors
    } finally {
      window.location.href = "/login";
    }
  };

  if (isMobile) {
    return (
      <AdminSidebarMobile
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
        user={user}
        pathname={pathname}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <AdminSidebarDesktop
      user={user}
      pathname={pathname}
      onLogout={handleLogout}
    />
  );
}
