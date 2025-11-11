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
    if (!userData?.email) {
      toast.error("User not authenticated");
      return;
    }

    setIsSaving(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const { error } = await supabase
        .from("User")
        .update({
          name: formData.name,
          phone: formData.phone || null,
          address: formData.address || null,
          bio: formData.bio || null,
          updatedAt: new Date().toISOString(),
        })
        .eq("email", userData.email);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
        return;
      }

      onUpdate(formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
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
                  {...register("email")}
                  className="pl-10 bg-gray-50"
                  disabled
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
                {...register("phone")}
                className={`pl-10 ${!isEditing ? "bg-gray-50" : ""}`}
                disabled={!isEditing}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
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

