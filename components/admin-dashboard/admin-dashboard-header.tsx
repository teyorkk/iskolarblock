"use client";

import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationPeriodDialog } from "./application-period-dialog";
import type { DashboardHeaderProps } from "@/types/components";

export function AdminDashboardHeader({
  title,
  description,
  actions,
}: DashboardHeaderProps): React.JSX.Element {
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white mb-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
        <p className="text-red-100 mb-4">{description}</p>
        <div className="flex flex-wrap gap-3">
          {actions || (
            <>
              <Button
                variant="secondary"
                className="bg-white text-red-600 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Budget
              </Button>
              <ApplicationPeriodDialog />
              <Button
                variant="outline"
                className="border-white text-red-600 hover:bg-gray-100"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

