"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, FileText, Users, Coins, Shield, Award } from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { StatsGrid } from "@/components/common/stats-grid";
import { LineChart } from "@/components/common/line-chart";
import { PieChart } from "@/components/common/pie-chart";
import { AdminDashboardHeader } from "@/components/admin-dashboard/admin-dashboard-header";
import { ApplicationPeriodBanner } from "@/components/common/application-period-banner";
import { RecentApplicants } from "@/components/admin-dashboard/recent-applicants";
import { QuickActions } from "@/components/admin-dashboard/quick-actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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

interface Application {
  id: string;
  status: string;
  createdAt: string;
  userId: string;
  applicationPeriodId: string | null;
  applicationType: string;
  applicationDetails?: {
    personalInfo?: {
      firstName?: string;
      middleName?: string | null;
      lastName?: string;
    };
  } | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsCard[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [pieData, setPieData] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [periods, setPeriods] = useState<ApplicationPeriod[]>([]);

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
          // Set the first period as default if none selected
          if (periodsData.length > 0) {
            setSelectedPeriodId((prev) => prev || periodsData[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching periods:", error);
      }
    };

    void fetchPeriods();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const supabase = getSupabaseBrowserClient();

        // Fetch applications - filter by selected period if one is selected
        let applicationsQuery = supabase
          .from("Application")
          .select("*")
          .order("createdAt", { ascending: false });

        if (selectedPeriodId) {
          applicationsQuery = applicationsQuery.eq(
            "applicationPeriodId",
            selectedPeriodId
          );
        }

        const { data: applications, error: appsError } =
          await applicationsQuery;

        if (appsError) {
          console.error("Error fetching applications:", appsError);
        }

        // Store applications for PDF report
        setApplications(applications || []);

        // Fetch user data for applications
        const userIds =
          applications?.map((app) => app.userId).filter((id) => id) || [];
        let userMap = new Map();

        if (userIds.length > 0) {
          const { data: users, error: usersError } = await supabase
            .from("User")
            .select("id, name, email")
            .in("id", userIds);

          if (usersError) {
            console.error("Error fetching users:", usersError);
          } else if (users) {
            // Create a map for quick user lookup
            userMap = new Map(users.map((u) => [u.id, u]));
          }
        }

        // Fetch budget for selected period
        let totalBudget = 0;
        let remainingBudget = 0;

        if (selectedPeriodId) {
          const { data: currentPeriod } = await supabase
            .from("ApplicationPeriod")
            .select("budgetId")
            .eq("id", selectedPeriodId)
            .single();

          if (currentPeriod?.budgetId) {
            const { data: budget } = await supabase
              .from("Budget")
              .select("*")
              .eq("id", currentPeriod.budgetId)
              .single();

            if (budget) {
              totalBudget = budget.totalAmount;
              remainingBudget = budget.remainingAmount;
            }
          }
        }

        // Calculate statistics
        const totalApplicantsCount = applications?.length || 0;
        const pendingCount =
          applications?.filter((app) => app.status === "PENDING").length || 0;
        const approvedCount =
          applications?.filter((app) => app.status === "APPROVED").length || 0;
        const rejectedCount =
          applications?.filter((app) => app.status === "REJECTED").length || 0;
        const grantedCount =
          applications?.filter((app) => app.status === "GRANTED").length || 0;

        // Calculate this month's applicants
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthApps =
          applications?.filter((app) => new Date(app.createdAt) >= startOfMonth)
            .length || 0;

        // Calculate last month's applicants for trend
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const lastMonthApps =
          applications?.filter(
            (app) =>
              new Date(app.createdAt) >= lastMonth &&
              new Date(app.createdAt) <= lastMonthEnd
          ).length || 0;

        const monthTrend =
          lastMonthApps > 0
            ? (((thisMonthApps - lastMonthApps) / lastMonthApps) * 100).toFixed(
                1
              )
            : "0";
        const trendUp = thisMonthApps >= lastMonthApps;

        // Format budget values
        const formatCurrency = (amount: number) => {
          return `₱${amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        };

        // Set stats
        setStats([
          {
            title: "Total Applicants",
            value: totalApplicantsCount.toString(),
            description: "This month",
            icon: Users,
            color: "bg-blue-500",
            trend: `${trendUp ? "+" : ""}${monthTrend}%`,
            trendUp,
          },
          {
            title: "Total Budget",
            value: formatCurrency(totalBudget),
            description: "Allocated funds",
            icon: Coins,
            color: "bg-green-500",
            trend: totalBudget > 0 ? "Active" : "Not set",
            trendUp: true,
          },
          {
            title: "Remaining Budget",
            value: formatCurrency(remainingBudget),
            description: "Available funds",
            icon: Coins,
            color: "bg-orange-500",
            trend:
              totalBudget > 0
                ? `${((remainingBudget / totalBudget) * 100).toFixed(
                    1
                  )}% remaining`
                : "N/A",
            trendUp: remainingBudget > 0,
          },
          {
            title: "Granted Scholars",
            value: grantedCount.toString(),
            description: "Scholarships granted",
            icon: Award,
            color: "bg-purple-500",
            trend:
              grantedCount > 0 ? `${grantedCount} granted` : "None granted",
            trendUp: grantedCount > 0,
          },
        ]);

        // Set pie chart data
        setPieData([
          { name: "Approved", value: approvedCount, color: "#10b981" },
          { name: "Pending", value: pendingCount, color: "#f97316" },
          { name: "Rejected", value: rejectedCount, color: "#ef4444" },
          { name: "Granted", value: grantedCount, color: "#a855f7" }, // Purple color
        ]);

        // Generate week-by-week chart data from application period start to end date
        const chartDataPoints: ChartDataPoint[] = [];

        if (selectedPeriodId && periods.length > 0) {
          const currentPeriod = periods.find((p) => p.id === selectedPeriodId);
          if (currentPeriod) {
            const periodStart = new Date(currentPeriod.startDate);
            const periodEnd = new Date(currentPeriod.endDate);

            // Calculate weeks from start to end
            let weekStart = new Date(periodStart);
            let weekNumber = 1;

            while (weekStart <= periodEnd) {
              // Calculate week end (6 days after week start, or period end if earlier)
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekEnd.getDate() + 6);
              if (weekEnd > periodEnd) {
                weekEnd.setTime(periodEnd.getTime());
              }

              // Count applications in this week
              const weekApps =
                applications?.filter((app) => {
                  const appDate = new Date(app.createdAt);
                  return appDate >= weekStart && appDate <= weekEnd;
                }).length || 0;

              // Format week label (e.g., "Week 1", "Nov 1-7")
              const weekLabel = `Week ${weekNumber}`;

              chartDataPoints.push({
                month: weekLabel,
                applications: weekApps,
              });

              // Move to next week
              weekStart = new Date(weekEnd);
              weekStart.setDate(weekStart.getDate() + 1);
              weekNumber++;
            }
          }
        }

        // If no period selected or no data, show empty chart
        if (chartDataPoints.length === 0) {
          chartDataPoints.push({
            month: "No Data",
            applications: 0,
          });
        }

        setChartData(chartDataPoints);

        // Set recent applicants
        const recentApps: Applicant[] =
          applications?.slice(0, 10).map((app) => {
            const user = userMap.get(app.userId);
            // Use name if available, otherwise fall back to email, then "Unknown"
            const displayName = user?.name || user?.email || "Unknown";
            return {
              id: app.id,
              name: displayName,
              email: user?.email || "",
              type: app.applicationType === "NEW" ? "New" : "Renewal",
              status: app.status,
              submittedDate: new Date(app.createdAt).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              ),
            };
          }) || [];

        setApplicants(recentApps);
        setTotalApplicants(totalApplicantsCount);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedPeriodId) {
      void fetchDashboardData();
    } else if (periods.length === 0) {
      // Only fetch if we're still loading periods
      void fetchDashboardData();
    }
  }, [selectedPeriodId, periods]);

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

            {/* Application Period Selector */}
            {periods.length > 0 && (
              <div className="mb-6 flex items-center gap-4">
                <Label htmlFor="period-select" className="text-sm font-medium">
                  View Period:
                </Label>
                <Select
                  value={selectedPeriodId || undefined}
                  onValueChange={(value) => setSelectedPeriodId(value)}
                >
                  <SelectTrigger id="period-select" className="w-[300px]">
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
                        {new Date(period.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                        )
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
                total={totalApplicants}
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
