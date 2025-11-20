import { Wallet, Users, GraduationCap } from "lucide-react";
import type { LiveImpactStat } from "@/types";

export const landingLiveImpactStats: LiveImpactStat[] = [
  {
    id: "budget-reimbursed",
    icon: Wallet,
    title: "Total Budget Reimbursed",
    value: "0",
    prefix: "₱",
    description: "Funds released back to scholars",
  },
  {
    id: "total-applicants",
    icon: Users,
    title: "Total Applicants",
    value: "0",
    description: "Submitted scholarship applications",
  },
  {
    id: "scholars-granted",
    icon: GraduationCap,
    title: "Scholars Granted",
    value: "0",
    description: "Students awarded scholarships",
  },
];
