"use client";

import { Calendar, FileText, Users, Coins, Shield, Award } from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { StatsGrid } from "@/components/common/stats-grid";
import { LineChart } from "@/components/common/line-chart";
import { PieChart } from "@/components/common/pie-chart";
import { AdminDashboardHeader } from "@/components/admin-dashboard/admin-dashboard-header";
import { ApplicationPeriodBanner } from "@/components/admin-dashboard/application-period-banner";
import { RecentApplicants } from "@/components/admin-dashboard/recent-applicants";
import { QuickActions } from "@/components/admin-dashboard/quick-actions";
import { mockChartData, mockApplicants } from "@/lib/mock-data";
import { adminStatsCards, adminPieData } from "@/lib/constants/dashboard-stats";

export default function AdminDashboard() {
  const quickActions = [
    { label: "Review Applications", icon: Users, href: "/screening" },
    { label: "Manage Budget", icon: Coins, href: "/admin-settings" },
    { label: "Blockchain Records", icon: Shield, href: "/blockchain" },
    { label: "Award Scholarships", icon: Award, href: "/awarding" },
  ];

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
            />

            <ApplicationPeriodBanner />

            <StatsGrid stats={adminStatsCards} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LineChart
                  data={mockChartData}
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
                data={adminPieData}
                title={
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-red-500" />
                    Application Status
                  </div>
                }
                description="Current distribution of applications"
              />
            </div>

            <RecentApplicants applicants={mockApplicants} />

            <QuickActions actions={quickActions} />
          </div>
        </div>
      </div>
    </div>
  );
}
