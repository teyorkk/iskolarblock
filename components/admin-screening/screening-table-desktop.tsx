"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Eye, XCircle } from "lucide-react";
import type { ScreeningApplication } from "@/types/components";

interface ScreeningTableDesktopProps {
  applications: ScreeningApplication[];
  selectedApplications: Set<string>;
  allVisibleSelected: boolean;
  handleSelectAll: (checked: boolean, apps: ScreeningApplication[]) => void;
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

export function ScreeningTableDesktop({
  applications,
  selectedApplications,
  allVisibleSelected,
  handleSelectAll,
  handleSelectApplication,
  handleViewDetails,
  getStatusColor,
  getRemarksBadgeClass,
  formatDate,
  canApproveReject,
  setConfirmApproveId,
  setConfirmRejectId,
  setRejectionReason,
}: ScreeningTableDesktopProps) {
  return (
    <Table className="min-w-full text-sm">
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allVisibleSelected}
              onCheckedChange={(checked) =>
                handleSelectAll(checked === true, applications)
              }
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="hidden lg:table-cell">Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Remarks</TableHead>
          <TableHead className="hidden sm:table-cell">Submitted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application) => (
          <TableRow key={application.id}>
            <TableCell>
              <Checkbox
                checked={selectedApplications.has(application.id)}
                onCheckedChange={(checked) =>
                  handleSelectApplication(application.id, checked as boolean)
                }
              />
            </TableCell>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span>{application.User.name}</span>
                <span className="text-xs text-gray-500 xl:hidden">
                  {application.User.email}
                </span>
                <span className="md:hidden mt-1">
                  <span className={getRemarksBadgeClass(application.remarks)}>
                    {application.remarks || "—"}
                  </span>
                </span>
                <span className="text-xs text-gray-400 sm:hidden">
                  Submitted {formatDate(application.createdAt)}
                </span>
              </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <Badge variant="outline">{application.applicationType}</Badge>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell max-w-xs">
              <span className={getRemarksBadgeClass(application.remarks)}>
                {application.remarks || "—"}
              </span>
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

