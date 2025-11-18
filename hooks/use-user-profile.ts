import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserProfile {
  name: string;
  email: string;
  profilePicture: string | null;
}

export function useUserProfile(user: SupabaseUser | null) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.email) {
        // Fallback to auth user data if no email
        if (user) {
          setUserProfile({
            name:
              (user.user_metadata?.name as string) ||
              user.email?.split("@")[0] ||
              "User",
            email: user.email || "",
            profilePicture: null,
          });
        }
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("User")
          .select("name, email, profilePicture")
          .eq("email", user.email.toLowerCase().trim())
          .maybeSingle();

        if (error) {
          console.error("Error fetching user profile:", error);
          // Fallback to auth user data on error
          setUserProfile({
            name:
              (user.user_metadata?.name as string) ||
              user.email.split("@")[0] ||
              "User",
            email: user.email || "",
            profilePicture: null,
          });
          return;
        }

        if (data) {
          setUserProfile({
            name: data.name || user.email.split("@")[0],
            email: data.email,
            profilePicture: data.profilePicture || null,
          });
        } else {
          // User not found in User table, use auth data
          setUserProfile({
            name:
              (user.user_metadata?.name as string) ||
              user.email.split("@")[0] ||
              "User",
            email: user.email || "",
            profilePicture: null,
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Fallback to auth user data on error
        setUserProfile({
          name:
            (user.user_metadata?.name as string) ||
            user.email?.split("@")[0] ||
            "User",
          email: user.email || "",
          profilePicture: null,
        });
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
  }, [user?.email, user]);

  return userProfile;
}
