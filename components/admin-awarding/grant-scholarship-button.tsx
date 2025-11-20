import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface GrantScholarshipButtonProps {
  applicationId: string;
  isUpdating: boolean;
  onGrant: (applicationId: string) => void;
  disabled?: boolean;
}

export function GrantScholarshipButton({
  applicationId,
  isUpdating,
  onGrant,
  disabled,
}: GrantScholarshipButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-green-600 hover:text-green-700 hover:bg-green-50"
      onClick={() => onGrant(applicationId)}
      disabled={disabled || isUpdating}
      title="Grant Scholarship"
    >
      {isUpdating ? (
        <span className="flex items-center gap-2 text-xs font-medium text-orange-600">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-orange-300 border-t-transparent" />
        </span>
      ) : (
        <CheckCircle className="w-4 h-4" />
      )}
    </Button>
  );
}


