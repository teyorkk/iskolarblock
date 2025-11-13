"use client";

import { motion } from "framer-motion";
import { AdminSidebar } from "@/components/admin-sidebar";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileSearch,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ApplicationDetailsDialog } from "@/components/admin/application-details-dialog";

interface Application {
  id: string;
  userId: string;
  status: string;
  applicationType: string;
  createdAt: string;
  User: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ScreeningPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    void fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/applications");
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to fetch applications");
        return;
      }

      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("An error occurred while fetching applications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update application status");
        return;
      }

      toast.success(`Application ${newStatus.toLowerCase()} successfully`);
      void fetchApplications();
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("An error occurred while updating application status");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(new Set(applications.map((app) => app.id)));
    } else {
      setSelectedApplications(new Set());
    }
  };

  const handleSelectApplication = (applicationId: string, checked: boolean) => {
    const newSelected = new Set(selectedApplications);
    if (checked) {
      newSelected.add(applicationId);
    } else {
      newSelected.delete(applicationId);
    }
    setSelectedApplications(newSelected);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "PENDING").length,
    approved: applications.filter((app) => app.status === "APPROVED").length,
    rejected: applications.filter((app) => app.status === "REJECTED").length,
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      {/* Main Content */}
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Application Screening
                </h1>
                <p className="text-gray-600">
                  Review and process scholarship applications
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Total Applicants
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.total}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {stats.pending}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Approved</p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.approved}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">
                          {stats.rejected}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Applicants Table */}
            <Card>
              <CardHeader>
                <CardTitle>Applicant List</CardTitle>
                <CardDescription>
                  Review and manage scholarship applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading applications...</p>
                    </div>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No applications found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                applications.length > 0 &&
                                selectedApplications.size ===
                                  applications.length
                              }
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((application) => (
                          <TableRow key={application.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedApplications.has(
                                  application.id
                                )}
                                onCheckedChange={(checked) =>
                                  handleSelectApplication(
                                    application.id,
                                    checked as boolean
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {application.User.name}
                            </TableCell>
                            <TableCell>{application.User.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {application.applicationType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusColor(application.status)}
                              >
                                {application.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDate(application.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleViewDetails(application.id)
                                  }
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {application.status === "PENDING" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          application.id,
                                          "APPROVED"
                                        )
                                      }
                                      title="Approve"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          application.id,
                                          "REJECTED"
                                        )
                                      }
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
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Application Details Dialog */}
      <ApplicationDetailsDialog
        applicationId={selectedApplicationId}
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedApplicationId(null);
        }}
        onStatusUpdate={() => {
          void fetchApplications();
        }}
      />
    </div>
  );
}
