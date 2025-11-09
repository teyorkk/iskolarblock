"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SidebarProfileProps } from "@/types/components";

export function AdminSidebarProfile({
  user,
  isCollapsed,
}: SidebarProfileProps): React.JSX.Element {
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

  if (isCollapsed) {
    return (
      <div className="flex justify-center mb-6">
        <Avatar>
          <AvatarImage src="" />
          <AvatarFallback className="bg-red-100 text-red-600">
            {getUserInitial()}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 mb-6 p-3 bg-red-50 rounded-lg">
      <Avatar>
        <AvatarImage src="" />
        <AvatarFallback className="bg-red-100 text-red-600">
          {getUserInitial()}
        </AvatarFallback>
      </Avatar>
      <div className="overflow-hidden">
        <p className="font-medium text-gray-900 truncate">{getUserName()}</p>
        <p className="text-sm text-gray-500 truncate">Administrator</p>
      </div>
    </div>
  );
}

