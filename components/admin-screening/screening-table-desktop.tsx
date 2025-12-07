"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Eye, XCircle } from "lucide-react";
import type { ScreeningApplication } from "@/types/components";

interface ScreeningTableDesktopProps {
  applications: ScreeningApplication[];
  handleViewDetails: (id: string) => void;
  getStatusColor: (status: string) => string;
  getRemarksBadgeClass: (remarks?: string | null, status?: string) => string;
  formatDate: (date: string) => string;
  canApproveReject: (app: ScreeningApplication) => boolean;
  setConfirmApproveId: (id: string) => void;
  setConfirmRejectId: (id: string) => void;
  setRejectionReason: (reason: string) => void;
}

export function ScreeningTableDesktop({
  applications,
  handleViewDetails,
  getStatusColor,
  getRemarksBadgeClass,
  formatDate,
  canApproveReject,
  setConfirmApproveId,
  setConfirmRejectId,
  setRejectionReason,
}: ScreeningTableDesktopProps) {
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

        // Format as "LastName, FirstName M.I."
        if (lastName) {
          const parts: string[] = [lastName];
          if (firstName) {
            let namePart = firstName;
            // Add middle initial if middle name exists
            if (middleName && middleName.trim()) {
              const middleInitial = middleName.trim().charAt(0).toUpperCase();
              namePart += ` ${middleInitial}.`;
            }
            parts.push(namePart);
          }
          return parts.join(", ") || "N/A";
        }
        // Fallback if no lastname
        const nameParts = [firstName, middleName].filter(Boolean);
        if (nameParts.length > 0) {
          return nameParts.join(" ");
        }
      }
    }

    // Fallback to User.name if applicationDetails doesn't have name
    return application.User.name || "Unknown";
  };

  const getLevel = (application: ScreeningApplication): string => {
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
        const yearLevel =
          (personalInfo.yearLevel as string | undefined)?.toLowerCase() ?? "";
        if (
          yearLevel === "g11" ||
          yearLevel === "g12" ||
          yearLevel.includes("grade 11") ||
          yearLevel.includes("grade 12")
        ) {
          return "SHS";
        }
        if (
          yearLevel === "1" ||
          yearLevel === "2" ||
          yearLevel === "3" ||
          yearLevel === "4"
        ) {
          return "College";
        }
      }
    }
    return "—";
  };

  return (
    <Table className="min-w-full text-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden lg:table-cell">Level</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Remarks</TableHead>
          <TableHead className="hidden sm:table-cell">Submitted At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application) => (
          <TableRow key={application.id}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span title={getApplicantName(application)}>
                  {truncateName(getApplicantName(application))}
                </span>
                <span className="text-xs text-gray-500 xl:hidden">
                  {application.User.email}
                </span>
                <span className="md:hidden mt-1">
                  {application.status !== "GRANTED" && (
                    <span
                      className={getRemarksBadgeClass(
                        application.remarks,
                        application.status
                      )}
                    >
                      {application.remarks || "—"}
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-400 sm:hidden">
                  Submitted {formatDate(application.createdAt)}
                </span>
              </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <Badge variant="outline">{getLevel(application)}</Badge>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell max-w-xs">
              {application.status !== "GRANTED" && (
                <span
                  className={getRemarksBadgeClass(
                    application.remarks,
                    application.status
                  )}
                >
                  {application.remarks || "—"}
                </span>
              )}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {formatDate(application.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(application.id)}
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                {canApproveReject(application) && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => setConfirmApproveId(application.id)}
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setConfirmRejectId(application.id);
                        setRejectionReason("");
                      }}
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
