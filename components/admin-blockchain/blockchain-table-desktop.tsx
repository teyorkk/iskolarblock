"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Eye, ExternalLink } from "lucide-react";
import type { BlockchainRecord } from "@/types/components";

interface BlockchainTableDesktopProps {
  records: BlockchainRecord[];
  isLoading: boolean;
  getApplicantName: (record: BlockchainRecord) => string;
  buildExplorerUrl: (hash?: string | null) => string | null;
  copyToClipboard: (text: string) => void;
  formatRecordType: (type: BlockchainRecord["recordType"]) => string;
  getRecordBadgeClasses: (type: BlockchainRecord["recordType"]) => string;
  formatDate: (date: string) => string;
  selectedRecord: BlockchainRecord | null;
  setSelectedRecord: (record: BlockchainRecord) => void;
}

export function BlockchainTableDesktop({
  records,
  isLoading,
  getApplicantName,
  buildExplorerUrl,
  copyToClipboard,
  formatRecordType,
  getRecordBadgeClasses,
  formatDate,
  selectedRecord,
  setSelectedRecord,
}: BlockchainTableDesktopProps) {
  if (isLoading) {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center py-6 text-gray-500">
              Loading blockchain records…
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  if (records.length === 0) {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center py-6 text-gray-500">
              No records found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
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
        {records.map((record) => {
          const displayName = getApplicantName(record);
          return (
            <TableRow key={record.id}>
              <TableCell className="max-w-[200px]">
                <div className="flex items-center gap-2">
                  <a
                    href={buildExplorerUrl(record.transactionHash) ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 font-mono text-xs text-orange-700 hover:text-orange-800 max-w-[160px]"
                    title={record.transactionHash}
                  >
                    <span className="truncate">
                      {record.transactionHash.slice(0, 6)}...
                      {record.transactionHash.slice(-6)}
                    </span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => copyToClipboard(record.transactionHash)}
                    title="Copy transaction hash"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="font-medium">{displayName}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getRecordBadgeClasses(record.recordType)}
                >
                  {formatRecordType(record.recordType)}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(record.timestamp)}</TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Transaction Details</DialogTitle>
                      <DialogDescription>
                        Complete blockchain transaction information
                      </DialogDescription>
                    </DialogHeader>
                    {selectedRecord?.id === record.id && (
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Transaction Hash
                          </p>
                          <div className="flex flex-col gap-2">
                            <div className="flex-1 min-w-0">
                              {buildExplorerUrl(selectedRecord.transactionHash) ? (
                                <a
                                  href={
                                    buildExplorerUrl(
                                      selectedRecord.transactionHash
                                    ) ?? "#"
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-full text-sm font-mono rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-orange-700 hover:text-orange-800 break-all"
                                  title={selectedRecord.transactionHash}
                                >
                                  {selectedRecord.transactionHash}
                                </a>
                              ) : (
                                <code className="block w-full text-sm font-mono rounded-md border border-gray-200 bg-gray-50 px-3 py-2 break-all">
                                  {selectedRecord.transactionHash}
                                </code>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() =>
                                  copyToClipboard(selectedRecord.transactionHash)
                                }
                                title="Copy transaction hash"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                              </Button>
                              {buildExplorerUrl(selectedRecord.transactionHash) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  asChild
                                  title="Open in blockchain explorer"
                                >
                                  <a
                                    href={
                                      buildExplorerUrl(
                                        selectedRecord.transactionHash
                                      ) ?? "#"
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="rounded-lg border border-gray-200 p-3">
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                              Name
                            </p>
                            <p className="font-medium text-gray-900 break-words">
                              {getApplicantName(selectedRecord)}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-3">
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                              Type
                            </p>
                            <Badge
                              variant="outline"
                              className={getRecordBadgeClasses(
                                selectedRecord.recordType
                              )}
                            >
                              {formatRecordType(selectedRecord.recordType)}
                            </Badge>
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-3">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Date Recorded
                          </p>
                          <p className="font-medium">
                            {formatDate(selectedRecord.timestamp)}
                          </p>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

