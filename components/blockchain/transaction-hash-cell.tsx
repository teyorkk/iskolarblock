import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { buildExplorerUrl, copyToClipboard } from "@/lib/utils/blockchain-utils";

interface TransactionHashCellProps {
  transactionHash: string;
}

export function TransactionHashCell({
  transactionHash,
}: TransactionHashCellProps) {
  const explorerUrl = buildExplorerUrl(transactionHash);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <a
        href={explorerUrl ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-mono text-xs text-orange-700 hover:text-orange-800 min-w-0 flex-1"
        title={transactionHash}
      >
        <span className="truncate">
          {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
        </span>
        <ExternalLink className="w-3 h-3 flex-shrink-0" />
      </a>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0"
        onClick={() => copyToClipboard(transactionHash)}
        title="Copy transaction hash"
      >
        <Copy className="w-3 h-3" />
      </Button>
    </div>
  );
}


