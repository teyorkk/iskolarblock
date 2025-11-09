"use client";

import { Badge } from "@/components/ui/badge";
import { getStatusBadgeConfig } from "@/lib/utils/status-badges";
import type { StatusBadgeProps } from "@/types/components";

export function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element {
  const config = getStatusBadgeConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={config.color}>
      <Icon className="w-3 h-3 mr-1" />
      {status.replace("_", " ")}
    </Badge>
  );
}
