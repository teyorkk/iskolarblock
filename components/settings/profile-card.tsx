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
import { Calendar, Lock, Camera, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
  onProfilePictureUpdate: (url: string) => void;
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !userData?.email) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${userData.email}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        toast.error("Failed to upload image. Please try again.");
        console.error("Upload error:", uploadError);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("User")
        .update({ profilePicture: publicUrl })
        .eq("email", userData.email);

      if (updateError) {
        toast.error("Failed to update profile picture");
        console.error("Update error:", updateError);
      } else {
        onProfilePictureUpdate(publicUrl);
        toast.success("Profile image updated!");
      }
    } catch (error) {
      toast.error("An error occurred while uploading the image");
      console.error("Error:", error);
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
            <AvatarImage src={profilePicture || ""} />
            <AvatarFallback className="bg-red-100 text-red-600 text-2xl">
              {getInitial()}
            </AvatarFallback>
          </Avatar>
          <label
            className={`absolute bottom-0 right-0 bg-red-500 rounded-full p-2 cursor-pointer hover:bg-red-600 transition-colors ${
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
        <div className="pt-4 border-t">
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
