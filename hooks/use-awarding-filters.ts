import { useEffect, useMemo, useState } from "react";
import type {
  AwardingApplication,
  AwardingStatus,
  LevelFilter,
} from "@/lib/utils/awarding-utils";
import { deriveFullName, deriveLevel } from "@/lib/utils/awarding-utils";

interface UseAwardingFiltersOptions {
  applications: AwardingApplication[];
  itemsPerPage?: number;
}

export function useAwardingFilters({
  applications,
  itemsPerPage = 10,
}: UseAwardingFiltersOptions) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilters, setStatusFilters] = useState<Set<AwardingStatus>>(
    new Set()
  );
  const [levelFilters, setLevelFilters] = useState<Set<LevelFilter>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const toggleStatusFilter = (status: AwardingStatus) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const toggleLevelFilter = (level: LevelFilter) => {
    setLevelFilters((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const status = (app.status as AwardingStatus) ?? "APPROVED";
      if (statusFilters.size > 0 && !statusFilters.has(status)) {
        return false;
      }

      const level = deriveLevel(app);
      if (levelFilters.size > 0 && !levelFilters.has(level)) {
        return false;
      }

      if (!debouncedSearchTerm) {
        return true;
      }

      const name = deriveFullName(app).toLowerCase();
      const email = (app.User?.email ?? "").toLowerCase();
      const type = app.applicationType.toLowerCase();
      return (
        name.includes(debouncedSearchTerm) ||
        email.includes(debouncedSearchTerm) ||
        type.includes(debouncedSearchTerm)
      );
    });
  }, [applications, statusFilters, levelFilters, debouncedSearchTerm]);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredApplications.slice(startIndex, endIndex);
  }, [filteredApplications, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilters, levelFilters, debouncedSearchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilters,
    toggleStatusFilter,
    levelFilters,
    toggleLevelFilter,
    filteredApplications,
    paginatedApplications,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
  };
}


