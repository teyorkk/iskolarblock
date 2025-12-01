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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MapPin, Edit, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
}

interface ProfileFormProps {
  userData: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    bio: string | null;
  } | null;
  onUpdate: (data: ProfileFormData) => void;
}

export function ProfileForm({ userData, onUpdate }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    values: {
      name: userData?.name || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      address: userData?.address || "",
      bio: userData?.bio || "",
    },
  });

  const onSubmit = async (formData: ProfileFormData) => {
    if (!userData?.email || !userData?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsSaving(true);

    try {
      const trimmedNextEmail = formData.email.toLowerCase().trim();
      const isEmailChanged =
        trimmedNextEmail !== userData.email.toLowerCase().trim();

      // Use API route to update profile (handles both auth and User table)
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: trimmedNextEmail,
          phone: formData.phone || null,
          address: formData.address || null,
          bio: formData.bio || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error updating profile:", data);
        toast.error(data.error || "Failed to update profile");
        return;
      }

      onUpdate({
        ...formData,
        email: trimmedNextEmail,
      });

      if (isEmailChanged) {
        toast.success("Email and profile updated successfully!");
      } else {
        toast.success("Profile updated successfully!");
      }
      setIsEditing(false);

      // Dispatch event to notify sidebar and other components
      window.dispatchEvent(new CustomEvent("userProfileUpdated"));
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An error occurred while updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    reset({
      name: userData?.name || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      address: userData?.address || "",
      bio: userData?.bio || "",
    });
    setIsEditing(false);
  };

  return (
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
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="name"
                  {...register("name")}
                  className={`pl-10 ${!isEditing ? "bg-gray-50" : ""}`}
                  disabled={!isEditing}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email format",
                    },
                  })}
                  className={`pl-10 ${!isEditing ? "bg-gray-50" : ""}`}
                  disabled={!isEditing}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="phone"
                type="tel"
                placeholder="09XXXXXXXXX"
                {...register("phone", {
                  pattern: {
                    value: /^09\d{9}$/,
                    message: "Phone number must start with 09 and be 11 digits",
                  },
                })}
                className={`pl-10 ${!isEditing ? "bg-gray-50" : ""}`}
                disabled={!isEditing}
                maxLength={11}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
            {isEditing && (
              <p className="text-xs text-gray-500">
                Format: 09XXXXXXXXX (11 digits)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <Textarea
                id="address"
                {...register("address")}
                className={`pl-10 ${!isEditing ? "bg-gray-50" : ""}`}
                disabled={!isEditing}
                rows={2}
              />
            </div>
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              className={!isEditing ? "bg-gray-50" : ""}
              disabled={!isEditing}
              rows={3}
              placeholder="Tell us about yourself..."
            />
            {errors.bio && (
              <p className="text-sm text-red-500">{errors.bio.message}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
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
  );
}
