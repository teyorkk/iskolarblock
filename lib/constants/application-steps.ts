import { FileText, Upload, User, Files } from "lucide-react";
import type { ApplicationStep } from "@/types";

export const newApplicationSteps: ApplicationStep[] = [
  { id: 1, name: "Upload ID", icon: Upload },
  { id: 2, name: "Personal Info", icon: User },
  { id: 3, name: "Address & Academic", icon: User },
  { id: 4, name: "Upload Documents", icon: Files },
];

export const renewalApplicationSteps: ApplicationStep[] = [
  { id: 1, name: "Upload ID", icon: Upload },
  { id: 2, name: "Personal Info", icon: User },
  { id: 3, name: "Address & Academic", icon: User },
  { id: 4, name: "Upload Documents", icon: Files },
];

export const applicationSteps: ApplicationStep[] = [
  { id: 1, name: "Application Type", icon: FileText },
  { id: 2, name: "Upload ID", icon: Upload },
  { id: 3, name: "Personal Info", icon: User },
  { id: 4, name: "Upload Documents", icon: Upload },
];
