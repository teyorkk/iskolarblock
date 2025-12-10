import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { calculateBudgetRecommendation } from "@/lib/utils/budget-recommendation";
import {
  generateChartData,
  filterApplicationsByEducationLevel,
} from "@/lib/utils/chart-data-generator";
import type { StatsCard } from "@/types";
import { Users, Coins, TrendingUp } from "lucide-react";

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

interface ApplicationPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

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

interface DashboardData {
  stats: StatsCard[];
  applicants: Applicant[];
  applications: Application[];
  chartData: ChartDataPoint[];
  pieData: Array<{ name: string; value: number; color: string }>;
  totalApplicants: number;
  isLoading: boolean;
}

export function useDashboardData(
  selectedPeriodId: string | null,
  timeFilter: "all" | "monthly" | "weekly" | "daily",
  educationLevelFilter: "all" | "college" | "shs",
  periods: ApplicationPeriod[]
): DashboardData {
  const [stats, setStats] = useState<StatsCard[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [pieData, setPieData] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalApplicants, setTotalApplicants] = useState(0);

  useEffect(() => {
    if (selectedPeriodId || periods.length === 0) {
      void fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriodId, timeFilter, educationLevelFilter, periods]);

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

  const fetchDashboardData = async () => {
    try {
      const supabase = getSupabaseBrowserClient();

      // Fetch applications
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

      // Calculate recommended budget
      const budgetRecommendation = await calculateBudgetRecommendation(
        supabase,
        periods
      );

      // Calculate statistics (using all applications)
      const totalApplicantsCount = applications?.length || 0;

      // Filter applications by application period and education level for pie chart only
      let filteredApplications = applications || [];

      // First, filter by application period if a period is selected
      if (selectedPeriodId) {
        filteredApplications = filteredApplications.filter(
          (app) => app.applicationPeriodId === selectedPeriodId
        );
      }

      // Then, filter by education level if not "all"
      filteredApplications = filterApplicationsByEducationLevel(
        filteredApplications,
        educationLevelFilter
      );

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
          description: "This cycle",
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
          title: "Recommended Budget",
          value: formatCurrency(budgetRecommendation.recommendedBudget),
          description: "For next cycle",
          icon: TrendingUp,
          color: "bg-purple-500",
          trend:
            budgetRecommendation.recommendedBudget > 0
              ? `${
                  budgetRecommendation.budgetChange >= 0 ? "+" : ""
                }${budgetRecommendation.budgetChangePercent.toFixed(1)}%`
              : "No data",
          trendUp: budgetRecommendation.budgetChange >= 0,
        },
      ]);

      // Set pie chart data (using filtered applications)
      setPieData([
        { name: "Approved", value: filteredApprovedCount, color: "#10b981" },
        { name: "Pending", value: filteredPendingCount, color: "#f97316" },
        { name: "Rejected", value: filteredRejectedCount, color: "#ef4444" },
        {
          name: "Granted",
          value: filteredGrantedCount,
          color: "#a855f7",
        },
      ]);
      setTotalApplicants(filteredTotalApplicants);

      // Generate chart data
      const chartDataPoints = generateChartData(
        applications || [],
        periods,
        selectedPeriodId,
        timeFilter
      );
      setChartData(chartDataPoints);

      // Set recent applicants
      const recentApps: Applicant[] =
        applications?.slice(0, 10).map((app) => {
          const user = userMap.get(app.userId);
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
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stats,
    applicants,
    applications: applications || [],
    chartData,
    pieData,
    totalApplicants,
    isLoading,
  };
}
