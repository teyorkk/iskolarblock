"use client";

import { XCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ScreeningApplication } from "@/types/components";

interface RejectConfirmationDialogProps {
  isOpen: boolean;
  application: ScreeningApplication | undefined;
  rejectionReason: string;
  onRejectionReasonChange: (value: string) => void;
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

export function RejectConfirmationDialog({
  isOpen,
  application,
  rejectionReason,
  onRejectionReasonChange,
  onConfirm,
  onCancel,
  isLoading = false,
}: RejectConfirmationDialogProps): React.JSX.Element {
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
            <XCircle className="w-5 h-5 text-orange-600" />
            Confirm Rejection
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2 text-gray-600">
            Are you sure you want to reject the application for{" "}
            <span className="font-semibold text-gray-900">
              {getApplicantName(application)}
            </span>
            ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="rejection-reason" className="text-sm font-medium">
            Rejection Reason <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="rejection-reason"
            placeholder="Enter the reason for rejection..."
            value={rejectionReason}
            onChange={(e) => onRejectionReasonChange(e.target.value)}
            className="mt-2 min-h-[100px]"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading || !rejectionReason.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? "Rejecting..." : "Confirm Rejection"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
