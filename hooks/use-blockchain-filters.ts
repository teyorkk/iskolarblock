import { useEffect, useMemo, useState } from "react";
import type {
  SupabaseBlockchainRecord,
  RecordTypeFilter,
} from "@/lib/utils/blockchain-utils";
import { getApplicantName } from "@/lib/utils/blockchain-utils";

interface UseBlockchainFiltersOptions {
  records: SupabaseBlockchainRecord[];
  itemsPerPage?: number;
}

export function useBlockchainFilters({
  records,
  itemsPerPage = 10,
}: UseBlockchainFiltersOptions) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<RecordTypeFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const filteredRecords = useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();
    return records.filter((record) => {
      if (typeFilter !== "ALL" && record.recordType !== typeFilter) {
        return false;
      }

      if (!term) return true;

      const name = getApplicantName(record).toLowerCase();
      return (
        name.includes(term) ||
        record.transactionHash.toLowerCase().includes(term)
      );
    });
  }, [records, debouncedSearchTerm, typeFilter]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRecords.slice(startIndex, endIndex);
  }, [filteredRecords, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, debouncedSearchTerm]);

  const totalRecords = records.length;
  const applicationCount = records.filter(
    (record) => record.recordType === "APPLICATION"
  ).length;
  const awardingCount = records.filter(
    (record) => record.recordType === "AWARDING"
  ).length;

  const filterOptions: {
    label: string;
    value: RecordTypeFilter;
    count: number;
  }[] = [
    { label: "All", value: "ALL", count: totalRecords },
    { label: "Application", value: "APPLICATION", count: applicationCount },
    { label: "Awarding", value: "AWARDING", count: awardingCount },
  ];

  return {
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    filteredRecords,
    paginatedRecords,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    filterOptions,
    stats: {
      totalRecords,
      applicationCount,
      awardingCount,
    },
  };
}


