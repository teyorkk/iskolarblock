"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecentApplicantsProps } from "@/types/components";

export function RecentApplicants({
  applicants,
}: RecentApplicantsProps): React.JSX.Element {
  const router = useRouter();
  const statusClassMap: Record<
    string,
    { variant: "default" | "secondary" | "destructive"; className: string }
  > = {
    APPROVED: { variant: "default", className: "bg-green-100 text-green-700" },
    GRANTED: { variant: "default", className: "bg-purple-100 text-purple-700" },
    PENDING: {
      variant: "secondary",
      className: "bg-orange-100 text-orange-700",
    },
    REJECTED: { variant: "destructive", className: "bg-red-100 text-red-700" },
  };

  const getStatusConfig = (status: string) =>
    statusClassMap[status] ?? {
      variant: "secondary",
      className: "bg-gray-100 text-gray-700",
    };

  const handleViewAll = () => {
    router.push("/screening");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mt-6"
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-red-500" />
                Recent Applicants
              </CardTitle>
              <CardDescription>
                Latest scholarship applications submitted
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAll}
              className="self-start sm:self-auto"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applicants.slice(0, 4).map((applicant, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    {applicant.profilePicture ? (
                      <AvatarImage src={applicant.profilePicture} alt={applicant.name} />
                    ) : null}
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-sm font-medium">
                      {applicant.name?.charAt(0) || applicant.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {applicant.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {applicant.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:text-right gap-2 sm:gap-1 flex-shrink-0">
                  {(() => {
                    const { variant, className } = getStatusConfig(
                      applicant.status
                    );
                    return (
                      <Badge variant={variant} className={className}>
                        {applicant.status}
                      </Badge>
                    );
                  })()}
                  <p className="text-xs text-gray-500 sm:mt-0">
                    {applicant.submittedDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleViewAll}
            >
              View All Applicants
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
