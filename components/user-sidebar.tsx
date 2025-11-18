"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "./session-provider";
import { useMobile } from "@/hooks/use-mobile";
import { useLogout } from "@/hooks/use-logout";
import { UserSidebarDesktop } from "./user-sidebar/user-sidebar-desktop";
import { UserSidebarMobile } from "./user-sidebar/user-sidebar-mobile";

export function UserSidebar(): React.JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useSession();
  const isMobile = useMobile();
  const { logout } = useLogout();

  if (isMobile) {
    return (
      <UserSidebarMobile
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
        user={user}
        pathname={pathname}
        onLogout={logout}
      />
    );
  }

  return (
    <UserSidebarDesktop user={user} pathname={pathname} onLogout={logout} />
  );
}
