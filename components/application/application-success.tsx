"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ApplicationSuccessProps } from "@/types/components";

export function ApplicationSuccess({
  applicationId,
}: ApplicationSuccessProps): React.JSX.Element {
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
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-600">
            Application Submitted!
          </CardTitle>
          <CardDescription>
            Your scholarship application has been successfully submitted and is
            now under review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Application ID:</strong>{" "}
              {applicationId || `SCH-${Date.now()}`}
              <br />
              <strong>Status:</strong> Under Review
              <br />
              <strong>Estimated Response:</strong> 5-7 business days
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
