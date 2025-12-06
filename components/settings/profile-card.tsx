"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Lock, Camera, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentTimePH } from "@/lib/utils/date-formatting";

interface ProfileCardProps {
  userData: {
    name: string;
    email: string;
    role: string;
    createdAt: string;
    profilePicture: string | null;
  } | null;
  profilePicture: string | null;
  onPasswordClick: () => void;
  onProfilePictureUpdate: (url: string | null) => void;
  isAdmin?: boolean;
}

export function ProfileCard({
  userData,
  profilePicture,
  onPasswordClick,
  onProfilePictureUpdate,
  isAdmin = false,
}: ProfileCardProps) {
  const [isUploading, setIsUploading] = useState(false);

  const getStoragePathFromUrl = (
    url: string | null | undefined
  ): string | null => {
    if (!url) return null;
    const marker = "/storage/v1/object/public/avatars/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.substring(idx + marker.length);
  };

  const deleteProfilePictureFile = async (url: string | null | undefined) => {
    const path = getStoragePathFromUrl(url);
    if (!path) return;
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.storage.from("avatars").remove([path]);
    if (error) {
      console.warn("Failed to remove old profile picture:", error);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !userData?.email) return;

    // Validate file type - allow any image format
    const isImageFile = file.type?.startsWith("image/");
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (!isImageFile) {
      toast.error("Please upload a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const previousUrl = profilePicture;

      // Get user ID from User table first
      const { data: userRecord, error: userError } = await supabase
        .from("User")
        .select("id")
        .eq("email", userData.email.toLowerCase().trim())
        .single();

      if (userError || !userRecord) {
        toast.error("User not found. Please try again.");
        console.error("User lookup error:", userError);
        return;
      }

      const safeExtension =
        fileExt || file.type.split("/").pop()?.toLowerCase() || "jpg";
      const fileName = `profile-pictures/${
        userRecord.id
      }/${Date.now()}.${safeExtension}`;

      // Upload to avatars bucket (has RLS policy for profile pictures)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        toast.error("Failed to upload image. Please try again.");
        console.error("Upload error:", uploadError);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("User")
        .update({
          profilePicture: publicUrl,
          updatedAt: getCurrentTimePH(),
        })
        .eq("email", userData.email.toLowerCase().trim());

      if (updateError) {
        toast.error("Failed to update profile picture");
        console.error("Update error:", updateError);
      } else {
        onProfilePictureUpdate(publicUrl);
        toast.success("Profile image updated!");
        if (previousUrl) {
          await deleteProfilePictureFile(previousUrl);
        }

        // Dispatch event to notify sidebar and other components
        window.dispatchEvent(new CustomEvent("userProfileUpdated"));
      }
    } catch (error) {
      toast.error("An error occurred while uploading the image");
      console.error("Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!userData?.email) {
      toast.error("User not authenticated");
      return;
    }

    if (!profilePicture) {
      toast.error("No profile photo to remove");
      return;
    }

    setIsUploading(true);

    try {
      await deleteProfilePictureFile(profilePicture);

      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase
        .from("User")
        .update({
          profilePicture: null,
          updatedAt: getCurrentTimePH(),
        })
        .eq("email", userData.email.toLowerCase().trim());

      if (updateError) {
        toast.error("Failed to remove profile picture");
        console.error("Remove photo error:", updateError);
        return;
      }

      onProfilePictureUpdate(null);
      toast.success("Profile photo removed");

      window.dispatchEvent(new CustomEvent("userProfileUpdated"));
    } catch (error) {
      console.error("Unexpected error removing photo:", error);
      toast.error("Unable to remove profile photo");
    } finally {
      setIsUploading(false);
    }
  };

  const getInitial = () => {
    if (userData?.name) return userData.name.charAt(0);
    if (userData?.email) return userData.email.charAt(0);
    return "U";
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="relative mx-auto">
          <Avatar className="w-24 h-24 mx-auto">
            {profilePicture ? <AvatarImage src={profilePicture} /> : null}
            <AvatarFallback
              className={`${
                isAdmin
                  ? "bg-red-100 text-red-600"
                  : "bg-orange-100 text-orange-600"
              } text-2xl`}
            >
              {getInitial()}
            </AvatarFallback>
          </Avatar>
          <label
            className={`absolute bottom-0 right-0 rounded-full p-2 cursor-pointer transition-colors z-20 ${
              isAdmin
                ? "bg-red-500 hover:bg-red-600"
                : "bg-orange-500 hover:bg-orange-600"
            } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
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
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/90 z-10">
              <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <CardTitle className="mt-4">
          {userData?.name || userData?.email?.split("@")[0]}
        </CardTitle>
        <CardDescription>{userData?.email}</CardDescription>
        <div className="flex justify-center mt-2">
          <Badge
            variant="secondary"
            className={
              isAdmin
                ? "bg-red-100 text-red-700"
                : "bg-orange-100 text-orange-700"
            }
          >
            {isAdmin ? "Admin" : "User"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          Member since{" "}
          {userData?.createdAt
            ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "Recently"}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
          Email verified
        </div>
        <div className="pt-4 border-t space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleRemovePhoto}
            disabled={isUploading || !profilePicture}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Photo
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={onPasswordClick}
          >
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
