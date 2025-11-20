"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Award } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/common/pagination";
import { useAwardingApplications } from "@/hooks/use-awarding-applications";
import { useAwardingFilters } from "@/hooks/use-awarding-filters";
import { useAwardingStats } from "@/hooks/use-awarding-stats";
import { AwardingStatsCards } from "@/components/admin-awarding/awarding-stats-cards";
import { AwardingSearchFilters } from "@/components/admin-awarding/awarding-search-filters";
import { AwardingTableRow } from "@/components/admin-awarding/awarding-table-row";

export default function AwardingPage() {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const {
    applications,
    isLoading,
    periods,
    selectedPeriodId,
    setSelectedPeriodId,
    latestPeriodId,
  } = useAwardingApplications();

  const filters = useAwardingFilters({ applications });
  const stats = useAwardingStats(applications);

  const canModifyAwards =
    selectedPeriodId !== null && selectedPeriodId === latestPeriodId;

  const handleGrantScholarship = async (applicationId: string) => {
    setUpdatingId(applicationId);
    try {
      const response = await fetch(`/api/admin/awardings/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "GRANTED" }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to grant scholarship");
        return;
      }

      toast.success("Scholarship marked as granted");
      window.location.reload();
    } catch (error) {
      console.error("Failed to grant scholarship:", error);
      toast.error("An error occurred while updating status");
    } finally {
      setUpdatingId(null);
    }
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Scholarship Awarding
                </h1>
                <p className="text-gray-600">
                  Review approved scholars and release stipends per application
                  period
                </p>
              </div>
              {selectedPeriodId && (
                <Badge
                  variant="outline"
                  className="bg-white text-gray-700 border-gray-200 py-2 px-4"
                >
                  <Award className="w-4 h-4 mr-2 text-orange-500" />
                  {periods.find((p) => p.id === selectedPeriodId)?.title ??
                    "No period selected"}
                </Badge>
              )}
            </div>

            {/* Application Period Selector */}
            {periods.length > 0 && (
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="w-full sm:max-w-md">
                  <Label
                    htmlFor="period-select"
                    className="text-sm font-medium mb-1 inline-flex"
                  >
                    Application Period
                  </Label>
                  <Select
                    value={selectedPeriodId ?? undefined}
                    onValueChange={(value) => setSelectedPeriodId(value)}
                  >
                    <SelectTrigger id="period-select">
                      <SelectValue placeholder="Select application period" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.title}
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

            {/* Search & Filters */}
            <AwardingSearchFilters
              searchTerm={filters.searchTerm}
              onSearchChange={filters.setSearchTerm}
              statusFilters={filters.statusFilters}
              onToggleStatusFilter={filters.toggleStatusFilter}
              levelFilters={filters.levelFilters}
              onToggleLevelFilter={filters.toggleLevelFilter}
            />

            {/* Stats Cards */}
            <AwardingStatsCards
              totalApproved={stats.totalApproved}
              pending={stats.pending}
              granted={stats.granted}
              totalAmount={stats.totalAmount}
            />

            {/* Scholars Table */}
            <Card>
              <CardHeader>
                <CardTitle>Awarding Queue</CardTitle>
                <CardDescription>
                  All approved scholars within the selected application period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading scholars...</p>
                    </div>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    No approved scholars found for this period.
                  </div>
                ) : filters.paginatedApplications.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    No scholars match the selected filters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filters.paginatedApplications.map((application) => (
                          <AwardingTableRow
                            key={application.id}
                            application={application}
                            canModifyAwards={canModifyAwards}
                            updatingId={updatingId}
                            onGrant={handleGrantScholarship}
                          />
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
    </div>
  );
}
