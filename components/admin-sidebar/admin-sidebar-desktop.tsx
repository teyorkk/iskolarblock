"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSidebarHeader } from "./admin-sidebar-header";
import { AdminSidebarProfile } from "./admin-sidebar-profile";
import { AdminSidebarNavigation } from "./admin-sidebar-navigation";
import { adminNavigation } from "@/lib/constants/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AdminSidebarDesktopProps {
  user: SupabaseUser | null;
  pathname: string;
  onLogout: () => void;
}

export function AdminSidebarDesktop({
  user,
  pathname,
  onLogout,
}: AdminSidebarDesktopProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin-sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin-sidebar-collapsed", isCollapsed.toString());
    }
  }, [isCollapsed]);

  return (
    <>
      {/* Collapsible Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-screen bg-white shadow-lg z-40 hidden md:block"
      >
        <AdminSidebarHeader isCollapsed={isCollapsed} />

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 bg-white border shadow-md rounded-full hover:bg-gray-100 z-50"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>

        <div className="p-4 overflow-y-auto h-[calc(100vh-88px)]">
          <AdminSidebarProfile user={user} isCollapsed={isCollapsed} />

          <AdminSidebarNavigation
            navigation={adminNavigation}
            pathname={pathname}
            isCollapsed={isCollapsed}
          />

          {/* Logout */}
          <div className="mt-6 pt-6 border-t">
            <Button
              variant="ghost"
              className={`w-full ${
                isCollapsed ? "justify-center px-2" : "justify-start"
              } text-red-600 hover:text-red-700 hover:bg-red-50`}
              onClick={onLogout}
              title={isCollapsed ? "Logout" : ""}
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Desktop Header */}
      <motion.header
        initial={false}
        animate={{ marginLeft: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3 }}
        className="bg-white border-b px-6 py-4 fixed top-0 right-0 left-0 z-30 hidden md:block"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {adminNavigation.find((item) => item.href === pathname)?.name ||
              "Dashboard"}
          </h1>
        </div>
      </motion.header>
    </>
  );
}
