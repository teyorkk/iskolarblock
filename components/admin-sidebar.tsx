"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Shield,
  Award,
  Menu,
  X,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "./session-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMobile } from "@/hooks/use-mobile";

const navigation = [
  { name: "Dashboard", href: "/admin-dashboard", icon: Home },
  { name: "Users", href: "/users", icon: UserCircle },
  { name: "Screening", href: "/screening", icon: Users },
  { name: "Blockchain Records", href: "/blockchain", icon: Shield },
  { name: "Awarding", href: "/awarding", icon: Award },
  { name: "Settings", href: "/admin-settings", icon: Settings },
];

export function AdminSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin-sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });
  const pathname = usePathname();
  const { user } = useSession();
  const isMobile = useMobile();

  // Save collapse state to localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin-sidebar-collapsed", isCollapsed.toString());
    }
  }, [isCollapsed]);

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // swallow
    } finally {
      window.location.href = "/login";
    }
  };

  // Mobile bottom navigation
  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Overlay */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: isSidebarOpen ? 0 : -300 }}
          className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50"
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-orange-500" />
                <span className="font-bold text-lg">ScholarBlock</span>
                <Badge
                  variant="secondary"
                  className="bg-red-100 text-red-700 text-xs"
                >
                  Admin
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center space-x-3 mb-6">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-red-100 text-red-600">
                  {(user?.user_metadata?.name as string)?.charAt(0) ||
                    user?.email?.charAt(0) ||
                    "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">
                  {(user?.user_metadata?.name as string) ||
                    user?.email?.split("@")[0]}
                </p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-red-50 text-red-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Mobile Header */}
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <span className="font-bold">ScholarBlock</span>
            </div>
            <div className="w-8 h-8"></div>
          </div>
        </header>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <>
      {/* Collapsible Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-screen bg-white shadow-lg z-40 hidden md:block"
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-xl">ScholarBlock</span>
                <Badge
                  variant="secondary"
                  className="ml-2 bg-red-100 text-red-700 text-xs"
                >
                  Admin
                </Badge>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

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
          {/* User Profile */}
          {!isCollapsed && (
            <div className="flex items-center space-x-3 mb-6 p-3 bg-red-50 rounded-lg">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-red-100 text-red-600">
                  {(user?.user_metadata?.name as string)?.charAt(0) ||
                    user?.email?.charAt(0) ||
                    "A"}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="font-medium text-gray-900 truncate">
                  {(user?.user_metadata?.name as string) ||
                    user?.email?.split("@")[0]}
                </p>
                <p className="text-sm text-gray-500 truncate">Administrator</p>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="flex justify-center mb-6">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-red-100 text-red-600">
                  {(user?.user_metadata?.name as string)?.charAt(0) ||
                    user?.email?.charAt(0) ||
                    "A"}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center ${
                  isCollapsed ? "justify-center" : "space-x-3"
                } px-3 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-red-50 text-red-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="mt-6 pt-6 border-t">
            <Button
              variant="ghost"
              className={`w-full ${
                isCollapsed ? "justify-center px-2" : "justify-start"
              } text-red-600 hover:text-red-700 hover:bg-red-50`}
              onClick={handleLogout}
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
            {navigation.find((item) => item.href === pathname)?.name ||
              "Dashboard"}
          </h1>
        </div>
      </motion.header>
    </>
  );
}
