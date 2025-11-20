import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SupabaseBlockchainRecord } from "@/lib/utils/blockchain-utils";

export function useBlockchainRecords() {
  const [records, setRecords] = useState<SupabaseBlockchainRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error: supabaseError } = await supabase
          .from("BlockchainRecord")
          .select(
            `
            id,
            recordType,
            transactionHash,
            timestamp,
            Application (
              id,
              applicationDetails
            ),
            Awarding (
              id,
              name
            )
          `
          )
          .order("timestamp", { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }

        setRecords(data ?? []);
      } catch (err) {
        console.error("Failed to fetch blockchain records:", err);
        setError("Failed to load blockchain records. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchRecords();
  }, []);

  return { records, isLoading, error };
}


