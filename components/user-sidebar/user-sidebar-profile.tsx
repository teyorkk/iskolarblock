"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/use-user-profile";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserSidebarProfileProps {
  user: SupabaseUser | null;
  isCollapsed: boolean;
}

export function UserSidebarProfile({
  user,
  isCollapsed,
}: UserSidebarProfileProps): React.JSX.Element {
  const userProfile = useUserProfile(user);

  const getUserInitial = (): string => {
    if (userProfile?.name) {
      return userProfile.name.charAt(0);
    }
    if (user?.email) {
      return user.email.charAt(0);
    }
    return "U";
  };

  const getUserName = (): string => {
    if (userProfile?.name) {
      return userProfile.name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  const getUserEmail = (): string => {
    return userProfile?.email || user?.email || "";
  };

  if (isCollapsed) {
    return (
      <div className="flex justify-center mb-6">
        <Avatar>
          {userProfile?.profilePicture ? (
            <AvatarImage src={userProfile.profilePicture} />
          ) : null}
          <AvatarFallback className="bg-orange-100 text-orange-600">
            {getUserInitial()}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 mb-6 p-3 bg-orange-50 rounded-lg">
      <Avatar>
        {userProfile?.profilePicture ? (
          <AvatarImage src={userProfile.profilePicture} />
        ) : null}
        <AvatarFallback className="bg-orange-100 text-orange-600">
          {getUserInitial()}
        </AvatarFallback>
      </Avatar>
      <div className="overflow-hidden">
        <p className="font-medium text-gray-900 truncate" title={getUserName()}>
          {getUserName()}
        </p>
        <p className="text-sm text-gray-500 truncate" title={getUserEmail()}>
          {getUserEmail()}
        </p>
      </div>
    </div>
  );
}

