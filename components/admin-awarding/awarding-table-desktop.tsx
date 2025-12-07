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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Award, CheckCircle, Eye, GraduationCap } from "lucide-react";
import type {
  AwardingApplication,
  AwardingStatus,
  LevelFilter,
} from "@/types/components";

interface AwardingTableDesktopProps {
  applications: AwardingApplication[];
  deriveFullName: (app: AwardingApplication) => string;
  deriveLevel: (app: AwardingApplication) => LevelFilter;
  getScholarAmount: (level: LevelFilter) => number;
  formatLevel: (level: LevelFilter) => string;
  formatDateTime: (date: string) => string;
  currencyFormatter: Intl.NumberFormat;
  renderStatusBadge: (
    status: AwardingStatus | null | undefined
  ) => React.ReactNode;
  canModifyAwards: boolean;
  updatingId: string | null;
  confirmGrantId: string | null;
  setConfirmGrantId: (id: string | null) => void;
  handleGrantScholarship: (id: string) => void;
}

export function AwardingTableDesktop({
  applications,
  deriveFullName,
  deriveLevel,
  getScholarAmount,
  formatLevel,
  formatDateTime,
  currencyFormatter,
  renderStatusBadge,
  canModifyAwards,
  updatingId,
  confirmGrantId,
  setConfirmGrantId,
  handleGrantScholarship,
}: AwardingTableDesktopProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application) => {
          const level = deriveLevel(application);
          const amount = getScholarAmount(level);
          const currentStatus = application.status ?? "APPROVED";

          return (
            <TableRow key={application.id}>
              <TableCell className="font-medium">
                {deriveFullName(application)}
                {application.User?.email && (
                  <p className="text-xs text-gray-500">
                    {application.User.email}
                  </p>
                )}
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
                            <p className="font-medium">
                              {deriveFullName(application)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">
                              {application.User?.email ?? "—"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Level</p>
                          <p className="font-medium">{formatLevel(level)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Amount</p>
                            <p className="font-medium">
                              {currencyFormatter.format(amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-medium">
                              {currentStatus === "GRANTED"
                                ? "Granted"
                                : "Pending"}
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
                  {canModifyAwards && currentStatus !== "GRANTED" ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        onClick={() => setConfirmGrantId(application.id)}
                        disabled={updatingId === application.id}
                        title="Grant Scholarship"
                      >
                        {updatingId === application.id ? (
                          <span className="flex items-center gap-2 text-xs font-medium text-orange-600">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-orange-300 border-t-transparent" />
                          </span>
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </Button>
                      <AlertDialog
                        open={confirmGrantId === application.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setConfirmGrantId(null);
                          }
                        }}
                      >
                        <AlertDialogContent className="border border-orange-100 bg-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-gray-900">
                              <CheckCircle className="w-5 h-5 text-orange-600" />
                              Confirm Grant Scholarship
                            </AlertDialogTitle>
                            <AlertDialogDescription className="pt-2 text-gray-600">
                              Are you sure you want to grant the scholarship to{" "}
                              <span className="font-semibold text-gray-900">
                                {deriveFullName(application)}
                              </span>
                              ?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="py-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-semibold text-gray-900">
                                {currencyFormatter.format(amount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Level:</span>
                              <span className="font-semibold text-gray-900">
                                {formatLevel(level)}
                              </span>
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleGrantScholarship(application.id)
                              }
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              Confirm Grant
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : !canModifyAwards ? (
                    <span className="text-sm text-gray-400 self-center">
                      Locked · Past Period
                    </span>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
