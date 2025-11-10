"use client";

import { FileText, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ApplicationStepProps } from "@/types/components";

export function ApplicationTypeStep({
  errors,
  setValue,
  watch,
}: ApplicationStepProps): React.JSX.Element {
  // Defensive read of potential error message across RHF union types
  const typeErrorMessage =
    (errors as unknown as { type?: { message?: string } })?.type?.message;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2 text-orange-500" />
          Application Type
        </CardTitle>
        <CardDescription>
          Select the type of scholarship application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className={`cursor-pointer transition-all ${
              watch("type") === "new"
                ? "ring-2 ring-orange-500 bg-orange-50"
                : "hover:shadow-md"
            }`}
            onClick={() => setValue("type", "new")}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">New Application</h3>
                  <p className="text-sm text-gray-600">
                    First-time scholarship applicant
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              watch("type") === "renewal"
                ? "ring-2 ring-orange-500 bg-orange-50"
                : "hover:shadow-md"
            }`}
            onClick={() => setValue("type", "renewal")}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Renewal</h3>
                  <p className="text-sm text-gray-600">
                    Continuing your scholarship
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {typeErrorMessage ? (
          <p className="text-sm text-red-500">{typeErrorMessage}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
