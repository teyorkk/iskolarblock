"use client";

import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { UserSidebar } from "@/components/user-sidebar";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2, AlertCircle } from "lucide-react";
import { StatsCards } from "../../../components/user-history/StatsCards";
import { FilterTabs } from "../../../components/user-history/FilterTabs";
import { ApplicationsTable } from "../../../components/user-history/ApplicationsTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Application {
  id: string;
  date: string;
  type: string;
  status: string;
  remarks: string;
  details?: Record<string, unknown>;
  id_image?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  APPROVED: "bg-green-100 text-green-700",
  GRANTED: "bg-purple-100 text-purple-700",
  PENDING: "bg-orange-100 text-orange-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function HistoryPage() {
  const [filter, setFilter] = useState<string>("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/applications/user");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = useMemo(
    () =>
      applications.filter(
        (app: Application) => filter === "all" || app.status === filter
      ),
    [applications, filter]
  );

  const stats = useMemo(
    () => ({
      total: applications.length,
      approved: applications.filter((app) => app.status === "APPROVED").length,
      granted: applications.filter((app) => app.status === "GRANTED").length,
      pending: applications.filter((app) => app.status === "PENDING").length,
      rejected: applications.filter((app) => app.status === "REJECTED").length,
    }),
    [applications]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar />

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
                  Application History
                </h1>
                <p className="text-gray-600">
                  Track and manage your scholarship applications
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchApplications}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCcw className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </Button>
                <Button onClick={() => (window.location.href = "/application")}>
                  New Application
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span className="ml-3 text-gray-600">
                  Loading applications...
                </span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchApplications}
                    className="ml-4"
                  >
                    Try Again
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Empty State */}
            {!loading && !error && applications.length === 0 && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Applications Yet</AlertTitle>
                <AlertDescription>
                  You haven&apos;t submitted any scholarship applications yet.
                  Click &quot;New Application&quot; to get started.
                </AlertDescription>
              </Alert>
            )}

            {/* Stats Cards */}
            {!loading && !error && applications.length > 0 && (
              <>
                <StatsCards
                  total={stats.total}
                  approved={stats.approved}
                  pending={stats.pending}
                  granted={stats.granted}
                />

                {/* Filter Tabs */}
                <FilterTabs
                  filter={filter}
                  onFilterChange={setFilter}
                  counts={{
                    all: stats.total,
                    pending: stats.pending,
                    approved: stats.approved,
                    granted: stats.granted,
                    rejected: stats.rejected,
                  }}
                />

                {/* Applications Table */}
                <ApplicationsTable
                  applications={filteredApplications}
                  statusColors={statusColors}
                  onFilterClear={() => setFilter("all")}
                />
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
