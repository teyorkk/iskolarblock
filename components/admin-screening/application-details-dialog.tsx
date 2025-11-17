"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, FileText, ExternalLink, MapPin, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

interface ApplicationDetailsDialogProps {
  applicationId: string | null;
  open: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

interface PersonalInfo {
  lastName: string;
  firstName: string;
  middleName?: string | null;
  dateOfBirth: string;
  placeOfBirth: string;
  age: string;
  sex: "male" | "female";
  houseNumber: string;
  purok: string;
  barangay: string;
  municipality: string;
  province: string;
  citizenship: string;
  contactNumber: string;
  religion: string;
  course: string;
  yearLevel: string;
}

interface ApplicationData {
  id: string;
  status: string;
  applicationType: string;
  createdAt: string;
  applicationDetails?:
    | {
        personalInfo?: PersonalInfo;
      }
    | PersonalInfo
    | null;
  User: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  CertificateOfGrades?: Array<{
    id: string;
    school: string;
    schoolYear: string;
    semester: string;
    course: string;
    name: string;
    gwa: number;
    totalUnits: number;
    fileUrl?: string | null;
  }>;
  CertificateOfRegistration?: Array<{
    id: string;
    school: string;
    schoolYear: string;
    semester: string;
    course: string;
    name: string;
    totalUnits: number;
    fileUrl?: string | null;
  }>;
  BlockchainRecord?:
    | Array<{
        id: string;
        transactionHash: string | null;
      }>
    | {
        id: string;
        transactionHash: string | null;
      }
    | null;
}

const BLOCKCHAIN_EXPLORER_BASE_URL =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL
    ? process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL
    : "https://www.oklink.com/amoy/tx/";

function buildBlockchainExplorerUrl(hash?: string | null) {
  if (!hash) return null;
  const base = BLOCKCHAIN_EXPLORER_BASE_URL.endsWith("/")
    ? BLOCKCHAIN_EXPLORER_BASE_URL
    : `${BLOCKCHAIN_EXPLORER_BASE_URL}/`;
  return `${base}${hash}`;
}

export function ApplicationDetailsDialog({
  applicationId,
  open,
  onClose,
  onStatusUpdate,
}: ApplicationDetailsDialogProps) {
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (open && applicationId) {
      void fetchApplicationDetails();
    }
  }, [open, applicationId]);

  const fetchApplicationDetails = async () => {
    if (!applicationId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`);
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to fetch application details");
        return;
      }

      setApplication(data.application);
    } catch (error) {
      console.error("Error fetching application:", error);
      toast.error("An error occurred while fetching application details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!applicationId) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update application status");
        return;
      }

      toast.success(`Application ${newStatus.toLowerCase()} successfully`);
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("An error occurred while updating application status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "GRANTED":
        return "bg-purple-100 text-purple-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const personalInfo = (() => {
    const details = application?.applicationDetails;
    if (!details) return null;
    if (typeof details === "object" && "personalInfo" in details) {
      return (details as { personalInfo?: PersonalInfo }).personalInfo ?? null;
    }
    return details as PersonalInfo;
  })();
  const cog = application?.CertificateOfGrades?.[0];
  const cor = application?.CertificateOfRegistration?.[0];
  const blockchainRecord = (() => {
    const record = application?.BlockchainRecord;
    if (!record) return null;
    return Array.isArray(record) ? record[0] ?? null : record;
  })();
  const blockchainDisplayHash =
    blockchainRecord?.transactionHash ?? blockchainRecord?.id ?? "";
  const isActionDisabled =
    application?.status === "APPROVED" || application?.status === "GRANTED";

  // Helper function to check if value is null/empty
  const hasValue = (value: string | number | null | undefined): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim() !== "";
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            Review application information and update status
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : application ? (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Status and Type */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(application.status)}>
                  {application.status}
                </Badge>
                <Badge variant="outline">{application.applicationType}</Badge>
              </div>
              <p className="text-sm text-gray-500">
                Submitted: {formatDate(application.createdAt)}
              </p>
            </div>

            <Separator className="mb-4" />

            {/* Tabs */}
            <Tabs
              defaultValue="personal"
              className="flex-1 flex flex-col min-h-0"
            >
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger
                  value="personal"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-orange-500" />
                </TabsTrigger>
                <TabsTrigger value="cog" className="flex items-center gap-2">
                  <FileText className=" text-orange-500 w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="cor" className="flex items-center gap-2">
                  <FileText className=" text-orange-500 w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent
                value="personal"
                className="flex-1 overflow-y-auto space-y-4 pr-1"
              >
                {personalInfo ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-6 rounded-lg space-y-4 border border-gray-200">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-orange-500" />
                        Personal Information
                      </h3>

                      {/* Full Name */}
                      {(hasValue(personalInfo.firstName) ||
                        hasValue(personalInfo.lastName)) && (
                        <div className="bg-white p-3 rounded-md">
                          <p className="text-sm text-gray-600 mb-1">
                            Full Name
                          </p>
                          <p className="font-medium text-lg">
                            {personalInfo.firstName}{" "}
                            {hasValue(personalInfo.middleName) &&
                              `${personalInfo.middleName} `}
                            {personalInfo.lastName}
                          </p>
                        </div>
                      )}

                      {/* Basic Information Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hasValue(personalInfo.dateOfBirth) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">
                              Date of Birth
                            </p>
                            <p className="font-medium">
                              {formatDate(personalInfo.dateOfBirth)}
                            </p>
                          </div>
                        )}
                        {hasValue(personalInfo.placeOfBirth) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">
                              Place of Birth
                            </p>
                            <p className="font-medium">
                              {personalInfo.placeOfBirth}
                            </p>
                          </div>
                        )}
                        {hasValue(personalInfo.age) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">Age</p>
                            <p className="font-medium">{personalInfo.age}</p>
                          </div>
                        )}
                        {hasValue(personalInfo.sex) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">Sex</p>
                            <p className="font-medium capitalize">
                              {personalInfo.sex}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Residential Address */}
                      {(hasValue(personalInfo.houseNumber) ||
                        hasValue(personalInfo.purok) ||
                        hasValue(personalInfo.barangay) ||
                        hasValue(personalInfo.municipality) ||
                        hasValue(personalInfo.province)) && (
                        <div className="bg-white p-3 rounded-md">
                          <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Residential Address
                          </p>
                          <p className="font-medium">
                            {[
                              personalInfo.houseNumber,
                              personalInfo.purok,
                              personalInfo.barangay,
                              personalInfo.municipality,
                              personalInfo.province,
                            ]
                              .filter((part) => hasValue(part))
                              .join(", ")}
                          </p>
                        </div>
                      )}

                      {/* Additional Information Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hasValue(personalInfo.citizenship) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">
                              Citizenship
                            </p>
                            <p className="font-medium">
                              {personalInfo.citizenship}
                            </p>
                          </div>
                        )}
                        {hasValue(personalInfo.contactNumber) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Contact Number
                            </p>
                            <p className="font-medium">
                              {personalInfo.contactNumber}
                            </p>
                          </div>
                        )}
                        {hasValue(personalInfo.course) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">
                              Course/Strand
                            </p>
                            <p className="font-medium">{personalInfo.course}</p>
                          </div>
                        )}
                        {hasValue(personalInfo.religion) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">
                              Religion
                            </p>
                            <p className="font-medium">
                              {personalInfo.religion}
                            </p>
                          </div>
                        )}
                        {hasValue(personalInfo.yearLevel) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">
                              Year Level
                            </p>
                            <p className="font-medium">
                              {personalInfo.yearLevel}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No personal information available
                  </div>
                )}
              </TabsContent>

              {/* Certificate of Grades Tab */}
              <TabsContent
                value="cog"
                className="flex-1 overflow-y-auto space-y-4 pr-1"
              >
                {cog ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-6 rounded-lg space-y-4 border border-gray-200">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-500" />
                        Certificate of Grades Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hasValue(cog.school) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">School</p>
                            <p className="font-medium">{cog.school}</p>
                          </div>
                        )}
                        {hasValue(cog.schoolYear) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">
                              School Year
                            </p>
                            <p className="font-medium">{cog.schoolYear}</p>
                          </div>
                        )}
                        {hasValue(cog.semester) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">
                              Semester
                            </p>
                            <p className="font-medium">{cog.semester}</p>
                          </div>
                        )}
                        {hasValue(cog.gwa) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">GWA</p>
                            <p className="font-medium text-lg">
                              {cog.gwa.toFixed(2)}
                            </p>
                          </div>
                        )}
                        {hasValue(cog.totalUnits) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">
                              Total Units
                            </p>
                            <p className="font-medium">{cog.totalUnits}</p>
                          </div>
                        )}
                      </div>

                      {hasValue(cog.fileUrl) && (
                        <div className="pt-4 border-t border-gray-300">
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto bg-white hover:bg-gray-50"
                            onClick={() => window.open(cog.fileUrl!, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Document
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No Certificate of Grades available
                  </div>
                )}
              </TabsContent>

              {/* Certificate of Registration Tab */}
              <TabsContent
                value="cor"
                className="flex-1 overflow-y-auto space-y-4 pr-1"
              >
                {cor ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-6 rounded-lg space-y-4 border border-gray-200">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-500" />
                        Certificate of Registration Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hasValue(cor.school) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">School</p>
                            <p className="font-medium">{cor.school}</p>
                          </div>
                        )}
                        {hasValue(cor.schoolYear) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">
                              School Year
                            </p>
                            <p className="font-medium">{cor.schoolYear}</p>
                          </div>
                        )}
                        {hasValue(cor.semester) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">
                              Semester
                            </p>
                            <p className="font-medium">{cor.semester}</p>
                          </div>
                        )}
                        {hasValue(cor.totalUnits) && (
                          <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-1">
                              Total Units
                            </p>
                            <p className="font-medium">{cor.totalUnits}</p>
                          </div>
                        )}
                      </div>

                      {hasValue(cor.fileUrl) && (
                        <div className="pt-4 border-t border-gray-300">
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto bg-white hover:bg-gray-50"
                            onClick={() => window.open(cor.fileUrl!, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Document
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No Certificate of Registration available
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {blockchainRecord && blockchainDisplayHash && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Blockchain Record
                  </p>
                  <p className="font-mono text-sm text-gray-900 truncate max-w-[240px]">
                    {blockchainDisplayHash}
                  </p>
                </div>
                {buildBlockchainExplorerUrl(
                  blockchainRecord.transactionHash
                ) ? (
                  <a
                    href={
                      buildBlockchainExplorerUrl(
                        blockchainRecord.transactionHash
                      ) ?? "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                  >
                    View
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">
                    No hash available
                  </span>
                )}
              </div>
            )}

            <Separator className="my-4" />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 flex-wrap">
              {!isActionDisabled && (
                <>
                  {application.status !== "PENDING" && (
                    <Button
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      onClick={() => handleStatusUpdate("PENDING")}
                      disabled={isUpdating}
                    >
                      Move to Pending
                    </Button>
                  )}
                  {application.status !== "APPROVED" && (
                    <Button
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleStatusUpdate("APPROVED")}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {application.status !== "REJECTED" && (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleStatusUpdate("REJECTED")}
                      disabled={isUpdating}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No application data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
