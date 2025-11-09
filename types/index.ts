// Core entity types
export type UserRole = "ADMIN" | "USER";

export type ApplicationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  bio: string | null;
  role: UserRole;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  userId: string;
  applicationPeriodId: string;
  status: ApplicationStatus;
  applicationDetails: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// Navigation types
export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Dashboard types
export interface StatsCard {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

export interface ChartDataPoint {
  month: string;
  applications: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

// Feature type for landing page
export interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

// Application form types
export interface ApplicationStep {
  id: number;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Mock data types
export interface MockApplicant {
  name: string;
  email: string;
  status: string;
  submittedDate: string;
}

export interface MockApplication {
  type: string;
  date: string;
  status: string;
}

