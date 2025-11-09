"use client";

import { StatsCard } from "./stats-card";
import type { StatsGridProps } from "@/types/components";

export function StatsGrid({ stats }: StatsGridProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatsCard key={index} stat={stat} index={index} />
      ))}
    </div>
  );
}

