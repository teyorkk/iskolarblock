"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/common/pagination";
import { useBlockchainRecords } from "@/hooks/use-blockchain-records";
import { useBlockchainFilters } from "@/hooks/use-blockchain-filters";
import {
  getApplicantName,
  formatRecordType,
  getRecordBadgeClasses,
  formatDate,
  type SupabaseBlockchainRecord,
} from "@/lib/utils/blockchain-utils";
import { BlockchainStatsCards } from "@/components/blockchain/blockchain-stats-cards";
import { BlockchainSearchFilters } from "@/components/blockchain/blockchain-search-filters";
import { TransactionHashCell } from "@/components/blockchain/transaction-hash-cell";
import { TransactionDetailsDialog } from "@/components/blockchain/transaction-details-dialog";

export default function BlockchainPage() {
  const [selectedRecord, setSelectedRecord] =
    useState<SupabaseBlockchainRecord | null>(null);

  const { records, isLoading, error } = useBlockchainRecords();

  const filters = useBlockchainFilters({ records });

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
            <BlockchainSearchFilters
              searchTerm={filters.searchTerm}
              onSearchChange={filters.setSearchTerm}
              typeFilter={filters.typeFilter}
              onTypeFilterChange={filters.setTypeFilter}
              filterOptions={filters.filterOptions}
            />

            {/* Stats Cards */}
            <BlockchainStatsCards
              totalRecords={filters.stats.totalRecords}
              applicationCount={filters.stats.applicationCount}
              awardingCount={filters.stats.awardingCount}
              isLoading={isLoading}
            />

            {/* Records Table */}
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Transactions</CardTitle>
                <CardDescription>
                  Records retrieved directly from the blockchain audit log
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {error && (
                    <div className="text-sm text-red-600 mb-4">{error}</div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hash</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-6 text-gray-500"
                          >
                            Loading blockchain records…
                          </TableCell>
                        </TableRow>
                      ) : filters.paginatedRecords.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-6 text-gray-500"
                          >
                            No records found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filters.paginatedRecords.map((record) => {
                          const displayName = getApplicantName(record);
                          return (
                            <TableRow key={record.id}>
                              <TableCell>
                                <TransactionHashCell
                                  transactionHash={record.transactionHash}
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                {displayName}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={getRecordBadgeClasses(
                                    record.recordType
                                  )}
                                >
                                  {formatRecordType(record.recordType)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {formatDate(record.timestamp)}
                              </TableCell>
                              <TableCell className="text-right">
                                <TransactionDetailsDialog
                                  record={record}
                                  selectedRecord={selectedRecord}
                                  onSelectRecord={setSelectedRecord}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
                {filters.filteredRecords.length > 0 && (
                  <Pagination
                    currentPage={filters.currentPage}
                    totalPages={filters.totalPages}
                    onPageChange={filters.setCurrentPage}
                    itemsPerPage={filters.itemsPerPage}
                    totalItems={filters.filteredRecords.length}
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
