import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Copy, ExternalLink } from "lucide-react";
import {
  buildExplorerUrl,
  copyToClipboard,
  getApplicantName,
  formatRecordType,
  getRecordBadgeClasses,
  formatDate,
  type SupabaseBlockchainRecord,
} from "@/lib/utils/blockchain-utils";

interface TransactionDetailsDialogProps {
  record: SupabaseBlockchainRecord;
  selectedRecord: SupabaseBlockchainRecord | null;
  onSelectRecord: (record: SupabaseBlockchainRecord) => void;
}

export function TransactionDetailsDialog({
  record,
  selectedRecord,
  onSelectRecord,
}: TransactionDetailsDialogProps) {
  const explorerUrl = buildExplorerUrl(selectedRecord?.transactionHash);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectRecord(record)}
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
                  {explorerUrl ? (
                    <a
                      href={explorerUrl ?? "#"}
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
                  {explorerUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                      title="Open in blockchain explorer"
                    >
                      <a
                        href={explorerUrl ?? "#"}
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
                  className={getRecordBadgeClasses(selectedRecord.recordType)}
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
  );
}


