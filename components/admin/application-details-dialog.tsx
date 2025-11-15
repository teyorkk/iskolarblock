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
import { X, User, Mail, Phone, MapPin, FileText, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface ApplicationDetailsDialogProps {
  applicationId: string | null;
  open: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

interface ApplicationData {
  id: string;
  status: string;
  applicationType: string;
  createdAt: string;
  applicationDetails: {
    personalInfo?: {
      firstName: string;
      middleName?: string;
      lastName: string;
      dateOfBirth: string;
      placeOfBirth: string;
      gender: string;
      civilStatus: string;
      citizenship: string;
    };
  };
  id_image?: string;
  face_scan_image?: string;
  User: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  CertificateOfGrades?: Array<{
    school: string;
    schoolYear: string;
    semester: string;
    course: string;
    gwa: number;
    fileUrl?: string;
  }>;
  CertificateOfRegistration?: Array<{
    school: string;
    schoolYear: string;
    semester: string;
    course: string;
    fileUrl?: string;
  }>;
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
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-700";
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
          <div className="space-y-6">
            {/* Status and Type */}
            <div className="flex items-center justify-between">
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

            <Separator />

            {/* User Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Applicant Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{application.User.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{application.User.email}</p>
                  </div>
                </div>
                {application.User.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{application.User.phone}</p>
                    </div>
                  </div>
                )}
                {application.User.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{application.User.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information from Application Details */}
            {application.applicationDetails?.personalInfo && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-3">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium">
                        {application.applicationDetails.personalInfo.firstName}{" "}
                        {application.applicationDetails.personalInfo.middleName}{" "}
                        {application.applicationDetails.personalInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">
                        {formatDate(application.applicationDetails.personalInfo.dateOfBirth)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Place of Birth</p>
                      <p className="font-medium">
                        {application.applicationDetails.personalInfo.placeOfBirth}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium">
                        {application.applicationDetails.personalInfo.gender}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Civil Status</p>
                      <p className="font-medium">
                        {application.applicationDetails.personalInfo.civilStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Citizenship</p>
                      <p className="font-medium">
                        {application.applicationDetails.personalInfo.citizenship}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Certificate of Grades */}
            {application.CertificateOfGrades && application.CertificateOfGrades.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Certificate of Grades
                  </h3>
                  {application.CertificateOfGrades.map((cog, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">School</p>
                          <p className="font-medium">{cog.school}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">School Year</p>
                          <p className="font-medium">{cog.schoolYear}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Semester</p>
                          <p className="font-medium">{cog.semester}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">GWA</p>
                          <p className="font-medium">{cog.gwa.toFixed(2)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Course</p>
                        <p className="font-medium">{cog.course}</p>
                      </div>
                      {cog.fileUrl && (
                        <a
                          href={cog.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-orange-600 hover:underline"
                        >
                          View Document
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Certificate of Registration */}
            {application.CertificateOfRegistration &&
              application.CertificateOfRegistration.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Certificate of Registration
                    </h3>
                    {application.CertificateOfRegistration.map((cor, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">School</p>
                            <p className="font-medium">{cor.school}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">School Year</p>
                            <p className="font-medium">{cor.schoolYear}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Semester</p>
                            <p className="font-medium">{cor.semester}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Course</p>
                          <p className="font-medium">{cor.course}</p>
                        </div>
                        {cor.fileUrl && (
                          <a
                            href={cor.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-orange-600 hover:underline"
                          >
                            View Document
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

            {/* ID and Face Scan Images */}
            {(application.id_image || application.face_scan_image) && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-3">Uploaded Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.id_image && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">ID Image</p>
                        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={application.id_image}
                            alt="ID"
                            fill
                            className="object-contain"
                            quality={85}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}
                    {application.face_scan_image && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Face Scan</p>
                        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={application.face_scan_image}
                            alt="Face Scan"
                            fill
                            className="object-contain"
                            quality={85}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              {application.status === "PENDING" && (
                <>
                  <Button
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    onClick={() => handleStatusUpdate("UNDER_REVIEW")}
                    disabled={isUpdating}
                  >
                    Mark as Under Review
                  </Button>
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => handleStatusUpdate("APPROVED")}
                    disabled={isUpdating}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleStatusUpdate("REJECTED")}
                    disabled={isUpdating}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
              {application.status === "UNDER_REVIEW" && (
                <>
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => handleStatusUpdate("APPROVED")}
                    disabled={isUpdating}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleStatusUpdate("REJECTED")}
                    disabled={isUpdating}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
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

