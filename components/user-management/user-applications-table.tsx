"use client";

import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./status-badge";
import { formatDateTime } from "@/lib/utils/date-formatting";
import type { UserApplicationsTableProps } from "@/types/components";

export function UserApplicationsTable({
  applications,
  isLoading,
}: UserApplicationsTableProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading applications...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No applications found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto -mx-6 px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">Application ID</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[140px]">Submitted</TableHead>
              <TableHead className="min-w-[140px]">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium text-xs">
                  {app.id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  <StatusBadge status={app.status} />
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {formatDateTime(app.createdAt)}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {formatDateTime(app.updatedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 -mx-6 px-6">
        {applications.map((app) => (
          <div
            key={app.id}
            className="border rounded-lg p-4 bg-white hover:bg-gray-50"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Application ID</span>
                <StatusBadge status={app.status} />
              </div>
              <p className="font-medium text-sm break-all">
                {app.id.substring(0, 8)}...
              </p>
              <div className="pt-2 border-t space-y-2">
                <div>
                  <span className="text-xs text-gray-500 font-medium">Submitted:</span>
                  <p className="text-xs text-gray-900 mt-0.5">
                    {formatDateTime(app.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-medium">Last Updated:</span>
                  <p className="text-xs text-gray-900 mt-0.5">
                    {formatDateTime(app.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

