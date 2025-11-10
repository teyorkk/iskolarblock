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
          <div
            className="grid gap-3 sm:gap-4"
            style={{
              gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
            }}
          >
            {steps.map((step) => (
              <div
                key={step.id}
                className={`text-center transition-colors ${
                  currentStep >= step.id
                    ? "text-orange-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full ${
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

