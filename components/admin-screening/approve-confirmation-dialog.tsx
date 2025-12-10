"use client";

import { CheckCircle } from "lucide-react";
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
import type { ScreeningApplication } from "@/types/components";

interface ApproveConfirmationDialogProps {
  isOpen: boolean;
  application: ScreeningApplication | undefined;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function getApplicantName(app: ScreeningApplication | undefined): string {
  if (!app) return "Unknown";

  if (app.applicationDetails) {
    const details = app.applicationDetails;
    let personalInfo: Record<string, unknown> | null = null;

    if (typeof details === "object" && details !== null) {
      if ("personalInfo" in details && details.personalInfo) {
        personalInfo = details.personalInfo as Record<string, unknown>;
      } else {
        personalInfo = details as Record<string, unknown>;
      }
    }

    if (personalInfo) {
      const firstName = personalInfo.firstName as string | undefined;
      const middleName = personalInfo.middleName as string | undefined;
      const lastName = personalInfo.lastName as string | undefined;
      const nameParts = [firstName, middleName, lastName].filter(Boolean);
      if (nameParts.length > 0) {
        return nameParts.join(" ");
      }
    }
  }

  return app.User?.name || "Unknown";
}

export function ApproveConfirmationDialog({
  isOpen,
  application,
  onConfirm,
  onCancel,
  isLoading = false,
}: ApproveConfirmationDialogProps): React.JSX.Element {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent
        className="border border-orange-100 bg-white data-[state=closed]:!translate-x-0 data-[state=closed]:!translate-y-0 data-[state=open]:!translate-x-0 data-[state=open]:!translate-y-0"
        style={{
          transform: "translate(-50%, -50%)",
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-gray-900">
            <CheckCircle className="w-5 h-5 text-orange-600" />
            Confirm Approval
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2 text-gray-600">
            Are you sure you want to approve the application for{" "}
            <span className="font-semibold text-gray-900">
              {getApplicantName(application)}
            </span>
            ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? "Approving..." : "Confirm Approval"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
