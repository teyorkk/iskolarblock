import { Eye, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScreeningTableActionsProps {
  applicationId: string;
  status: string;
  onViewDetails: (applicationId: string) => void;
  onStatusUpdate: (applicationId: string, newStatus: string) => void;
  canEdit: boolean;
}

export function ScreeningTableActions({
  applicationId,
  status,
  onViewDetails,
  onStatusUpdate,
  canEdit,
}: ScreeningTableActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewDetails(applicationId)}
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </Button>
      {status === "PENDING" && canEdit && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => onStatusUpdate(applicationId, "APPROVED")}
            title="Approve"
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onStatusUpdate(applicationId, "REJECTED")}
            title="Reject"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}

