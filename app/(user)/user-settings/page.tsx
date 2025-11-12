"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { UserSidebar } from "@/components/user-sidebar";
import { ProfileCard } from "@/components/settings/profile-card";
import { ProfileForm } from "@/components/settings/profile-form";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";
import { useSession } from "@/components/session-provider";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UserData {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  bio: string | null;
  role: string;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
}

export default function SettingsPage() {
  const { user: authUser } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser?.email) {
        setIsLoading(false);
        toast.error("User not authenticated");
        return;
      }

      try {
        setIsLoading(true);
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("User")
          .select("*")
          .eq("email", authUser.email.toLowerCase().trim())
          .maybeSingle();

        if (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load profile data");
          setIsLoading(false);
          return;
        }

        if (data) {
          setUserData(data);
          setProfilePicture(data.profilePicture || null);
        } else {
          // User not found in User table
          toast.error("User profile not found in database");
          console.error("User not found in User table for email:", authUser.email);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An error occurred while loading profile");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchUserData();
  }, [authUser?.email]);

  const handleProfileUpdate = (formData: ProfileFormData) => {
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            name: formData.name,
            phone: formData.phone || null,
            address: formData.address || null,
            bio: formData.bio || null,
            updatedAt: new Date().toISOString(),
          }
        : null
    );
  };

  const handleProfilePictureUpdate = (url: string) => {
    setProfilePicture(url);
    setUserData((prev) => (prev ? { ...prev, profilePicture: url } : null));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
          <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar />

      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-1"
              >
                <ProfileCard
                  userData={userData}
                  profilePicture={profilePicture}
                  onPasswordClick={() => setShowPasswordDialog(true)}
                  onProfilePictureUpdate={handleProfilePictureUpdate}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <ProfileForm
                  userData={userData}
                  onUpdate={handleProfileUpdate}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <ChangePasswordDialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
      />
    </div>
  );
}
