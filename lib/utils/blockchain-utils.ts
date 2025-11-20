export type SupabaseBlockchainRecord = {
  id: string;
  recordType: "APPLICATION" | "AWARDING";
  transactionHash: string;
  timestamp: string;
  Application?:
    | {
        id: string;
        applicationDetails: Record<string, unknown> | null;
      }
    | Array<{
        id: string;
        applicationDetails: Record<string, unknown> | null;
      }>
    | null;
  Awarding?:
    | {
        id: string;
        name: string | null;
      }
    | Array<{
        id: string;
        name: string | null;
      }>
    | null;
};

export type RecordTypeFilter = "ALL" | "APPLICATION" | "AWARDING";

const BLOCKCHAIN_EXPLORER_BASE_URL =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL
    ? process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL
    : "https://www.oklink.com/amoy/tx/";

export function buildExplorerUrl(hash?: string | null): string | null {
  if (!hash) return null;
  const base = BLOCKCHAIN_EXPLORER_BASE_URL.endsWith("/")
    ? BLOCKCHAIN_EXPLORER_BASE_URL
    : `${BLOCKCHAIN_EXPLORER_BASE_URL}/`;
  return `${base}${hash}`;
}

export function getApplicantName(
  record: SupabaseBlockchainRecord
): string {
  if (record.recordType === "AWARDING") {
    const awarding = Array.isArray(record.Awarding)
      ? record.Awarding[0]
      : record.Awarding;
    return awarding?.name ?? "Awarding Record";
  }

  const application = Array.isArray(record.Application)
    ? record.Application[0]
    : record.Application;
  const details = application?.applicationDetails;
  if (details && typeof details === "object") {
    if (
      "personalInfo" in details &&
      details.personalInfo &&
      typeof details.personalInfo === "object"
    ) {
      const { firstName, middleName, lastName } =
        details.personalInfo as Record<string, string | null | undefined>;
      const nameParts = [firstName, middleName, lastName].filter(Boolean);
      if (nameParts.length > 0) {
        return nameParts.join(" ");
      }
    }
    const extractedName = (details as Record<string, unknown>)?.name;
    if (
      typeof extractedName === "string" &&
      extractedName.trim().length > 0
    ) {
      return extractedName;
    }
  }

  return "Unnamed Application";
}

export function formatRecordType(
  type: SupabaseBlockchainRecord["recordType"]
): string {
  return type === "APPLICATION" ? "Application" : "Awarding";
}

export function getRecordBadgeClasses(
  type: SupabaseBlockchainRecord["recordType"]
): string {
  return type === "APPLICATION"
    ? "bg-blue-50 text-blue-700 border border-blue-200"
    : "bg-purple-50 text-purple-700 border border-purple-200";
}

export function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text);
}


