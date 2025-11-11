"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  History,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "./session-provider";
import { useMobile } from "@/hooks/use-mobile";

const navigation = [
  { name: "Dashboard", href: "/user-dashboard", icon: Home },
  { name: "Application", href: "/application", icon: FileText },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/user-settings", icon: Settings },
];

export function UserSidebar(): React.JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user-sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });
  const pathname = usePathname();
  const { user } = useSession();
  const isMobile = useMobile();

  // Save collapse state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user-sidebar-collapsed", isCollapsed.toString());
    }
  }, [isCollapsed]);

  const handleLogout = async (): Promise<void> => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
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
                <div className="relative w-6 h-6 rounded overflow-hidden">
                  <NextImage
                    src="/scholarblock.svg"
                    alt="ScholarBlock Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-bold text-lg">ScholarBlock</span>
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
                <AvatarFallback className="bg-orange-100 text-orange-600">
                  {(user?.user_metadata?.name as string)?.charAt(0) ||
                    user?.email?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">
                  {(user?.user_metadata?.name as string) ||
                    user?.email?.split("@")[0]}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-orange-50 text-orange-600"
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
              <div className="relative w-5 h-5 rounded overflow-hidden">
                <NextImage
                  src="/scholarblock.svg"
                  alt="ScholarBlock Logo"
                  fill
                  className="object-contain"
                />
              </div>
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
              <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                <NextImage
                  src="/scholarblock.svg"
                  alt="ScholarBlock Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-xl">ScholarBlock</span>
            </div>
          )}
          {isCollapsed && (
            <div className="relative w-10 h-10 rounded-lg overflow-hidden mx-auto">
              <NextImage
                src="/scholarblock.svg"
                alt="ScholarBlock Logo"
                fill
                className="object-contain"
              />
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
            <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-orange-100 text-orange-600">
                  {(user?.user_metadata?.name as string)?.charAt(0) ||
                    user?.email?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="font-medium text-gray-900 truncate">
                  {(user?.user_metadata?.name as string) ||
                    user?.email?.split("@")[0]}
                </p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="flex justify-center mb-6">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-orange-100 text-orange-600">
                  {(user?.user_metadata?.name as string)?.charAt(0) ||
                    user?.email?.charAt(0) ||
                    "U"}
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
                    ? "bg-orange-50 text-orange-600"
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
