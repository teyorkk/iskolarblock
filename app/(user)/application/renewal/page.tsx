"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserSidebar } from "@/components/user-sidebar";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  renewalApplicationSchema,
  type RenewalApplicationFormData,
} from "@/lib/validations";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { renewalApplicationSteps } from "@/lib/constants/application-steps";
import { ApplicationProgress } from "@/components/application/application-progress";
import { IdUploadStep } from "@/components/application/id-upload-step";
import { PersonalInfoStepPart1 } from "@/components/application/personal-info-step-part1";
import { PersonalInfoStepPart2 } from "@/components/application/personal-info-step-part2";
import { DocumentsUploadStep } from "@/components/application/documents-upload-step";
import { ApplicationSuccess } from "@/components/application/application-success";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSession } from "@/components/session-provider";
import { FileUploadConfirmationModal } from "@/components/application/file-upload-confirmation-modal";
import { StepErrorBoundary } from "@/components/application/error-boundary";
import type {
  COGExtractionResponse,
  CORExtractionResponse,
} from "@/lib/services/document-extraction";

export default function RenewalApplicationPage() {
  const router = useRouter();
  const { user } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<
    "PENDING" | "APPROVED"
  >("PENDING");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isIdProcessingDone, setIsIdProcessingDone] = useState<boolean>(false);
  const [processedIdFile, setProcessedIdFile] = useState<string>("");
  const [certificateOfGrades, setCertificateOfGrades] = useState<File | null>(
    null
  );
  const [isCogProcessingDone, setIsCogProcessingDone] =
    useState<boolean>(false);
  const [certificateOfRegistration, setCertificateOfRegistration] =
    useState<File | null>(null);
  const [isCorProcessingDone, setIsCorProcessingDone] =
    useState<boolean>(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApplicationId, setSubmittedApplicationId] = useState<
    string | null
  >(null);
  const [isPageLocked, setIsPageLocked] = useState(false);
  const [lockReason, setLockReason] = useState<string | null>(null);
  const [lockStatus, setLockStatus] = useState<string | null>(null);

  // Track OCR data and images for submission
  const [idOcrText, setIdOcrText] = useState<string>("");
  const [cogOcrText, setCogOcrText] = useState<string>("");
  const [cogExtractedData, setCogExtractedData] =
    useState<COGExtractionResponse | null>(null);
  const [cogFileUrl, setCogFileUrl] = useState<string>("");
  const [corOcrText, setCorOcrText] = useState<string>("");
  const [corExtractedData, setCorExtractedData] =
    useState<CORExtractionResponse | null>(null);
  const [corFileUrl, setCorFileUrl] = useState<string>("");

  // Track processed files to prevent reprocessing
  const [processedCogFile, setProcessedCogFile] = useState<string>("");
  const [processedCorFile, setProcessedCorFile] = useState<string>("");

  // Pending files for confirmation
  const [pendingIdFile, setPendingIdFile] = useState<File | null>(null);
  const [pendingCogFile, setPendingCogFile] = useState<File | null>(null);
  const [pendingCorFile, setPendingCorFile] = useState<File | null>(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [currentFileType, setCurrentFileType] = useState<
    "ID Document" | "Certificate of Grades" | "Certificate of Registration"
  >("ID Document");
  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const documentsProcessing =
    (Boolean(certificateOfGrades) && !isCogProcessingDone) ||
    (Boolean(certificateOfRegistration) && !isCorProcessingDone);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RenewalApplicationFormData>({
    resolver: zodResolver(renewalApplicationSchema),
  });

  // Check if user is eligible for renewal
  useEffect(() => {
    async function checkRenewalEligibility() {
      if (!user) {
        setIsCheckingEligibility(false);
        setIsPageLocked(true);
        setLockReason("Please sign in to continue.");
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const { data: periodData, error: periodError } = await supabase
          .from("ApplicationPeriod")
          .select("id")
          .eq("isOpen", true)
          .order("createdAt", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (periodError) {
          throw periodError;
        }

        if (!periodData) {
          setIsPageLocked(true);
          setLockReason("No application cycle is currently open.");
          setLockStatus(null);
          setIsCheckingEligibility(false);
          return;
        }

        const { data, error } = await supabase
          .from("Application")
          .select("id, status, applicationPeriodId")
          .eq("userId", user.id);

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          setIsPageLocked(true);
          setLockReason(
            "You need to have a previous application before you can submit a renewal."
          );
          setLockStatus(null);
          setIsCheckingEligibility(false);
          return;
        }

        const currentApplication = data.find(
          (app) => app.applicationPeriodId === periodData.id
        );

        if (currentApplication) {
          // User already submitted for current period, redirect to /application
          router.push("/application");
          return;
        }

        setIsPageLocked(false);
        setLockReason(null);
        setLockStatus(null);
        setIsCheckingEligibility(false);
      } catch (error) {
        console.error("Unexpected error checking renewal eligibility:", error);
        setIsPageLocked(true);
        setLockReason(
          "We couldn't verify your eligibility right now. Please try again later."
        );
        setLockStatus(null);
        setIsCheckingEligibility(false);
      }
    }

    void checkRenewalEligibility();
  }, [user, router]);

  const onDrop = (acceptedFiles: File[]): void => {
    if (acceptedFiles.length > 0) {
      setPendingIdFile(acceptedFiles[0]);
      setCurrentFileType("ID Document");
      setConfirmationModalOpen(true);
    }
  };

  const onDropGrades = (acceptedFiles: File[]): void => {
    if (acceptedFiles.length > 0) {
      setPendingCogFile(acceptedFiles[0]);
      setCurrentFileType("Certificate of Grades");
      setConfirmationModalOpen(true);
    }
  };

  const onDropRegistration = (acceptedFiles: File[]): void => {
    if (acceptedFiles.length > 0) {
      setPendingCorFile(acceptedFiles[0]);
      setCurrentFileType("Certificate of Registration");
      setConfirmationModalOpen(true);
    }
  };

  const handleConfirmUpload = (): void => {
    if (pendingIdFile) {
      setUploadedFile(pendingIdFile);
      // Reset processing state for new file
      setIsIdProcessingDone(false);
      setProcessedIdFile("");
      setPendingIdFile(null);
    } else if (pendingCogFile) {
      setCertificateOfGrades(pendingCogFile);
      // Reset processing state for new file
      setIsCogProcessingDone(false);
      setProcessedCogFile("");
      setPendingCogFile(null);
    } else if (pendingCorFile) {
      setCertificateOfRegistration(pendingCorFile);
      // Reset processing state for new file
      setIsCorProcessingDone(false);
      setProcessedCorFile("");
      setPendingCorFile(null);
    }
    setConfirmationModalOpen(false);
  };

  const handleCancelUpload = (): void => {
    setPendingIdFile(null);
    setPendingCogFile(null);
    setPendingCorFile(null);
    setConfirmationModalOpen(false);
  };

  const handleRemoveIdFile = (): void => {
    setUploadedFile(null);
    setIsIdProcessingDone(false);
    setProcessedIdFile("");
  };

  const handleRemoveGradesFile = (): void => {
    setCertificateOfGrades(null);
    setIsCogProcessingDone(false);
    setProcessedCogFile("");
  };

  const handleRemoveRegistrationFile = (): void => {
    setCertificateOfRegistration(null);
    setIsCorProcessingDone(false);
    setProcessedCorFile("");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const {
    getRootProps: getRootPropsGrades,
    getInputProps: getInputPropsGrades,
    isDragActive: isDragActiveGrades,
  } = useDropzone({
    onDrop: onDropGrades,
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
    onDrop: onDropRegistration,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const onSubmit = async (data: RenewalApplicationFormData): Promise<void> => {
    console.log("🚀 Renewal submission called");
    try {
      setIsSubmitting(true);

      // Convert ID file to base64
      let idImageBase64 = "";
      if (uploadedFile) {
        idImageBase64 = await readFileAsBase64(uploadedFile);
      }

      let cogFileBase64: string | null = null;
      if (certificateOfGrades) {
        try {
          cogFileBase64 = await readFileAsBase64(certificateOfGrades);
        } catch (error) {
          console.error("COG file conversion error:", error);
          toast.error("Failed to read Certificate of Grades file");
          setIsSubmitting(false);
          return;
        }
      }

      let corFileBase64: string | null = null;
      if (certificateOfRegistration) {
        try {
          corFileBase64 = await readFileAsBase64(certificateOfRegistration);
        } catch (error) {
          console.error("COR file conversion error:", error);
          toast.error("Failed to read Certificate of Registration file");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare submission data with personal info
      const submissionData = {
        personalInfo: {
          lastName: data.lastName,
          firstName: data.firstName,
          middleName: data.middleName || null,
          dateOfBirth: data.dateOfBirth,
          placeOfBirth: data.placeOfBirth,
          age: data.age,
          sex: data.sex,
          houseNumber: data.houseNumber,
          purok: data.purok,
          barangay: data.barangay,
          municipality: data.municipality,
          province: data.province,
          citizenship: data.citizenship,
          contactNumber: data.contactNumber,
          religion: data.religion,
          course: data.course,
          yearLevel: data.yearLevel,
        },
        idImage: idImageBase64,
        idOcr: {
          rawText: idOcrText,
        },
        cogOcr: {
          rawText: cogOcrText || "",
          extractedData: cogExtractedData || null,
          fileUrl: cogFileUrl || undefined,
        },
        corOcr: {
          rawText: corOcrText || "",
          extractedData: corExtractedData || null,
          fileUrl: corFileUrl || undefined,
        },
        cogFile: cogFileBase64,
        corFile: corFileBase64,
        cogFileName: certificateOfGrades?.name ?? null,
        corFileName: certificateOfRegistration?.name ?? null,
      };

      const response = await fetch("/api/applications/renew", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit renewal application");
      }

      const result = await response.json();
      const resultingStatus =
        typeof result.status === "string" ? result.status : "PENDING";
      setSubmittedApplicationId(result.applicationId || `SCH-${Date.now()}`);
      setSubmittedStatus(
        resultingStatus === "APPROVED" ? "APPROVED" : "PENDING"
      );
      setIsSubmitted(true);
      setIsSubmitting(false);
      toast.success(
        resultingStatus === "APPROVED"
          ? "Renewal approved instantly!"
          : "Renewal application submitted!",
        {
          description:
            resultingStatus === "APPROVED"
              ? "All required documents were provided."
              : "Missing documents detected. Submit the rest to move from Pending to Approved.",
        }
      );

      // Redirect to /application after successful submission
      setTimeout(() => {
        router.push("/application");
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit renewal application";
      toast.error(errorMessage);
      console.error("Renewal submission error:", error);
    }
  };

  const getFirstErrorMessage = (
    validationErrors: FieldErrors<RenewalApplicationFormData>
  ): string | null => {
    for (const candidate of Object.values(validationErrors)) {
      if (
        candidate &&
        typeof candidate === "object" &&
        "message" in candidate &&
        candidate.message
      ) {
        return String(candidate.message);
      }
    }
    return null;
  };

  const handleValidationErrors = (
    validationErrors: FieldErrors<RenewalApplicationFormData>
  ): void => {
    const message =
      getFirstErrorMessage(validationErrors) ||
      "Please review your information and correct any highlighted fields.";
    toast.error("Unable to submit application", {
      description: message,
    });
  };

  const nextStep = (): void => {
    if (currentStep < renewalApplicationSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === renewalApplicationSteps.length;

  // Show loading while checking eligibility
  if (isCheckingEligibility) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
          <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying renewal eligibility...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isPageLocked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
          <div className="p-4 md:p-6 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Renewal Unavailable
                </CardTitle>
                <CardDescription>
                  {lockReason ||
                    "Renewal submissions are unavailable at the moment."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lockStatus && (
                  <p className="text-sm text-gray-600">
                    Current application status:{" "}
                    <span className="font-semibold">{lockStatus}</span>
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => router.push("/history")}>
                    View Application History
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/application")}
                  >
                    Back to Application Options
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted && submittedApplicationId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
          <div className="p-4 md:p-6">
            <ApplicationSuccess
              applicationId={submittedApplicationId}
              status={submittedStatus}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar />

      {/* Main Content */}
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <ApplicationProgress
              currentStep={currentStep}
              steps={renewalApplicationSteps}
            />

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <IdUploadStep
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  uploadedFile={uploadedFile}
                  getRootProps={getRootProps}
                  getInputProps={getInputProps}
                  isDragActive={isDragActive}
                  onRemoveFile={handleRemoveIdFile}
                  isProcessingDone={isIdProcessingDone}
                  setIsProcessingDone={setIsIdProcessingDone}
                  processedIdFile={processedIdFile}
                  setProcessedIdFile={setProcessedIdFile}
                  onOcrTextChange={setIdOcrText}
                />
              )}

              {currentStep === 2 && (
                <StepErrorBoundary>
                  <PersonalInfoStepPart1
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                  />
                </StepErrorBoundary>
              )}

              {currentStep === 3 && (
                <StepErrorBoundary>
                  <PersonalInfoStepPart2
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                  />
                </StepErrorBoundary>
              )}

              {currentStep === 4 && (
                <DocumentsUploadStep<RenewalApplicationFormData>
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
                  onRemoveGradesFile={handleRemoveGradesFile}
                  onRemoveRegistrationFile={handleRemoveRegistrationFile}
                  isCogProcessingDone={isCogProcessingDone}
                  setIsCogProcessingDone={setIsCogProcessingDone}
                  isCorProcessingDone={isCorProcessingDone}
                  setIsCorProcessingDone={setIsCorProcessingDone}
                  processedCogFile={processedCogFile}
                  setProcessedCogFile={setProcessedCogFile}
                  processedCorFile={processedCorFile}
                  setProcessedCorFile={setProcessedCorFile}
                  onCogOcrChange={(text, data, fileUrl) => {
                    setCogOcrText(text);
                    setCogExtractedData(data);
                    setCogFileUrl(fileUrl || "");
                  }}
                  onCorOcrChange={(text, data, fileUrl) => {
                    setCorOcrText(text);
                    setCorExtractedData(data);
                    setCorFileUrl(fileUrl || "");
                  }}
                />
              )}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep === 1) {
                    router.push("/application");
                  } else {
                    prevStep();
                  }
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentStep === 1 ? "Back" : "Previous"}
              </Button>

              <Button
                onClick={
                  isLastStep
                    ? handleSubmit(onSubmit, handleValidationErrors)
                    : nextStep
                }
                disabled={
                  isSubmitting ||
                  (currentStep === 1 &&
                    (!uploadedFile || !isIdProcessingDone)) ||
                  (currentStep === 4 && documentsProcessing)
                }
              >
                {isSubmitting && isLastStep ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    {isLastStep ? "Submit Application" : "Next"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* File Upload Confirmation Modal */}
      <FileUploadConfirmationModal
        isOpen={confirmationModalOpen}
        onConfirm={handleConfirmUpload}
        onCancel={handleCancelUpload}
        fileName={
          pendingIdFile?.name ||
          pendingCogFile?.name ||
          pendingCorFile?.name ||
          ""
        }
        fileType={currentFileType}
      />
    </div>
  );
}
