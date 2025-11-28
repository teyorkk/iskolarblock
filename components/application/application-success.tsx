"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Award,
  XCircle,
  Upload,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import type { ApplicationSuccessProps } from "@/types/components";
import type { ApplicationStatus } from "@/types";

const statusMeta: Record<
  ApplicationStatus,
  {
    badgeBg: string;
    textColor: string;
    highlight: string;
    iconWrapper: string;
    icon: typeof CheckCircle;
    title: string;
    description: string;
  }
> = {
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
    description:
      "Your application is pending. Please upload remaining documents if needed.",
  },
  GRANTED: {
    badgeBg: "bg-purple-50",
    textColor: "text-purple-700",
    highlight: "text-purple-600",
    iconWrapper: "bg-purple-500",
    icon: Award,
    title: "Scholarship Granted!",
    description:
      "You're scholarship has been granted. See you in the next semester!",
  },
  REJECTED: {
    badgeBg: "bg-red-50",
    textColor: "text-red-700",
    highlight: "text-red-600",
    iconWrapper: "bg-red-500",
    icon: XCircle,
    title: "Application Rejected",
    description:
      "Unfortunately, your application didn’t meet the criteria. Please review and try again.",
  },
};

export function ApplicationSuccess({
  applicationId,
  status = "PENDING",
  remarks,
}: ApplicationSuccessProps): React.JSX.Element {
  const router = useRouter();
  const meta = statusMeta[status] ?? statusMeta.PENDING;
  const IconComponent = meta.icon;
  const statusLabel =
    status === "GRANTED"
      ? "Granted"
      : status === "APPROVED"
      ? "Approved"
      : status === "REJECTED"
      ? "Rejected"
      : "Pending";

  // Check if remarks indicate incomplete documents
  const hasIncompleteDocuments =
    remarks &&
    (remarks.toLowerCase().includes("incomplete") ||
      remarks.toLowerCase().includes("missing") ||
      remarks.toLowerCase().includes("document") ||
      remarks.toLowerCase().includes("upload") ||
      remarks.toLowerCase().includes("provide"));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
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
          <CardDescription>{meta.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`${meta.badgeBg} p-4 rounded-lg text-left`}>
            <p className={`text-sm ${meta.textColor} break-words`}>
              <strong>Application ID:</strong>{" "}
              <span className="break-all">
                {applicationId || `SCH-${Date.now()}`}
              </span>
              <br />
              <strong>Status:</strong> {statusLabel}
              {remarks && (
                <>
                  <br />
                  <strong>Remarks: </strong>
                  <span className="whitespace-pre-wrap break-words">
                    {" " + remarks}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
            <Button
              onClick={() => (window.location.href = "/user-dashboard")}
              className={
                hasIncompleteDocuments && applicationId
                  ? "w-full sm:flex-1"
                  : "w-full sm:w-auto"
              }
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/history")}
              className={
                hasIncompleteDocuments && applicationId
                  ? "w-full sm:flex-1"
                  : "w-full sm:w-auto"
              }
            >
              View Application History
            </Button>
            {hasIncompleteDocuments && applicationId && (
              <Button
                onClick={() =>
                  router.push(`/application/complete/${applicationId}`)
                }
                className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
