"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Users, Shield, Award } from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { StatsGrid } from "@/components/common/stats-grid";
import { AdminDashboardHeader } from "@/components/admin-dashboard/admin-dashboard-header";
import { ApplicationPeriodBanner } from "@/components/common/application-period-banner";
import { RecentApplicants } from "@/components/admin-dashboard/recent-applicants";
import { QuickActions } from "@/components/admin-dashboard/quick-actions";
import { PeriodSelector } from "@/components/admin-dashboard/period-selector";
import { DashboardCharts } from "@/components/admin-dashboard/dashboard-charts";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface ApplicationPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [periods, setPeriods] = useState<ApplicationPeriod[]>([]);
  const [timeFilter, setTimeFilter] = useState<
    "all" | "monthly" | "weekly" | "daily"
  >("daily");
  const [educationLevelFilter, setEducationLevelFilter] = useState<
    "all" | "college" | "shs"
  >("all");

  const {
    stats,
    applicants,
    applications,
    chartData,
    pieData,
    totalApplicants,
    isLoading,
  } = useDashboardData(
    selectedPeriodId,
    timeFilter,
    educationLevelFilter,
    periods
  );

  const quickActions = [
    {
      label: "Manage Users",
      icon: Users,
      onClick: () => router.push("/users"),
    },
    {
      label: "Review Applications",
      icon: FileText,
      onClick: () => router.push("/screening"),
    },
    {
      label: "Blockchain Records",
      icon: Shield,
      onClick: () => router.push("/blockchain"),
    },
    {
      label: "Award Scholarships",
      icon: Award,
      onClick: () => router.push("/awarding"),
    },
  ];

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: periodsData, error: periodsError } = await supabase
          .from("ApplicationPeriod")
          .select("id, title, startDate, endDate")
          .order("createdAt", { ascending: false });

        if (periodsError) {
          console.error("Error fetching periods:", periodsError);
        } else if (periodsData) {
          setPeriods(periodsData);

          // Find the currently active period (where today's date falls within the period)
          const now = new Date();
          const activePeriod = periodsData.find((period) => {
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);
            return now >= start && now <= end;
          });

          // Set default period: active period if exists, otherwise the most recent one
          if (periodsData.length > 0) {
            setSelectedPeriodId(activePeriod?.id || periodsData[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching periods:", error);
      }
    };

    void fetchPeriods();
  }, []);

  // Listen for refresh events from edit dialog
  useEffect(() => {
    const handleRefresh = () => {
      // Trigger refresh by updating a dependency
      setSelectedPeriodId((prev) => prev);
    };

    window.addEventListener("refreshDashboard", handleRefresh);
    return () => {
      window.removeEventListener("refreshDashboard", handleRefresh);
    };
  }, []);

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
                applications: applications,
              }}
            />

            <PeriodSelector
              periods={periods}
              selectedPeriodId={selectedPeriodId}
              onPeriodChange={setSelectedPeriodId}
            />

            <ApplicationPeriodBanner periodId={selectedPeriodId} />

            <StatsGrid stats={stats} />

            <DashboardCharts
              chartData={chartData}
              pieData={pieData}
              totalApplicants={totalApplicants}
              timeFilter={timeFilter}
              educationLevelFilter={educationLevelFilter}
              onTimeFilterChange={setTimeFilter}
              onEducationLevelFilterChange={setEducationLevelFilter}
            />

            <RecentApplicants applicants={applicants} />

            <QuickActions actions={quickActions} />
          </div>
        </div>
      </div>
    </div>
  );
}
