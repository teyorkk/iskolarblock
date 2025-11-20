import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { LiveBlockchainRecord } from "@/types";

type SupabaseBlockchainRow = {
  id: string;
  recordType: "APPLICATION" | "AWARDING";
  transactionHash: string;
  timestamp: string;
  Application?:
    | null
    | {
        applicationType?: string | null;
      }
    | Array<{
        applicationType?: string | null;
      }>;
};

export async function getLiveBlockchainFeed(
  limit?: number
): Promise<LiveBlockchainRecord[]> {
  const supabase = getSupabaseServerClient();
  const query = supabase
    .from("BlockchainRecord")
    .select(
      `
      id,
      recordType,
      transactionHash,
      timestamp,
      Application (
        applicationType
      )
    `
    )
    .order("timestamp", { ascending: false });

  const { data, error } =
    limit && limit > 0 ? await query.limit(limit) : await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((record: SupabaseBlockchainRow) => {
    const application = Array.isArray(record.Application)
      ? record.Application[0]
      : record.Application;

    const applicationType =
      application?.applicationType ??
      (record.recordType === "AWARDING"
        ? "AWARDING"
        : record.recordType === "APPLICATION"
        ? "APPLICATION"
        : "UNKNOWN");

    return {
      id: record.id,
      transactionHash: record.transactionHash,
      applicationType,
      recordType: record.recordType,
      timestamp: record.timestamp,
    };
  });
}
