"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StatsCard as StatsCardType } from "@/types";

interface StatsCardProps {
  stat: StatsCardType;
  index?: number;
}

export function StatsCard({ stat, index = 0 }: StatsCardProps): React.JSX.Element {
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
          <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
            <stat.icon className="w-4 h-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
          {stat.trend && (
            <div className="flex items-center mt-2">
              {stat.trendUp !== false ? (
                <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span
                className={`text-xs ${
                  stat.trendUp !== false ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.trend}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

