"use client";

import { Calendar, FileText, Users, Coins, Shield, Award } from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { StatsGrid } from "@/components/common/stats-grid";
import { LineChart } from "@/components/common/line-chart";
import { PieChart } from "@/components/common/pie-chart";
import { AdminDashboardHeader } from "@/components/admin-dashboard/admin-dashboard-header";
import { ApplicationPeriodBanner } from "@/components/common/application-period-banner";
import { RecentApplicants } from "@/components/admin-dashboard/recent-applicants";
import { QuickActions } from "@/components/admin-dashboard/quick-actions";
import { useApplicationPeriodsSelector } from "@/hooks/use-application-periods-selector";
import { useAdminDashboardData } from "@/hooks/use-admin-dashboard-data";
import { PeriodSelector } from "@/components/admin-dashboard/period-selector";
import type { StatsCard } from "@/types";

interface Applicant {
  id: string;
  name: string;
  email: string;
  type: string;
  status: string;
  submittedDate: string;
}

interface ChartDataPoint {
  month: string;
  applications: number;
}

interface ApplicationPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export default function AdminDashboard() {
  const quickActions = [
    { label: "Review Applications", icon: Users, href: "/screening" },
    { label: "Manage Budget", icon: Coins, href: "/admin-settings" },
    { label: "Blockchain Records", icon: Shield, href: "/blockchain" },
    { label: "Award Scholarships", icon: Award, href: "/awarding" },
  ];

  const { periods, selectedPeriodId, setSelectedPeriodId } =
    useApplicationPeriodsSelector();

  const { stats, applicants, chartData, pieData, isLoading } =
    useAdminDashboardData({
      selectedPeriodId,
      periods,
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
          <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      {/* Main Content */}
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <AdminDashboardHeader
              title="Admin Dashboard"
              description="Manage scholarship applications, budget allocation, and blockchain records for Barangay San Miguel."
              reportData={{
                stats,
                pieData,
                period: periods.find((p) => p.id === selectedPeriodId) || null,
              }}
            />

            <PeriodSelector
              periods={periods}
              selectedPeriodId={selectedPeriodId}
              onPeriodChange={setSelectedPeriodId}
            />

            <ApplicationPeriodBanner periodId={selectedPeriodId} />

            <StatsGrid stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LineChart
                  data={chartData}
                  color="#dc2626"
                  title={
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-red-500" />
                      Application Trends
                    </div>
                  }
                  description="Monthly scholarship application statistics"
                />
              </div>

              <PieChart
                data={pieData}
                title={
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-red-500" />
                    Application Status
                  </div>
                }
                description="Current distribution of applications"
              />
            </div>

            <RecentApplicants applicants={applicants} />

            <QuickActions actions={quickActions} />
          </div>
        </div>
      </div>
    </div>
  );
}
