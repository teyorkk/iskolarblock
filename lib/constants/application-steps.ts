import { FileText, Upload, Camera, User } from "lucide-react";
import type { ApplicationStep } from "@/types";

export const applicationSteps: ApplicationStep[] = [
  { id: 1, name: "Application Type", icon: FileText },
  { id: 2, name: "Upload ID", icon: Upload },
  { id: 3, name: "Face Scan", icon: Camera },
  { id: 4, name: "Personal Info", icon: User },
  { id: 5, name: "Upload Documents", icon: Upload },
];

