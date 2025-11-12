"use client";

import { motion } from "framer-motion";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecentApplicationsProps } from "@/types/components";

export function RecentApplications({
  applications,
}: RecentApplicationsProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-orange-500" />
            Recent Applications
          </CardTitle>
          <CardDescription>Your latest scholarship submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.slice(0, 8).map((application, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {application.type} Application
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{application.date}</p>
                </div>
                <Badge
                  variant={
                    application.status === "APPROVED"
                      ? "default"
                      : application.status === "PENDING"
                      ? "secondary"
                      : "destructive"
                  }
                  className={
                    application.status === "APPROVED"
                      ? "bg-green-100 text-green-700 px-3 py-1"
                      : application.status === "PENDING"
                      ? "bg-orange-100 text-orange-700 px-3 py-1"
                      : "bg-red-100 text-red-700 px-3 py-1"
                  }
                >
                  {application.status}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/history">
              <Button variant="outline" className="w-full">
                View All Applications
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
