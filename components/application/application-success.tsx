"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ApplicationSuccessProps } from "@/types/components";

const statusMeta = {
  APPROVED: {
    badgeBg: "bg-green-50",
    textColor: "text-green-700",
    highlight: "text-green-600",
    iconWrapper: "bg-green-500",
    icon: CheckCircle,
    title: "Application Approved!",
    description: "All required documents were received. You're all set!",
  },
  PENDING: {
    badgeBg: "bg-yellow-50",
    textColor: "text-yellow-700",
    highlight: "text-yellow-600",
    iconWrapper: "bg-yellow-400",
    icon: Clock,
    title: "Application Submitted!",
    description: "Your application is pending. Please upload remaining documents if needed.",
  },
};

export function ApplicationSuccess({
  applicationId,
  status = "PENDING",
}: ApplicationSuccessProps): React.JSX.Element {
  const meta = statusMeta[status];
  const IconComponent = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div
              className={`w-16 h-16 ${meta.iconWrapper} rounded-full flex items-center justify-center`}
            >
              <IconComponent className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className={`text-2xl ${meta.highlight}`}>
            {meta.title}
          </CardTitle>
          <CardDescription>
            {meta.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`${meta.badgeBg} p-4 rounded-lg`}>
            <p className={`text-sm ${meta.textColor}`}>
              <strong>Application ID:</strong>{" "}
              {applicationId || `SCH-${Date.now()}`}
              <br />
              <strong>Status:</strong>{" "}
              {status === "APPROVED" ? "Approved" : "Pending"}
              <br />
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => (window.location.href = "/user-dashboard")}>
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/history")}
            >
              View Application History
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
