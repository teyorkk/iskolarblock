import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
import type { AwardingApplication, AwardingStatus } from "@/lib/utils/awarding-utils";
import {
  deriveFullName,
  deriveLevel,
  formatLevel,
  getScholarAmount,
  currencyFormatter,
} from "@/lib/utils/awarding-utils";
import { ScholarDetailsDialog } from "./scholar-details-dialog";
import { GrantScholarshipButton } from "./grant-scholarship-button";

interface AwardingTableRowProps {
  application: AwardingApplication;
  canModifyAwards: boolean;
  updatingId: string | null;
  onGrant: (applicationId: string) => void;
}

function renderStatusBadge(status: AwardingStatus | null | undefined) {
  if (status === "GRANTED") {
    return (
      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
        Granted
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-orange-50 text-orange-700 border-orange-200"
    >
      Pending
    </Badge>
  );
}

export function AwardingTableRow({
  application,
  canModifyAwards,
  updatingId,
  onGrant,
}: AwardingTableRowProps) {
  const level = deriveLevel(application);
  const amount = getScholarAmount(level);
  const currentStatus =
    (application.status as AwardingStatus) ?? "APPROVED";

  return (
    <TableRow key={application.id}>
      <TableCell className="font-medium">
        {deriveFullName(application)}
        {application.User?.email && (
          <p className="text-xs text-gray-500">{application.User.email}</p>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {application.applicationType === "NEW" ? "New" : "Renewal"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-orange-600" />
          {formatLevel(level)}
        </div>
      </TableCell>
      <TableCell>{renderStatusBadge(currentStatus)}</TableCell>
      <TableCell className="font-semibold">
        {currencyFormatter.format(amount)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <ScholarDetailsDialog application={application} />
          {canModifyAwards && currentStatus !== "GRANTED" ? (
            <GrantScholarshipButton
              applicationId={application.id}
              isUpdating={updatingId === application.id}
              onGrant={onGrant}
            />
          ) : !canModifyAwards ? (
            <span className="text-sm text-gray-400 self-center">
              Locked · Past Period
            </span>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}


