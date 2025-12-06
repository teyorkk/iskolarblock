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
  profilePicture?: string | null;
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
      yearLevel?: string;
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
  const [timeFilter, setTimeFilter] = useState<
    "all" | "monthly" | "weekly" | "daily"
  >("daily");
  const [educationLevelFilter, setEducationLevelFilter] = useState<
    "all" | "college" | "shs"
  >("all");

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

  const fetchDashboardData = async () => {
    try {
      const supabase = getSupabaseBrowserClient();

      // Fetch applications - for "all" and "monthly" filters, get all applications
      // For "weekly" and "daily", filter by selected period
      let applicationsQuery = supabase
        .from("Application")
        .select("*")
        .order("createdAt", { ascending: false });

      // Only filter by period for weekly and daily views
      if (
        selectedPeriodId &&
        (timeFilter === "weekly" || timeFilter === "daily")
      ) {
        applicationsQuery = applicationsQuery.eq(
          "applicationPeriodId",
          selectedPeriodId
        );
      }

      const { data: applications, error: appsError } = await applicationsQuery;

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
          .select("id, name, email, profilePicture")
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

      // Calculate statistics (using all applications)
      const totalApplicantsCount = applications?.length || 0;
      const pendingCount =
        applications?.filter((app) => app.status === "PENDING").length || 0;
      const approvedCount =
        applications?.filter((app) => app.status === "APPROVED").length || 0;
      const rejectedCount =
        applications?.filter((app) => app.status === "REJECTED").length || 0;
      const grantedCount =
        applications?.filter((app) => app.status === "GRANTED").length || 0;

      // Filter applications by application period and education level for pie chart only
      let filteredApplications = applications || [];

      // First, filter by application period if a period is selected
      if (selectedPeriodId) {
        filteredApplications = filteredApplications.filter(
          (app) => app.applicationPeriodId === selectedPeriodId
        );
      }

      // Then, filter by education level if not "all"
      if (educationLevelFilter !== "all") {
        filteredApplications = filteredApplications.filter((app) => {
          const yearLevel =
            app.applicationDetails?.personalInfo?.yearLevel || "";
          if (educationLevelFilter === "college") {
            return ["1", "2", "3", "4"].includes(yearLevel);
          } else if (educationLevelFilter === "shs") {
            return ["G11", "G12"].includes(yearLevel);
          }
          return true;
        });
      }

      // Calculate pie chart statistics (using filtered applications)
      const filteredPendingCount =
        filteredApplications.filter((app) => app.status === "PENDING").length ||
        0;
      const filteredApprovedCount =
        filteredApplications.filter((app) => app.status === "APPROVED")
          .length || 0;
      const filteredRejectedCount =
        filteredApplications.filter((app) => app.status === "REJECTED")
          .length || 0;
      const filteredGrantedCount =
        filteredApplications.filter((app) => app.status === "GRANTED").length ||
        0;
      const filteredTotalApplicants = filteredApplications.length || 0;

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
          ? (((thisMonthApps - lastMonthApps) / lastMonthApps) * 100).toFixed(1)
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
          trend: grantedCount > 0 ? `${grantedCount} granted` : "None granted",
          trendUp: grantedCount > 0,
        },
      ]);

      // Set pie chart data (using filtered applications)
      setPieData([
        { name: "Approved", value: filteredApprovedCount, color: "#10b981" },
        { name: "Pending", value: filteredPendingCount, color: "#f97316" },
        { name: "Rejected", value: filteredRejectedCount, color: "#ef4444" },
        { name: "Granted", value: filteredGrantedCount, color: "#a855f7" }, // Purple color
      ]);
      setTotalApplicants(filteredTotalApplicants);

      // Generate chart data based on selected time filter
      const chartDataPoints: ChartDataPoint[] = [];

      if (applications && applications.length > 0) {
        if (timeFilter === "all") {
          // Group by month for all time
          const monthMap = new Map<string, number>();
          applications.forEach((app) => {
            const date = new Date(app.createdAt);
            const monthKey = date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
            monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
          });

          const sortedData = Array.from(monthMap.entries())
            .map(([month, count]) => ({ month, applications: count }))
            .sort((a, b) => {
              const dateA = new Date(a.month);
              const dateB = new Date(b.month);
              return dateA.getTime() - dateB.getTime();
            });

          chartDataPoints.push(...sortedData);
        } else if (timeFilter === "monthly") {
          // Group by month
          const monthMap = new Map<string, number>();
          applications.forEach((app) => {
            const date = new Date(app.createdAt);
            const monthKey = date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
            monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
          });

          const sortedData = Array.from(monthMap.entries())
            .map(([month, count]) => ({ month, applications: count }))
            .sort((a, b) => {
              const dateA = new Date(a.month);
              const dateB = new Date(b.month);
              return dateA.getTime() - dateB.getTime();
            });

          chartDataPoints.push(...sortedData);
        } else if (timeFilter === "weekly") {
          // Group by week - only for current period
          if (selectedPeriodId && periods.length > 0) {
            const currentPeriod = periods.find(
              (p) => p.id === selectedPeriodId
            );
            if (currentPeriod) {
              const periodStart = new Date(currentPeriod.startDate);
              const periodEnd = new Date(currentPeriod.endDate);

              let weekStart = new Date(periodStart);
              let weekNumber = 1;

              while (weekStart <= periodEnd) {
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                if (weekEnd > periodEnd) {
                  weekEnd.setTime(periodEnd.getTime());
                }

                const weekApps =
                  applications?.filter((app) => {
                    const appDate = new Date(app.createdAt);
                    return appDate >= weekStart && appDate <= weekEnd;
                  }).length || 0;

                const weekLabel = `Week ${weekNumber}`;

                chartDataPoints.push({
                  month: weekLabel,
                  applications: weekApps,
                });

                weekStart = new Date(weekEnd);
                weekStart.setDate(weekStart.getDate() + 1);
                weekNumber++;
              }
            }
          } else {
            // If no period selected, show empty
            chartDataPoints.push({
              month: "No Period Selected",
              applications: 0,
            });
          }
        } else if (timeFilter === "daily") {
          // Group by day - only show dates where applications were made within the cycle
          if (selectedPeriodId && periods.length > 0) {
            const currentPeriod = periods.find(
              (p) => p.id === selectedPeriodId
            );
            if (currentPeriod) {
              const periodStart = new Date(currentPeriod.startDate);
              const periodEnd = new Date(currentPeriod.endDate);
              periodStart.setHours(0, 0, 0, 0);
              periodEnd.setHours(23, 59, 59, 999);

              // Only create entries for days that have applications
              const dayMap = new Map<string, number>();

              // Count applications for each day within the period
              applications.forEach((app) => {
                const date = new Date(app.createdAt);
                date.setHours(0, 0, 0, 0);

                // Only count if within the period
                if (date >= periodStart && date <= periodEnd) {
                  const dayKey = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1);
                }
              });

              // Only include days that have applications
              const sortedData = Array.from(dayMap.entries())
                .map(([day, count]) => ({ month: day, applications: count }))
                .sort((a, b) => {
                  const dateA = new Date(a.month);
                  const dateB = new Date(b.month);
                  return dateA.getTime() - dateB.getTime();
                });

              chartDataPoints.push(...sortedData);
            }
          } else {
            // If no period selected, show empty
            chartDataPoints.push({
              month: "No Period Selected",
              applications: 0,
            });
          }
        }
      }

      // If no data, show empty chart
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
            submittedDate: new Date(app.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            profilePicture: user?.profilePicture || null,
          };
        }) || [];

      setApplicants(recentApps);
      // Note: totalApplicants for pie chart is set separately below
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPeriodId) {
      void fetchDashboardData();
    } else if (periods.length === 0) {
      // Only fetch if we're still loading periods
      void fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriodId, timeFilter, educationLevelFilter]);

  // Listen for refresh events from edit dialog
  useEffect(() => {
    const handleRefresh = () => {
      void fetchDashboardData();
    };

    window.addEventListener("refreshDashboard", handleRefresh);
    return () => {
      window.removeEventListener("refreshDashboard", handleRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriodId]);

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
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <Label htmlFor="period-select" className="text-sm font-medium">
                  View Application Cycle:
                </Label>
                <Select
                  value={selectedPeriodId || undefined}
                  onValueChange={(value) => setSelectedPeriodId(value)}
                >
                  <SelectTrigger
                    id="period-select"
                    className="w-full sm:w-[300px]"
                  >
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
                <div className="relative">
                  <div className="absolute top-4 right-4 z-10">
                    <Select
                      value={timeFilter}
                      onValueChange={(value) =>
                        setTimeFilter(
                          value as "all" | "monthly" | "weekly" | "daily"
                        )
                      }
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="daily">By Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <LineChart
                    data={chartData}
                    color="#dc2626"
                    title={
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-red-500" />
                        Application Trends
                      </div>
                    }
                    description={
                      timeFilter === "all"
                        ? "All-time scholarship application statistics"
                        : timeFilter === "monthly"
                        ? "Monthly scholarship application statistics"
                        : timeFilter === "weekly"
                        ? "Weekly scholarship application statistics"
                        : "Daily application activity within the cycle"
                    }
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <Select
                    value={educationLevelFilter}
                    onValueChange={(value) =>
                      setEducationLevelFilter(
                        value as "all" | "college" | "shs"
                      )
                    }
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="shs">SHS</SelectItem>
                    </SelectContent>
                  </Select>
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
            </div>

            <RecentApplicants applicants={applicants} />

            <QuickActions actions={quickActions} />
          </div>
        </div>
      </div>
    </div>
  );
}
