"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecentApplicantsProps } from "@/types/components";

export function RecentApplicants({ applicants }: RecentApplicantsProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mt-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-red-500" />
                Recent Applicants
              </CardTitle>
              <CardDescription>
                Latest scholarship applications submitted
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applicants.slice(0, 4).map((applicant, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {applicant.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{applicant.name}</p>
                    <p className="text-sm text-gray-500">{applicant.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      applicant.status === "APPROVED"
                        ? "default"
                        : applicant.status === "PENDING"
                        ? "secondary"
                        : "destructive"
                    }
                    className={
                      applicant.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : applicant.status === "PENDING"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {applicant.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {applicant.submittedDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" className="w-full">
              View All Applicants
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

