"use client";

import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateAwardingSheetButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function GenerateAwardingSheetButton({
  onClick,
  isLoading,
  disabled = false,
}: GenerateAwardingSheetButtonProps): React.JSX.Element {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading || disabled}
      className="bg-orange-500 hover:bg-orange-600 text-white"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4 mr-2" />
          Generate Awarding Sheet
        </>
      )}
    </Button>
  );
}

