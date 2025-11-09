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
    <div className="overflow-x-auto -mx-6 px-6">
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
  );
}

