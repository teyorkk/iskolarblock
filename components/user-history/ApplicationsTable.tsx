import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  CloudUpload,
  Award,
} from "lucide-react";
import { ApplicationDetailsDialog } from "./ApplicationDetailsDialog";
import { ResponsiveTableWrapper } from "@/components/common/responsive-table-wrapper";
import { MobileCard } from "@/components/common/mobile-card";

interface Application {
  id: string;
  date: string;
  type: string;
  status: string;
  remarks: string;
}

interface ApplicationsTableProps {
  applications: Application[];
  statusColors: Record<string, string>;
  onFilterClear: () => void;
}

const statusIcons = {
  APPROVED: CheckCircle,
  GRANTED: Award,
  PENDING: Clock,
  REJECTED: XCircle,
};

const getRemarksBadgeClass = (remarks?: string | null) => {
  const base =
    "inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border";
  if (!remarks) {
    return `${base} bg-gray-50 text-gray-500 border-gray-200`;
  }
  const normalized = remarks.toLowerCase();
  if (normalized.includes("complete")) {
    return `${base} bg-green-50 text-green-700 border-green-100`;
  }
  if (normalized.includes("missing") || normalized.includes("no document")) {
    return `${base} bg-red-50 text-red-700 border-red-100`;
  }
  return `${base} bg-yellow-50 text-yellow-700 border-yellow-100`;
};

export function ApplicationsTable({
  applications,
  statusColors,
  onFilterClear,
}: ApplicationsTableProps) {
  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Applications</CardTitle>
        <CardDescription>
          View the status and details of all your scholarship applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveTableWrapper
          desktopView={
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border-b hover:bg-gray-50"
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {application.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-orange-500 text-orange-700 bg-orange-50"
                      >
                        {application.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          statusColors[
                            application.status as keyof typeof statusColors
                          ]
                        }
                      >
                        <div className="flex items-center">
                          {getStatusIcon(application.status)}
                          <span className="ml-1">{application.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={getRemarksBadgeClass(application.remarks)}
                      >
                        {application.remarks || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {application.status === "PENDING" && (
                          <Button variant="secondary" size="sm" asChild>
                            <Link
                              href={`/application/complete/${application.id}`}
                            >
                              <CloudUpload className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                        <ApplicationDetailsDialog application={application} />
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          }
          mobileView={
            <div className="space-y-4">
              {applications.map((application, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MobileCard>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium text-sm">
                            {application.date}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-orange-500 text-orange-700 bg-orange-50"
                        >
                          {application.type}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={
                            statusColors[
                              application.status as keyof typeof statusColors
                            ]
                          }
                        >
                          <div className="flex items-center">
                            {getStatusIcon(application.status)}
                            <span className="ml-1">{application.status}</span>
                          </div>
                        </Badge>
                      </div>

                      {application.remarks && (
                        <div>
                          <span className="text-xs text-gray-500 font-medium">
                            Remarks:
                          </span>
                          <div className="mt-1">
                            <span
                              className={getRemarksBadgeClass(
                                application.remarks
                              )}
                            >
                              {application.remarks}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t">
                        {application.status === "PENDING" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            asChild
                            className="flex-1"
                          >
                            <Link
                              href={`/application/complete/${application.id}`}
                            >
                              <CloudUpload className="w-4 h-4 mr-2" />
                              Upload
                            </Link>
                          </Button>
                        )}
                        <div
                          className={
                            application.status === "PENDING"
                              ? "flex-1"
                              : "w-full"
                          }
                        >
                          <ApplicationDetailsDialog application={application} />
                        </div>
                      </div>
                    </div>
                  </MobileCard>
                </motion.div>
              ))}
            </div>
          }
        />

        {applications.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No applications found</p>
            <Button variant="outline" className="mt-4" onClick={onFilterClear}>
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
