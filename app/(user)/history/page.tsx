"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { UserSidebar } from "@/components/user-sidebar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { mockApplications } from "@/lib/mock-data";
import { StatsCards } from "./components/StatsCards";
import { FilterTabs } from "./components/FilterTabs";
import { ApplicationsTable } from "./components/ApplicationsTable";

type Application = (typeof mockApplications)[number];

const statusColors = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-orange-100 text-orange-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function HistoryPage() {
  const [filter, setFilter] = useState<string>("all");

  const filteredApplications = useMemo(
    () =>
      mockApplications.filter(
        (app: Application) => filter === "all" || app.status === filter
      ),
    [filter]
  );

  const stats = useMemo(
    () => ({
      total: mockApplications.length,
      approved: mockApplications.filter((app) => app.status === "APPROVED")
        .length,
      pending: mockApplications.filter((app) => app.status === "PENDING")
        .length,
      rejected: mockApplications.filter((app) => app.status === "REJECTED")
        .length,
    }),
    []
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
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => (window.location.href = "/application")}>
                  New Application
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <StatsCards
              total={stats.total}
              approved={stats.approved}
              pending={stats.pending}
            />

            {/* Filter Tabs */}
            <FilterTabs
              filter={filter}
              onFilterChange={setFilter}
              counts={{
                all: stats.total,
                pending: stats.pending,
                approved: stats.approved,
                rejected: stats.rejected,
              }}
            />

            {/* Applications Table */}
            <ApplicationsTable
              applications={filteredApplications}
              statusColors={statusColors}
              onFilterClear={() => setFilter("all")}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
