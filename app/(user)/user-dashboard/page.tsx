"use client";

import { Calendar, FileText, History, Users } from "lucide-react";
import { UserSidebar } from "@/components/user-sidebar";
import { StatsGrid } from "@/components/common/stats-grid";
import { LineChart } from "@/components/common/line-chart";
import { UserDashboardHeader } from "@/components/user-dashboard/user-dashboard-header";
import { RecentApplications } from "@/components/user-dashboard/recent-applications";
import { UserQuickActions } from "@/components/user-dashboard/quick-actions";
import { mockChartData, mockApplications } from "@/lib/mock-data";
import { useSession } from "@/components/session-provider";
import { userStatsCards } from "@/lib/constants/dashboard-stats";

export default function UserDashboard() {
  const { user } = useSession();

  const quickActions = [
    { label: "New Application", icon: FileText, href: "/application" },
    { label: "View History", icon: History, href: "/history" },
    { label: "Update Profile", icon: Users, href: "/user-settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar />

      {/* Main Content */}
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <UserDashboardHeader user={user} />

          <StatsGrid stats={userStatsCards} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LineChart
                data={mockChartData}
                color="#f97316"
                title={
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                    Application Trends
                  </div>
                }
                description="Your scholarship application activity over time"
              />
            </div>

            <RecentApplications applications={mockApplications} />
          </div>

          <UserQuickActions actions={quickActions} />
        </div>
      </div>
    </div>
  );
}
