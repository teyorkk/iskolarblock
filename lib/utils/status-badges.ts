import { Clock, CheckCircle, XCircle } from "lucide-react";
import type { ApplicationStatus } from "@/types";

export interface StatusBadgeConfig {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function getStatusBadgeConfig(
  status: ApplicationStatus | string
): StatusBadgeConfig {
  const statusConfig: Record<string, StatusBadgeConfig> = {
    PENDING: { color: "bg-orange-100 text-orange-700", icon: Clock },
    APPROVED: { color: "bg-green-100 text-green-700", icon: CheckCircle },
    REJECTED: { color: "bg-red-100 text-red-700", icon: XCircle },
  };

  return (
    statusConfig[status] || {
      color: "bg-gray-100 text-gray-700",
      icon: Clock,
    }
  );
}

