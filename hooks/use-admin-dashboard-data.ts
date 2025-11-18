import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Users, Coins, Award } from "lucide-react";
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

interface UseAdminDashboardDataOptions {
  selectedPeriodId: string | null;
  periods: ApplicationPeriod[];
}

export function useAdminDashboardData({
  selectedPeriodId,
  periods,
}: UseAdminDashboardDataOptions) {
  const [stats, setStats] = useState<StatsCard[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [pieData, setPieData] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

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
        const totalApplicants = applications?.length || 0;
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
            value: totalApplicants.toString(),
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
          { name: "Granted", value: grantedCount, color: "#a855f7" },
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
  }, [selectedPeriodId, periods.length]);

  return {
    stats,
    applicants,
    chartData,
    pieData,
    isLoading,
  };
}
