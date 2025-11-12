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
import { Eye, Download } from "lucide-react";

interface Application {
  id: string;
  date: string;
  type: string;
  status: string;
  remarks: string;
}

interface ApplicationDetailsDialogProps {
  application: Application;
  statusColors: Record<string, string>;
}

export function ApplicationDetailsDialog({
  application,
  statusColors,
}: ApplicationDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            Complete information about your scholarship application
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Application ID</p>
              <p className="font-medium">
                SCH-{String(application.id).padStart(6, "0")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date Submitted</p>
              <p className="font-medium">{application.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-medium">{application.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge
                variant="secondary"
                className={
                  statusColors[application.status as keyof typeof statusColors]
                }
              >
                {application.status}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">Remarks</p>
            <p className="font-medium">{application.remarks}</p>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Documents</p>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
