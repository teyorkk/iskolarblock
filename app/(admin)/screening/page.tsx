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
  Users,
  CheckCircle,
  XCircle,
  Clock,
  FileSearch,
  Filter,
  Search,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ApplicationDetailsDialog } from "@/components/admin-screening/application-details-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/common/pagination";
import { ResponsiveTableWrapper } from "@/components/common/responsive-table-wrapper";
import { ScreeningTableDesktop } from "@/components/admin-screening/screening-table-desktop";
import { ScreeningTableMobile } from "@/components/admin-screening/screening-table-mobile";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
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
import type { ScreeningApplication } from "@/types/components";

type Application = ScreeningApplication;

interface ApplicationPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
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
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [periods, setPeriods] = useState<ApplicationPeriod[]>([]);
  const [latestPeriodId, setLatestPeriodId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | Application["status"]
  >("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: periodsData, error: periodsError } = await supabase
          .from("ApplicationPeriod")
          .select("id, title, startDate, endDate, createdAt")
          .order("createdAt", { ascending: false });

        if (periodsError) {
          console.error("Error fetching periods:", periodsError);
        } else if (periodsData) {
          setPeriods(periodsData);

          if (periodsData.length > 0) {
            setLatestPeriodId(periodsData[0].id);

            // Find the currently active period (where today's date falls within the period)
            const now = new Date();
            const activePeriod = periodsData.find((period) => {
              const start = new Date(period.startDate);
              const end = new Date(period.endDate);
              return now >= start && now <= end;
            });

            // Set default period: active period if exists, otherwise the most recent one
            setSelectedPeriodId(activePeriod?.id || periodsData[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching periods:", error);
      }
    };

    void fetchPeriods();
  }, []);

  useEffect(() => {
    void fetchApplications();
  }, [selectedPeriodId]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const url = selectedPeriodId
        ? `/api/admin/applications?periodId=${selectedPeriodId}`
        : "/api/admin/applications";
      const response = await fetch(url);
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
    newStatus: string,
    remarks?: string
  ) => {
    try {
      const body: { status: string; remarks?: string | null } = {
        status: newStatus,
      };

      // If approved, set remarks to "Cleared"
      if (newStatus === "APPROVED") {
        body.remarks = "Cleared";
      }
      // If rejected and remarks provided, use them
      else if (newStatus === "REJECTED" && remarks !== undefined) {
        body.remarks = remarks;
      }
      // If granted, don't update remarks (don't include in body)
      else if (newStatus === "GRANTED") {
        // Don't include remarks in body
      }
      // For other statuses, include remarks if provided
      else if (remarks !== undefined) {
        body.remarks = remarks;
      }

      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update application status");
        return;
      }

      toast.success(`Application ${newStatus.toLowerCase()} successfully`);
      setConfirmApproveId(null);
      setConfirmRejectId(null);
      setRejectionReason("");
      void fetchApplications();
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("An error occurred while updating application status");
    }
  };

  const handleSelectAll = (checked: boolean, targetApps: Application[]) => {
    if (checked) {
      const newSelected = new Set(selectedApplications);
      targetApps.forEach((app) => newSelected.add(app.id));
      setSelectedApplications(newSelected);
    } else {
      const newSelected = new Set(selectedApplications);
      targetApps.forEach((app) => newSelected.delete(app.id));
      setSelectedApplications(newSelected);
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
      case "GRANTED":
        return "bg-purple-100 text-purple-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
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

  const getRemarksBadgeClass = (remarks?: string | null, status?: string) => {
    const base =
      "inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border";

    // If approved, show green
    if (status === "APPROVED") {
      return `${base} bg-green-50 text-green-700 border-green-100`;
    }

    // If rejected and has remarks, show red
    if (status === "REJECTED" && remarks) {
      return `${base} bg-red-50 text-red-700 border-red-100`;
    }

    // If granted, don't show remarks badge
    if (status === "GRANTED") {
      return ""; // Return empty string to hide badge
    }

    // Default behavior for other statuses
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

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((app) => app.status === "PENDING").length,
      approved: applications.filter((app) => app.status === "APPROVED").length,
      granted: applications.filter((app) => app.status === "GRANTED").length,
      rejected: applications.filter((app) => app.status === "REJECTED").length,
    };
  }, [applications]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus =
        statusFilter === "ALL" || app.status === statusFilter;
      if (!matchesStatus) return false;

      if (!debouncedSearchTerm) return true;

      const term = debouncedSearchTerm;
      return (
        app.User.name.toLowerCase().includes(term) ||
        app.User.email.toLowerCase().includes(term) ||
        app.applicationType.toLowerCase().includes(term)
      );
    });
  }, [applications, statusFilter, debouncedSearchTerm]);

  const statusFilters = [
    { label: "All", value: "ALL" as const, count: stats.total },
    { label: "Pending", value: "PENDING" as const, count: stats.pending },
    { label: "Approved", value: "APPROVED" as const, count: stats.approved },
    { label: "Granted", value: "GRANTED" as const, count: stats.granted },
    { label: "Rejected", value: "REJECTED" as const, count: stats.rejected },
  ];

  // Pagination logic
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredApplications.slice(startIndex, endIndex);
  }, [filteredApplications, currentPage, itemsPerPage]);

  const visibleApplications = paginatedApplications;

  const allVisibleSelected =
    visibleApplications.length > 0 &&
    visibleApplications.every((app) => selectedApplications.has(app.id));

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearchTerm]);
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

            {/* Application Period Selector */}
            {periods.length > 0 && (
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:max-w-md">
                  <Label
                    htmlFor="period-select"
                    className="text-sm font-medium mb-1 inline-flex"
                  >
                    View Period
                  </Label>
                  <Select
                    value={selectedPeriodId || undefined}
                    onValueChange={(value) => setSelectedPeriodId(value)}
                  >
                    <SelectTrigger id="period-select" className="w-full">
                      <SelectValue placeholder="Select application period" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.title} (
                          {new Date(period.startDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )}{" "}
                          -{" "}
                          {new Date(period.endDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedPeriodId && selectedPeriodId !== latestPeriodId && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200 w-full sm:w-auto text-center py-2"
                  >
                    View Only · Past Period
                  </Badge>
                )}
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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

            {/* Status Filters */}
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-3 bg-white border rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filter by status:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map((filter) => (
                    <Button
                      key={filter.value}
                      variant={
                        statusFilter === filter.value ? "default" : "outline"
                      }
                      size="sm"
                      className={
                        statusFilter === filter.value
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : undefined
                      }
                      onClick={() => setStatusFilter(filter.value)}
                    >
                      {filter.label} ({filter.count})
                    </Button>
                  ))}
                </div>
              </div>
            </div>

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
                ) : visibleApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No applications match the selected filters
                    </p>
                  </div>
                ) : (
                  <ResponsiveTableWrapper
                    desktopView={
                      <ScreeningTableDesktop
                        applications={visibleApplications}
                        selectedApplications={selectedApplications}
                        allVisibleSelected={allVisibleSelected}
                        handleSelectAll={handleSelectAll}
                        handleSelectApplication={handleSelectApplication}
                        handleViewDetails={handleViewDetails}
                        getStatusColor={getStatusColor}
                        getRemarksBadgeClass={getRemarksBadgeClass}
                        formatDate={formatDate}
                        canApproveReject={(app) =>
                          app.status === "PENDING" &&
                          selectedPeriodId === latestPeriodId
                        }
                        setConfirmApproveId={setConfirmApproveId}
                        setConfirmRejectId={setConfirmRejectId}
                        setRejectionReason={setRejectionReason}
                      />
                    }
                    mobileView={
                      <ScreeningTableMobile
                        applications={visibleApplications}
                        selectedApplications={selectedApplications}
                        handleSelectApplication={handleSelectApplication}
                        handleViewDetails={handleViewDetails}
                        getStatusColor={getStatusColor}
                        getRemarksBadgeClass={getRemarksBadgeClass}
                        formatDate={formatDate}
                        canApproveReject={(app) =>
                          app.status === "PENDING" &&
                          selectedPeriodId === latestPeriodId
                        }
                        setConfirmApproveId={setConfirmApproveId}
                        setConfirmRejectId={setConfirmRejectId}
                        setRejectionReason={setRejectionReason}
                      />
                    }
                  />
                )}
                {filteredApplications.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredApplications.length}
                  />
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

      {/* Approve Confirmation Dialog */}
      {confirmApproveId &&
        (() => {
          const application = applications.find(
            (app) => app.id === confirmApproveId
          );
          const getApplicantName = (app: typeof application): string => {
            if (!app) return "Unknown";

            // Try to extract name from applicationDetails first
            if (app.applicationDetails) {
              const details = app.applicationDetails;
              let personalInfo: Record<string, unknown> | null = null;

              if (typeof details === "object" && details !== null) {
                if ("personalInfo" in details && details.personalInfo) {
                  personalInfo = details.personalInfo as Record<
                    string,
                    unknown
                  >;
                } else {
                  personalInfo = details as Record<string, unknown>;
                }
              }

              if (personalInfo) {
                const firstName = personalInfo.firstName as string | undefined;
                const middleName = personalInfo.middleName as
                  | string
                  | undefined;
                const lastName = personalInfo.lastName as string | undefined;
                const nameParts = [firstName, middleName, lastName].filter(
                  Boolean
                );
                if (nameParts.length > 0) {
                  return nameParts.join(" ");
                }
              }
            }

            // Fallback to User.name
            return app.User?.name || "Unknown";
          };

          return (
            <AlertDialog
              open={confirmApproveId !== null}
              onOpenChange={(open) => {
                if (!open) {
                  setConfirmApproveId(null);
                }
              }}
            >
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
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      handleStatusUpdate(confirmApproveId, "APPROVED")
                    }
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Confirm Approval
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        })()}

      {/* Reject Confirmation Dialog */}
      {confirmRejectId &&
        (() => {
          const application = applications.find(
            (app) => app.id === confirmRejectId
          );
          const getApplicantName = (app: typeof application): string => {
            if (!app) return "Unknown";

            // Try to extract name from applicationDetails first
            if (app.applicationDetails) {
              const details = app.applicationDetails;
              let personalInfo: Record<string, unknown> | null = null;

              if (typeof details === "object" && details !== null) {
                if ("personalInfo" in details && details.personalInfo) {
                  personalInfo = details.personalInfo as Record<
                    string,
                    unknown
                  >;
                } else {
                  personalInfo = details as Record<string, unknown>;
                }
              }

              if (personalInfo) {
                const firstName = personalInfo.firstName as string | undefined;
                const middleName = personalInfo.middleName as
                  | string
                  | undefined;
                const lastName = personalInfo.lastName as string | undefined;
                const nameParts = [firstName, middleName, lastName].filter(
                  Boolean
                );
                if (nameParts.length > 0) {
                  return nameParts.join(" ");
                }
              }
            }

            // Fallback to User.name
            return app.User?.name || "Unknown";
          };

          return (
            <AlertDialog
              open={confirmRejectId !== null}
              onOpenChange={(open) => {
                if (!open) {
                  setConfirmRejectId(null);
                  setRejectionReason("");
                }
              }}
            >
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
                  <Label
                    htmlFor="rejection-reason"
                    className="text-sm font-medium text-gray-700"
                  >
                    Reason for Rejection (Required)
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Enter the reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-2 min-h-[100px]"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (!rejectionReason.trim()) {
                        toast.error("Please provide a reason for rejection");
                        return;
                      }
                      handleStatusUpdate(
                        confirmRejectId,
                        "REJECTED",
                        rejectionReason.trim()
                      );
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={!rejectionReason.trim()}
                  >
                    Confirm Rejection
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        })()}
    </div>
  );
}
