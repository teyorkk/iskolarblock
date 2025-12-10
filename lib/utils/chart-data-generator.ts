interface Application {
  id: string;
  status: string;
  createdAt: string;
  applicationPeriodId: string | null;
  applicationDetails?: {
    personalInfo?: {
      yearLevel?: string;
    };
  } | null;
}

interface ApplicationPeriod {
  id: string;
  startDate: string;
  endDate: string;
}

interface ChartDataPoint {
  month: string;
  applications: number;
}

/**
 * Generates chart data based on the selected time filter
 */
export function generateChartData(
  applications: Application[],
  periods: ApplicationPeriod[],
  selectedPeriodId: string | null,
  timeFilter: "all" | "monthly" | "weekly" | "daily"
): ChartDataPoint[] {
  const chartDataPoints: ChartDataPoint[] = [];

  if (!applications || applications.length === 0) {
    chartDataPoints.push({
      month: "No Data",
      applications: 0,
    });
    return chartDataPoints;
  }

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
      const currentPeriod = periods.find((p) => p.id === selectedPeriodId);
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
            applications.filter((app) => {
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
      const currentPeriod = periods.find((p) => p.id === selectedPeriodId);
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

  // If no data, show empty chart
  if (chartDataPoints.length === 0) {
    chartDataPoints.push({
      month: "No Data",
      applications: 0,
    });
  }

  return chartDataPoints;
}

/**
 * Filters applications by education level
 */
export function filterApplicationsByEducationLevel(
  applications: Application[],
  filter: "all" | "college" | "shs"
): Application[] {
  if (filter === "all") {
    return applications;
  }

  return applications.filter((app) => {
    const yearLevel = app.applicationDetails?.personalInfo?.yearLevel || "";
    if (filter === "college") {
      return ["1", "2", "3", "4"].includes(yearLevel);
    } else if (filter === "shs") {
      return ["G11", "G12"].includes(yearLevel);
    }
    return true;
  });
}

