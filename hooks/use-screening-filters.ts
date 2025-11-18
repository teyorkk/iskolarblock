import { useState, useEffect, useMemo } from "react";

import type { Application } from "./use-screening-applications";

export function useScreeningFilters(applications: Application[]) {
  const [statusFilter, setStatusFilter] = useState<"ALL" | Application["status"]>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus =
        statusFilter === "ALL" || app.status === statusFilter;
      if (!matchesStatus) return false;

      if (!debouncedSearchTerm) return true;

      const term = debouncedSearchTerm;
      return (
        app.User.name.toLowerCase().includes(term) ||
        app.User.email.toLowerCase().includes(term) ||
        app.applicationType.toLowerCase().includes(term)
      );
    });
  }, [applications, statusFilter, debouncedSearchTerm]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((app) => app.status === "PENDING").length,
      approved: applications.filter((app) => app.status === "APPROVED").length,
      granted: applications.filter((app) => app.status === "GRANTED").length,
      rejected: applications.filter((app) => app.status === "REJECTED").length,
    };
  }, [applications]);

  const statusFilters = [
    { label: "All", value: "ALL" as const, count: stats.total },
    { label: "Pending", value: "PENDING" as const, count: stats.pending },
    { label: "Approved", value: "APPROVED" as const, count: stats.approved },
    { label: "Granted", value: "GRANTED" as const, count: stats.granted },
    { label: "Rejected", value: "REJECTED" as const, count: stats.rejected },
  ];

  // Pagination logic
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredApplications.slice(startIndex, endIndex);
  }, [filteredApplications, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearchTerm]);

  return {
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    stats,
    statusFilters,
    filteredApplications,
    paginatedApplications,
    totalPages,
    itemsPerPage,
  };
}

