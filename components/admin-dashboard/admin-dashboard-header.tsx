"use client";

import { ApplicationPeriodDialog } from "./application-period-dialog";
import { GenerateReportButton } from "./generate-report-button";
import type { DashboardHeaderProps } from "@/types/components";
import type { StatsCard } from "@/types";

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface ApplicationPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

interface AdminDashboardHeaderProps extends DashboardHeaderProps {
  reportData?: {
    stats: StatsCard[];
    pieData: PieData[];
    period: ApplicationPeriod | null;
  };
}

export function AdminDashboardHeader({
  title,
  description,
  actions,
  reportData,
}: AdminDashboardHeaderProps): React.JSX.Element {
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white mb-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
        <p className="text-red-100 mb-4">{description}</p>
        <div className="flex flex-wrap gap-3">
          {actions || (
            <>
              <ApplicationPeriodDialog />
              {reportData ? (
                <GenerateReportButton
                  stats={reportData.stats}
                  pieData={reportData.pieData}
                  period={reportData.period}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
