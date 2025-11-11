"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordDialog({
  open,
  onClose,
}: ChangePasswordDialogProps) {
  const [isChanging, setIsChanging] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>();

  const onSubmit = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (data.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChanging(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        console.error("Error changing password:", error);
        toast.error(error.message || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully!");
      handleClose();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An error occurred while changing password");
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register("currentPassword", {
                required: "Current password is required",
              })}
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-500">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isChanging}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isChanging}>
              {isChanging ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

