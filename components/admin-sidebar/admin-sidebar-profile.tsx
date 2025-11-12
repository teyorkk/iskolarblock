"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SidebarProfileProps } from "@/types/components";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminSidebarProfile({
  user,
  isCollapsed,
}: SidebarProfileProps): React.JSX.Element {
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    profilePicture: string | null;
  } | null>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.email) return;

      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("User")
          .select("name, email, profilePicture")
          .eq("email", user.email.toLowerCase().trim())
          .maybeSingle();

        if (error) {
          console.error("Error fetching user profile:", error);
          return;
        }

        if (data) {
          setUserProfile({
            name: data.name || user.email.split("@")[0],
            email: data.email,
            profilePicture: data.profilePicture || null,
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    void fetchUserProfile();

    // Listen for profile update events
    const handleProfileUpdate = () => {
      void fetchUserProfile();
    };

    window.addEventListener("userProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
    };
  }, [user?.email]);

  const getUserInitial = (): string => {
    if (userProfile?.name) {
      return userProfile.name.charAt(0);
    }
    if (user?.email) {
      return user.email.charAt(0);
    }
    return "A";
  };

  const getUserName = (): string => {
    if (userProfile?.name) {
      return userProfile.name;
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
          <AvatarImage src={userProfile?.profilePicture || ""} />
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
        <AvatarImage src={userProfile?.profilePicture || ""} />
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

