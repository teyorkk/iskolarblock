import { Users, Coins, TrendingUp, FileText, Award } from "lucide-react";
import type { StatsCard } from "@/types";

export const adminStatsCards: StatsCard[] = [
  {
    title: "Total Applicants",
    value: "156",
    description: "This month",
    icon: Users,
    color: "bg-blue-500",
    trend: "+12.5%",
    trendUp: true,
  },
  {
    title: "Total Budget",
    value: "₱500,000",
    description: "Allocated funds",
    icon: Coins,
    color: "bg-green-500",
    trend: "+8.2%",
    trendUp: true,
  },
  {
    title: "Remaining Budget",
    value: "₱125,000",
    description: "Available funds",
    icon: TrendingUp,
    color: "bg-orange-500",
    trend: "-25%",
    trendUp: false,
  },
  {
    title: "Pending Reviews",
    value: "23",
    description: "Awaiting approval",
    icon: FileText,
    color: "bg-purple-500",
    trend: "+5",
    trendUp: true,
  },
];

export const userStatsCards: StatsCard[] = [
  {
    title: "Total Applications",
    value: "3",
    description: "All time applications",
    icon: FileText,
    color: "bg-blue-500",
  },
  {
    title: "Pending Review",
    value: "1",
    description: "Awaiting approval",
    icon: TrendingUp,
    color: "bg-orange-500",
  },
  {
    title: "Approved",
    value: "1",
    description: "Successfully approved",
    icon: Users,
    color: "bg-green-500",
  },
  {
    title: "Granted",
    value: "0",
    description: "Scholarships released",
    icon: Award,
    color: "bg-purple-500",
  },
];

export const adminPieData = [
  { name: "Approved", value: 45, color: "#10b981" },
  { name: "Pending", value: 30, color: "#f97316" },
  { name: "Rejected", value: 25, color: "#ef4444" },
];

