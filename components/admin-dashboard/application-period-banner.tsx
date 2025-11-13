"use client";

import { CalendarRange, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ApplicationPeriodBannerProps {
  variant?: "admin" | "user";
}

export function ApplicationPeriodBanner({
  variant = "admin",
}: ApplicationPeriodBannerProps): React.JSX.Element {
  const styles =
    variant === "user"
      ? {
          card: "border-orange-100",
          icon: "bg-orange-100 text-orange-600",
        }
      : {
          card: "border-red-100",
          icon: "bg-red-100 text-red-600",
        };

  return (
    <Card
      className={`p-4 md:p-5 mb-6 border-2 bg-white shadow-sm ${styles.card}`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${styles.icon}`}>
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-900">
                Scholarship Application Period
              </h2>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                On-going
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Manage submissions while the current application window remains
              open.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-gray-100 p-2 text-gray-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Start Date
              </p>
              <p className="font-medium text-gray-900">November 1, 2025</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-gray-100 p-2 text-gray-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                End Date
              </p>
              <p className="font-medium text-gray-900">November 30, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
