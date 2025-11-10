"use client";

import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ApplicationStepProps } from "@/types/components";
import type {
  NewApplicationFormData,
  RenewalApplicationFormData,
} from "@/lib/validations";

type FaceForm = NewApplicationFormData | RenewalApplicationFormData;

interface FaceScanStepProps<T extends FaceForm> extends ApplicationStepProps<T> {
  isScanning: boolean;
  onStartScan: () => void;
}

export function FaceScanStep<T extends FaceForm>({
  isScanning,
  onStartScan,
}: FaceScanStepProps<T>): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="w-5 h-5 mr-2 text-orange-500" />
          Face Scan Verification
        </CardTitle>
        <CardDescription>
          Position your face in the frame for identity verification
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="relative w-64 h-64 mx-auto mb-6">
          <div className="absolute inset-0 bg-gray-200 rounded-full flex items-center justify-center">
            {isScanning ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-48 h-48 border-4 border-orange-500 border-t-transparent rounded-full"
              />
            ) : (
              <Camera className="w-16 h-16 text-gray-400" />
            )}
          </div>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                <p className="text-sm font-medium">Scanning...</p>
              </div>
            </motion.div>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Ensure good lighting and keep your face centered in the frame
        </p>
        <Button onClick={onStartScan} disabled={isScanning}>
          {isScanning ? "Scanning..." : "Start Face Scan"}
        </Button>
      </CardContent>
    </Card>
  );
}

