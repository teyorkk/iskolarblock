export type AwardingStatus = "APPROVED" | "GRANTED";
export type LevelFilter = "COLLEGE" | "SENIOR_HIGH";

export interface AwardingApplication {
  id: string;
  applicationType: string;
  status: AwardingStatus;
  applicationDetails: Record<string, unknown> | null;
  createdAt: string;
  User?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export interface ApplicationPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export function extractPersonalInfo(
  details: AwardingApplication["applicationDetails"]
): Record<string, unknown> | null {
  if (!details || typeof details !== "object") {
    return null;
  }

  if ("personalInfo" in details && details.personalInfo) {
    const info = details.personalInfo;
    if (info && typeof info === "object") {
      return info as Record<string, unknown>;
    }
  }

  return details as Record<string, unknown>;
}

export function deriveFullName(application: AwardingApplication): string {
  const personalInfo = extractPersonalInfo(application.applicationDetails);
  if (personalInfo) {
    const firstName = personalInfo.firstName as string | undefined;
    const middleName = personalInfo.middleName as string | undefined;
    const lastName = personalInfo.lastName as string | undefined;
    const segments = [firstName, middleName, lastName].filter(Boolean);
    if (segments.length) {
      return segments.join(" ");
    }
  }

  if (application.User?.name) {
    return application.User.name;
  }

  return "Unnamed Scholar";
}

export function deriveLevel(application: AwardingApplication): LevelFilter {
  const personalInfo = extractPersonalInfo(application.applicationDetails);
  const yearLevel =
    (personalInfo?.yearLevel as string | undefined)?.toLowerCase() ?? "";

  if (
    yearLevel.includes("g11") ||
    yearLevel.includes("grade 11") ||
    yearLevel.includes("g12") ||
    yearLevel.includes("grade 12")
  ) {
    return "SENIOR_HIGH";
  }

  return "COLLEGE";
}

export function formatLevel(level: LevelFilter): string {
  return level === "SENIOR_HIGH" ? "Senior High School" : "College";
}

export function getScholarAmount(level: LevelFilter): number {
  return level === "SENIOR_HIGH" ? 500 : 1000;
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});


