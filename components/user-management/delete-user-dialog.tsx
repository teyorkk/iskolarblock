"use client";

import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { DeleteUserDialogProps } from "@/types/components";

export function DeleteUserDialog({
  user,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  hasActiveApplications = false,
  activeApplicationCount = 0,
}: DeleteUserDialogProps): React.JSX.Element {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent
        className="data-[state=closed]:!translate-x-0 data-[state=closed]:!translate-y-0 data-[state=open]:!translate-x-0 data-[state=open]:!translate-y-0"
        style={{
          transform: "translate(-50%, -50%)",
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasActiveApplications ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">
                      Cannot delete user with active applications
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-semibold">
                        {user?.name || user?.email}
                      </span>{" "}
                      has {activeApplicationCount} active application
                      {activeApplicationCount > 1 ? "s" : ""} (pending,
                      approved, or granted). Please reject or process these
                      applications first.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                This action cannot be undone. This will permanently delete the
                user account{" "}
                <span className="font-semibold">
                  {user?.name || user?.email}
                </span>{" "}
                and all associated data.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          {!hasActiveApplications && (
            <AlertDialogAction
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
