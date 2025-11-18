"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
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
import { FileSearch, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import {
  useScreeningApplications,
  type Application,
} from "@/hooks/use-screening-applications";
import { useScreeningFilters } from "@/hooks/use-screening-filters";
import { useApplicationStatusUpdate } from "@/hooks/use-application-status-update";
import { useApplicationPeriods } from "@/hooks/use-application-periods";
import { getStatusColor, formatDate } from "@/lib/utils/screening-utils";
import { ScreeningStatsCards } from "@/components/admin-screening/screening-stats-cards";
import { ScreeningTableActions } from "@/components/admin-screening/screening-table-actions";

interface ApplicationPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export default function ScreeningPage() {
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(
    new Set()
  );
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

  const { periods, latestPeriodId } = useApplicationPeriods();

  useEffect(() => {
    if (periods.length > 0 && !selectedPeriodId) {
      setSelectedPeriodId(periods[0].id);
    }
  }, [periods, selectedPeriodId]);

  const { applications, isLoading, refetch } =
    useScreeningApplications(selectedPeriodId);

  const filters = useScreeningFilters(applications);

  const { updateStatus } = useApplicationStatusUpdate(() => {
    void refetch();
  });

  const handleViewDetails = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: string
  ) => {
    await updateStatus(applicationId, newStatus);
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

  const visibleApplications = filters.paginatedApplications;

  const allVisibleSelected =
    visibleApplications.length > 0 &&
    visibleApplications.every((app) => selectedApplications.has(app.id));
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
                  value={filters.searchTerm}
                  onChange={(e) => filters.setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScreeningStatsCards stats={filters.stats} isLoading={isLoading} />

            {/* Status Filters */}
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-3 bg-white border rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filter by status:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.statusFilters.map((filter) => (
                    <Button
                      key={filter.value}
                      variant={
                        filters.statusFilter === filter.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className={
                        filters.statusFilter === filter.value
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : undefined
                      }
                      onClick={() => filters.setStatusFilter(filter.value)}
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
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={allVisibleSelected}
                              onCheckedChange={(checked) =>
                                handleSelectAll(
                                  checked === true,
                                  visibleApplications
                                )
                              }
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
                        {visibleApplications.map((application) => (
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
                              <ScreeningTableActions
                                applicationId={application.id}
                                status={application.status}
                                onViewDetails={handleViewDetails}
                                onStatusUpdate={handleStatusUpdate}
                                canEdit={selectedPeriodId === latestPeriodId}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {filters.filteredApplications.length > 0 && (
                  <Pagination
                    currentPage={filters.currentPage}
                    totalPages={filters.totalPages}
                    onPageChange={filters.setCurrentPage}
                    itemsPerPage={filters.itemsPerPage}
                    totalItems={filters.filteredApplications.length}
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
          void refetch();
        }}
      />
    </div>
  );
}
