"use client";

import NextImage from "next/image";
import { Badge } from "@/components/ui/badge";
import type { SidebarHeaderProps } from "@/types/components";

export function AdminSidebarHeader({
  isCollapsed,
}: SidebarHeaderProps): React.JSX.Element {
  return (
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
  );
}
