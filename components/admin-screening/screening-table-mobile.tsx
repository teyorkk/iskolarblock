"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Eye, XCircle } from "lucide-react";
import { MobileCard } from "@/components/common/mobile-card";
import type { ScreeningApplication } from "@/types/components";

interface ScreeningTableMobileProps {
  applications: ScreeningApplication[];
  selectedApplications: Set<string>;
  handleSelectApplication: (id: string, checked: boolean) => void;
  handleViewDetails: (id: string) => void;
  getStatusColor: (status: string) => string;
  getRemarksBadgeClass: (remarks?: string | null) => string;
  formatDate: (date: string) => string;
  canApproveReject: (app: ScreeningApplication) => boolean;
  setConfirmApproveId: (id: string) => void;
  setConfirmRejectId: (id: string) => void;
  setRejectionReason: (reason: string) => void;
}

export function ScreeningTableMobile({
  applications,
  selectedApplications,
  handleSelectApplication,
  handleViewDetails,
  getStatusColor,
  getRemarksBadgeClass,
  formatDate,
  canApproveReject,
  setConfirmApproveId,
  setConfirmRejectId,
  setRejectionReason,
}: ScreeningTableMobileProps) {
  const truncateName = (name: string, maxLength: number = 30): string => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + "...";
  };

  const getApplicantName = (application: ScreeningApplication): string => {
    // Try to extract name from applicationDetails first
    if (application.applicationDetails) {
      const details = application.applicationDetails;
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

    // Fallback to User.name if applicationDetails doesn't have name
    return application.User.name || "Unknown";
  };

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <MobileCard key={application.id}>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Checkbox
                  checked={selectedApplications.has(application.id)}
                  onCheckedChange={(checked) =>
                    handleSelectApplication(application.id, checked as boolean)
                  }
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-sm truncate"
                    title={getApplicantName(application)}
                  >
                    {truncateName(getApplicantName(application))}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {application.User.email}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {application.applicationType}
              </Badge>
              <span className="text-xs text-gray-500">
                {formatDate(application.createdAt)}
              </span>
            </div>

            {application.remarks && (
              <div>
                <span className="text-xs text-gray-500 font-medium">
                  Remarks:
                </span>
                <div className="mt-1">
                  <span className={getRemarksBadgeClass(application.remarks)}>
                    {application.remarks}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewDetails(application.id)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              {canApproveReject(application) && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => setConfirmApproveId(application.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setConfirmRejectId(application.id);
                      setRejectionReason("");
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </MobileCard>
      ))}
    </div>
  );
}
