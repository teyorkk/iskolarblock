"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Search, FileText, Award, Filter } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { ResponsiveTableWrapper } from "@/components/common/responsive-table-wrapper";
import { BlockchainTableDesktop } from "@/components/admin-blockchain/blockchain-table-desktop";
import { BlockchainTableMobile } from "@/components/admin-blockchain/blockchain-table-mobile";
import type { BlockchainRecord } from "@/types/components";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type RecordTypeFilter = "ALL" | "APPLICATION" | "AWARDING";
type SupabaseBlockchainRecord = BlockchainRecord;

const BLOCKCHAIN_EXPLORER_BASE_URL =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL
    ? process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL
    : "https://www.oklink.com/amoy/tx/";

function buildExplorerUrl(hash?: string | null) {
  if (!hash) return null;
  const base = BLOCKCHAIN_EXPLORER_BASE_URL.endsWith("/")
    ? BLOCKCHAIN_EXPLORER_BASE_URL
    : `${BLOCKCHAIN_EXPLORER_BASE_URL}/`;
  return `${base}${hash}`;
}

export default function BlockchainPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<RecordTypeFilter>("ALL");
  const [selectedRecord, setSelectedRecord] =
    useState<SupabaseBlockchainRecord | null>(null);
  const [records, setRecords] = useState<SupabaseBlockchainRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const getApplicantName = (record: SupabaseBlockchainRecord) => {
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
  };

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

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRecords.slice(startIndex, endIndex);
  }, [filteredRecords, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatRecordType = (type: SupabaseBlockchainRecord["recordType"]) =>
    type === "APPLICATION" ? "Application" : "Awarding";

  const getRecordBadgeClasses = (
    type: SupabaseBlockchainRecord["recordType"]
  ) =>
    type === "APPLICATION"
      ? "bg-blue-50 text-blue-700 border border-blue-200"
      : "bg-purple-50 text-purple-700 border border-purple-200";

  const formatDate = (timestamp: string) =>
    new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      {/* Main Content */}
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Blockchain Records
                </h1>
                <p className="text-gray-600">
                  View and manage blockchain-verified scholarship records
                </p>
              </div>
            </div>

            {/* Search & Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by applicant name or transaction hash..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="w-full lg:w-auto">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="flex flex-wrap gap-2">
                        {filterOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={
                              typeFilter === option.value
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className={
                              typeFilter === option.value
                                ? "bg-orange-500 hover:bg-orange-600 text-white"
                                : undefined
                            }
                            onClick={() => setTypeFilter(option.value)}
                          >
                            <span className="hidden sm:inline">
                              {option.label}
                            </span>
                            <span className="sm:hidden">
                              {option.value === "ALL"
                                ? "All"
                                : option.value === "APPLICATION"
                                ? "App"
                                : "Award"}
                            </span>
                            <span className="ml-1">({option.count})</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Records</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {isLoading ? "…" : totalRecords}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Application Records
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {isLoading ? "…" : applicationCount}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Awarding Records</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {isLoading ? "…" : awardingCount}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Records Table */}
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Transactions</CardTitle>
                <CardDescription>
                  Records retrieved directly from the blockchain audit log
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="text-sm text-red-600 mb-4">{error}</div>
                )}
                <ResponsiveTableWrapper
                  desktopView={
                    <BlockchainTableDesktop
                      records={paginatedRecords}
                      isLoading={isLoading}
                      getApplicantName={getApplicantName}
                      buildExplorerUrl={buildExplorerUrl}
                      copyToClipboard={copyToClipboard}
                      formatRecordType={formatRecordType}
                      getRecordBadgeClasses={getRecordBadgeClasses}
                      formatDate={formatDate}
                      selectedRecord={selectedRecord}
                      setSelectedRecord={setSelectedRecord}
                    />
                  }
                  mobileView={
                    <BlockchainTableMobile
                      records={paginatedRecords}
                      isLoading={isLoading}
                      getApplicantName={getApplicantName}
                      buildExplorerUrl={buildExplorerUrl}
                      copyToClipboard={copyToClipboard}
                      formatRecordType={formatRecordType}
                      getRecordBadgeClasses={getRecordBadgeClasses}
                      formatDate={formatDate}
                      selectedRecord={selectedRecord}
                      setSelectedRecord={setSelectedRecord}
                    />
                  }
                />

                {filteredRecords.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredRecords.length}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
