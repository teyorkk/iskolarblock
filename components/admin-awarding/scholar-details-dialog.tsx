import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Eye } from "lucide-react";
import type { AwardingApplication } from "@/lib/utils/awarding-utils";
import {
  deriveFullName,
  deriveLevel,
  formatLevel,
  getScholarAmount,
  formatDateTime,
  currencyFormatter,
} from "@/lib/utils/awarding-utils";

interface ScholarDetailsDialogProps {
  application: AwardingApplication;
}

export function ScholarDetailsDialog({
  application,
}: ScholarDetailsDialogProps) {
  const level = deriveLevel(application);
  const amount = getScholarAmount(level);
  const currentStatus =
    (application.status as "APPROVED" | "GRANTED") ?? "APPROVED";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="View Details">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg border border-orange-100 bg-white/95 shadow-xl sm:rounded-2xl">
        <DialogHeader className="space-y-1 pb-2 border-b border-orange-50">
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <Award className="w-5 h-5 text-orange-500" />
            Scholar Details
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Award and applicant information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{deriveFullName(application)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">
                {application.User?.email ?? "—"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">
                {application.applicationType === "NEW" ? "New" : "Renewal"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Level</p>
              <p className="font-medium">{formatLevel(level)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-medium">{currencyFormatter.format(amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">
                {currentStatus === "GRANTED" ? "Granted" : "Pending"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Submitted</p>
            <p className="font-medium">
              {formatDateTime(application.createdAt)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


