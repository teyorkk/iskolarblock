"use client";

import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ApplicationProgressProps } from "@/types/components";

export function ApplicationProgress({
  currentStep,
  steps,
}: ApplicationProgressProps): React.JSX.Element {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Scholarship Application</CardTitle>
        <CardDescription>
          Complete all steps to submit your application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
          <div className="grid grid-cols-5 gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`text-center ${
                  currentStep >= step.id
                    ? "text-orange-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    currentStep >= step.id
                      ? "bg-orange-100"
                      : "bg-gray-100"
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium">{step.name}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

