"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatsCard as StatsCardType } from "@/types";

interface StatsCardProps {
  stat: StatsCardType;
  index?: number;
}

export function StatsCard({
  stat,
  index = 0,
}: StatsCardProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {stat.title}
          </CardTitle>
          <div
            className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}
          >
            <stat.icon className="w-4 h-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
