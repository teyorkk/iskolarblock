"use client";

import {
  Key,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User as UserIcon,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils/date-formatting";
import { UserApplicationsTable } from "./user-applications-table";
import type { UserProfileDialogProps } from "@/types/components";

export function UserProfileDialog({
  user,
  isOpen,
  onClose,
  applications,
  isLoadingApplications,
  onDelete,
  onSendPasswordReset,
  isSendingOTP,
}: UserProfileDialogProps): React.JSX.Element | null {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw]! sm:w-[85vw]! md:w-[75vw]! max-w-[75vw]! sm:max-w-[85vw]! md:max-w-[75vw]! max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            View detailed information about the user
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b">
            <Avatar className="w-20 h-20 shrink-0">
              <AvatarImage src={user.profilePicture || ""} />
              <AvatarFallback
                className={`${
                  user.role === "ADMIN"
                    ? "bg-red-100 text-red-600"
                    : "bg-orange-100 text-orange-600"
                } text-2xl`}
              >
                {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 wrap-break-word">
                {user.name || user.email?.split("@")[0] || "Unknown"}
              </h3>
              <p className="text-gray-600 wrap-break-word">{user.email}</p>
              <Badge
                variant="secondary"
                className={
                  user.role === "ADMIN"
                    ? "bg-red-100 text-red-700 mt-2"
                    : "bg-orange-100 text-orange-700 mt-2"
                }
              >
                {user.role || "USER"}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSendPasswordReset(user)}
                disabled={isSendingOTP}
                className="w-full sm:w-auto"
              >
                <Key className="w-4 h-4 mr-2" />
                {isSendingOTP ? "Sending..." : "Send Reset OTP"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
                onClick={() => {
                  onClose();
                  onDelete(user);
                }}
                disabled={user.role === "ADMIN"}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 shrink-0" />
                <span className="font-medium">Email:</span>
              </div>
              <p className="text-gray-900 pl-6 wrap-break-word">{user.email}</p>
            </div>

            {user.phone && (
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 shrink-0" />
                  <span className="font-medium">Phone:</span>
                </div>
                <p className="text-gray-900 pl-6 wrap-break-word">
                  {user.phone}
                </p>
              </div>
            )}

            {user.address && (
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 shrink-0" />
                  <span className="font-medium">Address:</span>
                </div>
                <p className="text-gray-900 pl-6 wrap-break-word">
                  {user.address}
                </p>
              </div>
            )}

            {user.bio && (
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <UserIcon className="w-4 h-4 mr-2 shrink-0" />
                  <span className="font-medium">Bio:</span>
                </div>
                <p className="text-gray-900 pl-6 wrap-break-word">{user.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 shrink-0" />
                  <span className="font-medium">Joined:</span>
                </div>
                <p className="text-gray-900 pl-6">
                  {formatDate(user.createdAt)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 shrink-0" />
                  <span className="font-medium">Last Updated:</span>
                </div>
                <p className="text-gray-900 pl-6">
                  {formatDate(user.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Application History */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Application History
              </h4>
              {isLoadingApplications && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
              )}
            </div>
            <UserApplicationsTable
              applications={applications}
              isLoading={isLoadingApplications}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
