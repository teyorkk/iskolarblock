"use client";

import { Suspense, lazy } from "react";
import { Calendar, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Lazy load heavy chart components
const LineChart = lazy(() =>
  import("@/components/common/line-chart").then((mod) => ({
    default: mod.LineChart,
  }))
);
const PieChart = lazy(() =>
  import("@/components/common/pie-chart").then((mod) => ({
    default: mod.PieChart,
  }))
);

interface ChartDataPoint {
  month: string;
  applications: number;
}

interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

interface DashboardChartsProps {
  chartData: ChartDataPoint[];
  pieData: PieDataPoint[];
  totalApplicants: number;
  timeFilter: "all" | "monthly" | "weekly" | "daily";
  educationLevelFilter: "all" | "college" | "shs";
  onTimeFilterChange: (filter: "all" | "monthly" | "weekly" | "daily") => void;
  onEducationLevelFilterChange: (filter: "all" | "college" | "shs") => void;
}

export function DashboardCharts({
  chartData,
  pieData,
  totalApplicants,
  timeFilter,
  educationLevelFilter,
  onTimeFilterChange,
  onEducationLevelFilterChange,
}: DashboardChartsProps): React.JSX.Element {
  const getTimeFilterDescription = () => {
    switch (timeFilter) {
      case "all":
        return "All-time scholarship application statistics";
      case "monthly":
        return "Monthly scholarship application statistics";
      case "weekly":
        return "Weekly scholarship application statistics";
      case "daily":
        return "Daily application activity within the cycle";
      default:
        return "Application statistics";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <Select
              value={timeFilter}
              onValueChange={(value) =>
                onTimeFilterChange(
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
          <Suspense
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-red-500" />
                      Application Trends
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <LineChart
              data={chartData}
              color="#dc2626"
              title={
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-red-500" />
                  Application Trends
                </div>
              }
              description={getTimeFilterDescription()}
            />
          </Suspense>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-4 right-4 z-20">
          <Select
            value={educationLevelFilter}
            onValueChange={(value) =>
              onEducationLevelFilterChange(
                value as "all" | "college" | "shs"
              )
            }
          >
            <SelectTrigger className="w-[140px] h-8 text-xs bg-white shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="college">College</SelectItem>
              <SelectItem value="shs">SHS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Suspense
          fallback={
            <Card>
              <CardHeader className="pr-32">
                <CardTitle>
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-red-500" />
                    Application Status
                  </div>
                </CardTitle>
                <CardDescription>
                  Current distribution of applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              </CardContent>
            </Card>
          }
        >
          <div className="relative">
            <PieChart
              data={pieData}
              total={totalApplicants}
              title={
                <div className="flex items-center pr-32">
                  <FileText className="w-5 h-5 mr-2 text-red-500" />
                  Application Status
                </div>
              }
              description="Current distribution of applications"
            />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

