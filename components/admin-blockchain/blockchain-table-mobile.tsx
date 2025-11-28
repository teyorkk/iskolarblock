"use client";

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
import { MobileCard } from "@/components/common/mobile-card";
import type { BlockchainRecord } from "@/types/components";

interface BlockchainTableMobileProps {
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

export function BlockchainTableMobile({
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
}: BlockchainTableMobileProps) {
  if (isLoading) {
    return (
      <div className="text-center py-6 text-gray-500">
        Loading blockchain records…
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">No records found.</div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => {
        const displayName = getApplicantName(record);
        return (
          <MobileCard key={record.id}>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{displayName}</p>
                </div>
                <Badge
                  variant="outline"
                  className={getRecordBadgeClasses(record.recordType)}
                >
                  {formatRecordType(record.recordType)}
                </Badge>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div>
                  <span className="text-xs text-gray-500 font-medium">
                    Transaction Hash
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={buildExplorerUrl(record.transactionHash) ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 font-mono text-xs text-orange-700 hover:text-orange-800 flex-1 min-w-0"
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
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-medium">Date</span>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {formatDate(record.timestamp)}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
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
              </div>
            </div>
          </MobileCard>
        );
      })}
    </div>
  );
}

