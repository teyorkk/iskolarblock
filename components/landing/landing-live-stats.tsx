"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, GraduationCap, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type BudgetRecord = {
  totalAmount: number | null;
  remainingAmount: number | null;
};

interface LandingLiveStatsState {
  totalApplicants: number;
  grantedScholars: number;
  reimbursedBudget: number;
}

const initialState: LandingLiveStatsState = {
  totalApplicants: 0,
  grantedScholars: 0,
  reimbursedBudget: 0,
};

export function LandingLiveStats(): React.JSX.Element {
  const [stats, setStats] = useState<LandingLiveStatsState>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = getSupabaseBrowserClient();

        const [{ count: applicantsCount }, { count: grantedCount }] =
          await Promise.all([
            supabase
              .from("Application")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("Application")
              .select("id", { count: "exact", head: true })
              .eq("status", "GRANTED"),
          ]);
        const totalApplicants = applicantsCount ?? 0;
        const grantedScholars = grantedCount ?? 0;

        const { data: budgetsData } = await supabase
          .from("Budget")
          .select("totalAmount, remainingAmount");
        const budgets: BudgetRecord[] = budgetsData ?? [];

        const reimbursedBudget = budgets.reduce((total, budget) => {
          const allocated = Number(budget.totalAmount ?? 0);
          const remaining = Number(budget.remainingAmount ?? 0);
          return total + Math.max(allocated - remaining, 0);
        }, 0);

        setStats({
          totalApplicants,
          grantedScholars,
          reimbursedBudget,
        });
      } catch (error) {
        console.error("Failed to load landing stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStats();
  }, []);

  const formattedStats = useMemo(() => {
    const formatNumber = (value: number) =>
      new Intl.NumberFormat("en-US").format(value);

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
      }).format(value);

    return [
      {
        title: "Total Budget Reimbursed",
        value: isLoading ? "..." : formatCurrency(stats.reimbursedBudget),
        description: "Funds released back to scholars",
        icon: Banknote,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-500",
      },
      {
        title: "Total Applicants",
        value: isLoading ? "..." : formatNumber(stats.totalApplicants),
        description: "Submitted scholarship applications",
        icon: Users,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-500",
      },
      {
        title: "Scholars Granted",
        value: isLoading ? "..." : formatNumber(stats.grantedScholars),
        description: "Students awarded scholarships",
        icon: GraduationCap,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-500",
      },
    ];
  }, [isLoading, stats]);

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
            Live Impact
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Real-time Progress of IskolarBlock
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Track how we continually support students across Barangay San Miguel
            through transparent and measurable scholarship distribution.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {formattedStats.map((stat) => (
            <Card
              key={stat.title}
              className="h-full hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${stat.iconBg}`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600 mt-2">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
