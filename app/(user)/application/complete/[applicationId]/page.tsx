"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserSidebar } from "@/components/user-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { DocumentsUploadStep } from "@/components/application/documents-upload-step";
import { FileUploadConfirmationModal } from "@/components/application/file-upload-confirmation-modal";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import type { NewApplicationFormData } from "@/lib/validations";
import type {
  COGExtractionResponse,
  CORExtractionResponse,
} from "@/lib/services/document-extraction";

interface ExistingCertificate {
  id: string;
  fileUrl: string | null;
}

interface PersonalInfoSummary {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
}

interface ApplicationSummary {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "GRANTED";
  applicationType: string;
  CertificateOfGrades?: ExistingCertificate[];
  CertificateOfRegistration?: ExistingCertificate[];
  applicationDetails?: {
    personalInfo?: PersonalInfoSummary | null;
  } | null;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const buildCogDetails = (
  data: COGExtractionResponse | null
): Record<string, string> | null => {
  if (!data) return null;
  return {
    school: data.school ?? "",
    schoolYear: data.school_year ?? "",
    semester: data.semester ?? "",
    course: data.course ?? "",
    name: data.name ?? "",
    gwa: data.gwa !== null && data.gwa !== undefined ? data.gwa.toString() : "",
    totalUnits:
      data.total_units !== null && data.total_units !== undefined
        ? data.total_units.toString()
        : "",
  };
};

const buildCorDetails = (
  data: CORExtractionResponse | null
): Record<string, string> | null => {
  if (!data) return null;
  return {
    school: data.school ?? "",
    schoolYear: data.school_year ?? "",
    semester: data.semester ?? "",
    course: data.course ?? "",
    name: data.name ?? "",
    totalUnits:
      data.total_units !== null && data.total_units !== undefined
        ? data.total_units.toString()
        : "",
  };
};

export default function CompleteApplicationPage() {
  const params = useParams<{ applicationId: string }>();
  const applicationId = params?.applicationId;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState<ApplicationSummary | null>(
    null
  );
  const [existingCogDocument, setExistingCogDocument] =
    useState<ExistingCertificate | null>(null);
  const [existingCorDocument, setExistingCorDocument] =
    useState<ExistingCertificate | null>(null);
  const [cogUploadLocked, setCogUploadLocked] = useState(false);
  const [corUploadLocked, setCorUploadLocked] = useState(false);

  const [certificateOfGrades, setCertificateOfGrades] = useState<File | null>(
    null
  );
  const [certificateOfRegistration, setCertificateOfRegistration] =
    useState<File | null>(null);
  const [isCogProcessingDone, setIsCogProcessingDone] = useState(false);
  const [isCorProcessingDone, setIsCorProcessingDone] = useState(false);
  const [isCogInvalidFileType, setIsCogInvalidFileType] = useState(false);
  const [isCorInvalidFileType, setIsCorInvalidFileType] = useState(false);
  const [processedCogFile, setProcessedCogFile] = useState("");
  const [processedCorFile, setProcessedCorFile] = useState("");
  const [cogExtractedData, setCogExtractedData] =
    useState<COGExtractionResponse | null>(null);
  const [corExtractedData, setCorExtractedData] =
    useState<CORExtractionResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [pendingCogFile, setPendingCogFile] = useState<File | null>(null);
  const [pendingCorFile, setPendingCorFile] = useState<File | null>(null);
  const [currentFileType, setCurrentFileType] = useState<
    "Certificate of Grades" | "Certificate of Registration"
  >("Certificate of Grades");

  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NewApplicationFormData>();

  useEffect(() => {
    const fetchApplication = async () => {
      if (!applicationId) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/applications/${applicationId}/complete`
        );

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || "Failed to load application");
        }

        const data = (await response.json()) as {
          application: ApplicationSummary;
        };
        setApplication(data.application);
        setExistingCogDocument(
          data.application.CertificateOfGrades?.[0] ?? null
        );
        setExistingCorDocument(
          data.application.CertificateOfRegistration?.[0] ?? null
        );
        setCogUploadLocked(
          Boolean(data.application.CertificateOfGrades?.length)
        );
        setCorUploadLocked(
          Boolean(data.application.CertificateOfRegistration?.length)
        );
      } catch (error) {
        console.error("Failed to fetch application:", error);
        const message =
          error instanceof Error ? error.message : "Unable to load application";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  const documentsProcessing =
    (Boolean(certificateOfGrades) && !isCogProcessingDone) ||
    (Boolean(certificateOfRegistration) && !isCorProcessingDone);

  const {
    getRootProps: getRootPropsGrades,
    getInputProps: getInputPropsGrades,
    isDragActive: isDragActiveGrades,
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setPendingCogFile(acceptedFiles[0]);
        setCurrentFileType("Certificate of Grades");
        setConfirmationModalOpen(true);
      }
    },
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const {
    getRootProps: getRootPropsRegistration,
    getInputProps: getInputPropsRegistration,
    isDragActive: isDragActiveRegistration,
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setPendingCorFile(acceptedFiles[0]);
        setCurrentFileType("Certificate of Registration");
        setConfirmationModalOpen(true);
      }
    },
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const handleConfirmUpload = (): void => {
    if (pendingCogFile) {
      setCertificateOfGrades(pendingCogFile);
      setIsCogProcessingDone(false);
      setProcessedCogFile("");
      setCogUploadLocked(false);
      setPendingCogFile(null);
    } else if (pendingCorFile) {
      setCertificateOfRegistration(pendingCorFile);
      setIsCorProcessingDone(false);
      setProcessedCorFile("");
      setCorUploadLocked(false);
      setPendingCorFile(null);
    }
    setConfirmationModalOpen(false);
  };

  const handleCancelUpload = (): void => {
    setPendingCogFile(null);
    setPendingCorFile(null);
    setConfirmationModalOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!applicationId) return;

    // Check if at least one file is provided (either new upload or existing)
    const hasCog = certificateOfGrades || existingCogDocument?.fileUrl;
    const hasCor = certificateOfRegistration || existingCorDocument?.fileUrl;

    if (!hasCog && !hasCor) {
      toast.error(
        "Please upload at least one document (Certificate of Grades or Certificate of Registration)."
      );
      return;
    }

    if (documentsProcessing) {
      toast.error("Please wait until document processing finishes.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Record<string, unknown> = {};

      // Handle COG file - upload to Supabase first, fallback to base64
      if (certificateOfGrades) {
        const details = buildCogDetails(cogExtractedData);
        if (!details) {
          toast.error(
            "COG OCR must finish before you can submit. Please retry."
          );
          setIsSubmitting(false);
          return;
        }

        console.log("📤 Uploading COG file to Supabase...");
        const { uploadFileToSupabase } = await import(
          "@/lib/utils/file-upload"
        );
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        
        if (user?.email) {
          const { data: userData } = await supabase
            .from("User")
            .select("id")
            .eq("email", user.email)
            .single();
          
          if (userData) {
            try {
              const cogFileUrl = await uploadFileToSupabase(
                certificateOfGrades,
                userData.id,
                applicationId,
                "cog"
              );
              console.log("✅ COG uploaded to Supabase:", cogFileUrl);
              payload.cogFileUrl = cogFileUrl;
            } catch (uploadError) {
              console.warn("⚠️ Supabase upload failed, falling back to base64:", uploadError);
              payload.cogFile = await fileToBase64(certificateOfGrades);
              console.log("✅ COG converted to base64 (fallback)");
            }
          } else {
            console.warn("⚠️ User data not found, falling back to base64");
            payload.cogFile = await fileToBase64(certificateOfGrades);
          }
        } else {
          console.warn("⚠️ User not authenticated, falling back to base64");
          payload.cogFile = await fileToBase64(certificateOfGrades);
        }

        payload.cogFileName = certificateOfGrades.name;
        payload.cogDetails = details;
      }

      // Handle COR file - upload to Supabase first, fallback to base64
      if (certificateOfRegistration) {
        const details = buildCorDetails(corExtractedData);
        if (!details) {
          toast.error(
            "COR OCR must finish before you can submit. Please retry."
          );
          setIsSubmitting(false);
          return;
        }

        console.log("📤 Uploading COR file to Supabase...");
        const { uploadFileToSupabase } = await import(
          "@/lib/utils/file-upload"
        );
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        
        if (user?.email) {
          const { data: userData } = await supabase
            .from("User")
            .select("id")
            .eq("email", user.email)
            .single();
          
          if (userData) {
            try {
              const corFileUrl = await uploadFileToSupabase(
                certificateOfRegistration,
                userData.id,
                applicationId,
                "cor"
              );
              console.log("✅ COR uploaded to Supabase:", corFileUrl);
              payload.corFileUrl = corFileUrl;
            } catch (uploadError) {
              console.warn("⚠️ Supabase upload failed, falling back to base64:", uploadError);
              payload.corFile = await fileToBase64(certificateOfRegistration);
              console.log("✅ COR converted to base64 (fallback)");
            }
          } else {
            console.warn("⚠️ User data not found, falling back to base64");
            payload.corFile = await fileToBase64(certificateOfRegistration);
          }
        } else {
          console.warn("⚠️ User not authenticated, falling back to base64");
          payload.corFile = await fileToBase64(certificateOfRegistration);
        }

        payload.corFileName = certificateOfRegistration.name;
        payload.corDetails = details;
      }

      const response = await fetch(
        `/api/applications/${applicationId}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update application");
      }

      // Show appropriate message based on status
      const message =
        result.message ||
        (result.status === "APPROVED"
          ? "Documents uploaded! Application has been approved."
          : "Document uploaded! Application remains pending until both documents are uploaded.");

      toast.success(message);

      // Always redirect to history page after submission
      router.push("/history");
    } catch (error) {
      console.error("Completion error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Unable to complete application";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      );
    }

    if (!application) {
      return (
        <Card>
          <CardContent className="py-10 text-center text-gray-600">
            Unable to find this application.
          </CardContent>
        </Card>
      );
    }

    if (application.status !== "PENDING") {
      return (
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <p className="text-lg font-semibold">
              This application is no longer pending.
            </p>
            <p className="text-gray-600">
              Only pending applications can be updated. Current status:{" "}
              <span className="font-medium">{application.status}</span>.
            </p>
            <Button onClick={() => router.push("/history")}>
              Back to History
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Application</CardTitle>
            <CardDescription>
              Upload the missing documents below. You can upload one file at a
              time. We&apos;ll run OCR automatically and your application will
              be approved once both documents are uploaded.
            </CardDescription>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {(() => {
            const personalInfo =
              (application.applicationDetails?.personalInfo as
                | {
                    firstName?: string;
                    middleName?: string;
                    lastName?: string;
                  }
                | undefined) ?? null;
            const applicantName = personalInfo
              ? [
                  personalInfo.lastName,
                  personalInfo.firstName,
                  personalInfo.middleName
                    ? `${personalInfo.middleName.charAt(0).toUpperCase()}.`
                    : "",
                ]
                  .filter(Boolean)
                  .join(", ")
                  .replace(", ,", ",")
              : null;

            return (
              <DocumentsUploadStep<NewApplicationFormData>
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
                certificateOfGrades={certificateOfGrades}
                certificateOfRegistration={certificateOfRegistration}
                getRootPropsGrades={getRootPropsGrades}
                getInputPropsGrades={getInputPropsGrades}
                isDragActiveGrades={isDragActiveGrades}
                getRootPropsRegistration={getRootPropsRegistration}
                getInputPropsRegistration={getInputPropsRegistration}
                isDragActiveRegistration={isDragActiveRegistration}
                onRemoveGradesFile={() => {
                  setCertificateOfGrades(null);
                  setIsCogProcessingDone(false);
                  setProcessedCogFile("");
                  setCogExtractedData(null);
                }}
                onRemoveRegistrationFile={() => {
                  setCertificateOfRegistration(null);
                  setIsCorProcessingDone(false);
                  setProcessedCorFile("");
                  setCorExtractedData(null);
                }}
                isCogProcessingDone={isCogProcessingDone}
                setIsCogProcessingDone={setIsCogProcessingDone}
                isCorProcessingDone={isCorProcessingDone}
                setIsCorProcessingDone={setIsCorProcessingDone}
                processedCogFile={processedCogFile}
                setProcessedCogFile={setProcessedCogFile}
                processedCorFile={processedCorFile}
                setProcessedCorFile={setProcessedCorFile}
                onCogOcrChange={(text, data) => {
                  setCogExtractedData(data);
                }}
                onCorOcrChange={(text, data) => {
                  setCorExtractedData(data);
                }}
                existingCogFileUrl={existingCogDocument?.fileUrl || null}
                existingCorFileUrl={existingCorDocument?.fileUrl || null}
                cogUploadLocked={cogUploadLocked}
                corUploadLocked={corUploadLocked}
                onUnlockCogUpload={() => setCogUploadLocked(false)}
                onUnlockCorUpload={() => setCorUploadLocked(false)}
                onCogInvalidFileTypeChange={setIsCogInvalidFileType}
                onCorInvalidFileTypeChange={setIsCorInvalidFileType}
                applicantName={applicantName}
              />
            );
          })()}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                documentsProcessing ||
                isCogInvalidFileType ||
                isCorInvalidFileType
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Documents"
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar />
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6 max-w-5xl mx-auto">{renderContent()}</div>
      </div>

      {/* File Upload Confirmation Modal */}
      <FileUploadConfirmationModal
        isOpen={confirmationModalOpen}
        onConfirm={handleConfirmUpload}
        onCancel={handleCancelUpload}
        fileName={pendingCogFile?.name || pendingCorFile?.name || ""}
        fileType={currentFileType}
      />
    </div>
  );
}
