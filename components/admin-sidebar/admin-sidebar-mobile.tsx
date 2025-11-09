"use client";

import { motion } from "framer-motion";
import { X, Menu, LogOut } from "lucide-react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminSidebarNavigation } from "./admin-sidebar-navigation";
import { adminNavigation } from "@/lib/constants/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AdminSidebarMobileProps {
  isSidebarOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  user: SupabaseUser | null;
  pathname: string;
  onLogout: () => void;
}

export function AdminSidebarMobile({
  isSidebarOpen,
  onClose,
  onOpen,
  user,
  pathname,
  onLogout,
}: AdminSidebarMobileProps) {
  const getUserInitial = (): string => {
    if (user?.user_metadata?.name) {
      return (user.user_metadata.name as string).charAt(0);
    }
    if (user?.email) {
      return user.email.charAt(0);
    }
    return "A";
  };

  const getUserName = (): string => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name as string;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "Administrator";
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
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
              <Badge
                variant="secondary"
                className="bg-red-100 text-red-700 text-xs"
              >
                Admin
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback className="bg-red-100 text-red-600">
                {getUserInitial()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">{getUserName()}</p>
              <p className="text-sm text-gray-500">Administrator</p>
            </div>
          </div>

          <AdminSidebarNavigation
            navigation={adminNavigation}
            pathname={pathname}
            onNavigate={onClose}
          />

          <div className="mt-6 pt-6 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onLogout}
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
          <Button variant="ghost" size="icon" onClick={onOpen}>
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

