"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { UserSidebar } from "@/components/user-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Lock,
  Save,
  Camera,
  CheckCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useSession } from "@/components/session-provider";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect } from "react";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

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

export default function SettingsPage() {
  const { user: authUser } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser?.email) return;

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("email", authUser.email)
        .single();

      if (data && !error) {
        setUserData(data);
        setProfilePicture(data.profilePicture || null);
        resetProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          bio: data.bio || "",
        });
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.email]);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: (authUser?.user_metadata?.name as string) || "",
      email: authUser?.email || "",
      phone: "",
      address: "",
      bio: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>();

  const onProfileSubmit = async () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setIsSaving(false);
    }, 1000);
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast.success("Password changed successfully!");
      setShowPasswordDialog(false);
      resetPassword();
    }, 1000);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !authUser?.id) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${authUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        // If bucket doesn't exist, create it or use public bucket
        toast.error("Failed to upload image. Please try again.");
        console.error("Upload error:", uploadError);
        setIsUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update user record in database (match by email since auth user id might differ)
      const { error: updateError } = await supabase
        .from("User")
        .update({ profilePicture: publicUrl })
        .eq("email", authUser.email);

      if (updateError) {
        toast.error("Failed to update profile picture");
        console.error("Update error:", updateError);
      } else {
        setProfilePicture(publicUrl);
        setUserData((prev) =>
          prev ? { ...prev, profilePicture: publicUrl } : null
        );
        toast.success("Profile image updated!");
      }
    } catch (error) {
      toast.error("An error occurred while uploading the image");
      console.error("Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar />

      {/* Main Content */}
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-1"
              >
                <Card>
                  <CardHeader className="text-center">
                    <div className="relative mx-auto">
                      <Avatar className="w-24 h-24 mx-auto">
                        <AvatarImage src={profilePicture || ""} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl">
                          {(
                            userData?.name ||
                            (authUser?.user_metadata?.name as string)
                          )?.charAt(0) ||
                            authUser?.email?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <label
                        className={`absolute bottom-0 right-0 bg-orange-500 rounded-full p-2 cursor-pointer hover:bg-orange-600 transition-colors ${
                          isUploading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <Camera className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                      </label>
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                    <CardTitle className="mt-4">
                      {userData?.name ||
                        (authUser?.user_metadata?.name as string) ||
                        authUser?.email?.split("@")[0]}
                    </CardTitle>
                    <CardDescription>{authUser?.email}</CardDescription>
                    <Badge
                      variant="secondary"
                      className="mt-2 bg-orange-100 text-orange-700"
                    >
                      Student
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Member since January 2024
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Email verified
                    </div>
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowPasswordDialog(true)}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Profile Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                          Update your personal information and contact details
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(!isEditing);
                          if (!isEditing) {
                            resetProfile();
                          }
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {isEditing ? "Cancel" : "Edit"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleProfileSubmit(onProfileSubmit)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="name"
                              {...registerProfile("name")}
                              className={`pl-10 ${
                                !isEditing ? "bg-gray-50" : ""
                              }`}
                              disabled={!isEditing}
                            />
                          </div>
                          {profileErrors.name && (
                            <p className="text-sm text-red-500">
                              {profileErrors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="email"
                              type="email"
                              {...registerProfile("email")}
                              className={`pl-10 ${
                                !isEditing ? "bg-gray-50" : ""
                              }`}
                              disabled={!isEditing}
                            />
                          </div>
                          {profileErrors.email && (
                            <p className="text-sm text-red-500">
                              {profileErrors.email.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="phone"
                            {...registerProfile("phone")}
                            className={`pl-10 ${
                              !isEditing ? "bg-gray-50" : ""
                            }`}
                            disabled={!isEditing}
                          />
                        </div>
                        {profileErrors.phone && (
                          <p className="text-sm text-red-500">
                            {profileErrors.phone.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                          <Textarea
                            id="address"
                            {...registerProfile("address")}
                            className={`pl-10 ${
                              !isEditing ? "bg-gray-50" : ""
                            }`}
                            disabled={!isEditing}
                            rows={2}
                          />
                        </div>
                        {profileErrors.address && (
                          <p className="text-sm text-red-500">
                            {profileErrors.address.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          {...registerProfile("bio")}
                          className={`${!isEditing ? "bg-gray-50" : ""}`}
                          disabled={!isEditing}
                          rows={3}
                          placeholder="Tell us about yourself..."
                        />
                        {profileErrors.bio && (
                          <p className="text-sm text-red-500">
                            {profileErrors.bio.message}
                          </p>
                        )}
                      </div>

                      {isEditing && (
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              resetProfile();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSaving}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...registerPassword("currentPassword", {
                  required: "Current password is required",
                })}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-500">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...registerPassword("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-500">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...registerPassword("confirmPassword", {
                  required: "Please confirm your password",
                })}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false);
                  resetPassword();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Change Password</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
