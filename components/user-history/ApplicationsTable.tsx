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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell className="font-medium">
                    SCH-{String(application.id).padStart(6, "0")}
                  </TableCell>
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
                      <ApplicationDetailsDialog
                        application={application}
                        statusColors={statusColors}
                      />
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>

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
