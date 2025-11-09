"use client";

import Link from "next/link";
import type { SidebarNavigationProps } from "@/types/components";

export function AdminSidebarNavigation({
  navigation,
  pathname,
  isCollapsed,
  onNavigate,
}: SidebarNavigationProps): React.JSX.Element {
  return (
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
          onClick={onNavigate}
        >
          <item.icon className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">{item.name}</span>}
        </Link>
      ))}
    </nav>
  );
}

