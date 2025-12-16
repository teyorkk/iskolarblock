"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
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
  newApplicationSchema,
  type NewApplicationFormData,
} from "@/lib/validations";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { newApplicationSteps } from "@/lib/constants/application-steps";
import { ApplicationProgress } from "@/components/application/application-progress";
import { IdUploadStep } from "@/components/application/id-upload-step";
import { PersonalInfoStepPart1 } from "@/components/application/personal-info-step-part1";
import { PersonalInfoStepPart2 } from "@/components/application/personal-info-step-part2";
import { DocumentsUploadStep } from "@/components/application/documents-upload-step";
import { ApplicationSuccess } from "@/components/application/application-success";
import { FileUploadConfirmationModal } from "@/components/application/file-upload-confirmation-modal";
import { StepErrorBoundary } from "@/components/application/error-boundary";
import type {
  COGExtractionResponse,
  CORExtractionResponse,
} from "@/lib/services/document-extraction";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSession } from "@/components/session-provider";

export default function NewApplicationPage() {
  const router = useRouter();
  const { user } = useSession();
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isPageLocked, setIsPageLocked] = useState(false);
  const [lockReason, setLockReason] = useState<string | null>(null);
  const [lockStatus, setLockStatus] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<
    "PENDING" | "APPROVED"
  >("PENDING");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isIdProcessingDone, setIsIdProcessingDone] = useState<boolean>(false);
  const [processedIdFile, setProcessedIdFile] = useState<string>("");
  const [isIdInvalidFileType, setIsIdInvalidFileType] =
    useState<boolean>(false);
  const [certificateOfGrades, setCertificateOfGrades] = useState<File | null>(
    null
  );
  const [isCogProcessingDone, setIsCogProcessingDone] =
    useState<boolean>(false);
  const [isCogInvalidFileType, setIsCogInvalidFileType] =
    useState<boolean>(false);
  const [certificateOfRegistration, setCertificateOfRegistration] =
    useState<File | null>(null);
  const [isCorProcessingDone, setIsCorProcessingDone] =
    useState<boolean>(false);
  const [isCorInvalidFileType, setIsCorInvalidFileType] =
    useState<boolean>(false);

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
  const documentsProcessing =
    (Boolean(certificateOfGrades) && !isCogProcessingDone) ||
    (Boolean(certificateOfRegistration) && !isCorProcessingDone);

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
  const [submittedApplicationId, setSubmittedApplicationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function checkEligibility() {
      if (!user?.id) {
        setIsPageLocked(true);
        setLockReason("Please sign in to continue your application.");
        setLockStatus(null);
        setEligibilityChecked(true);
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
          setEligibilityChecked(true);
          return;
        }

        const { data: existingApplications, error: applicationError } =
          await supabase
            .from("Application")
            .select("id, status")
            .eq("userId", user.id)
            .eq("applicationPeriodId", periodData.id)
            .limit(1);

        if (applicationError) {
          throw applicationError;
        }

        if (existingApplications && existingApplications.length > 0) {
          // User already submitted for current period, redirect to /application
          router.push("/application");
          return;
        } else {
          setIsPageLocked(false);
          setLockReason(null);
          setLockStatus(null);
        }
      } catch (error) {
        console.error("Eligibility check failed:", error);
        setIsPageLocked(true);
        setLockReason(
          "We couldn't verify your eligibility right now. Please try again later."
        );
        setLockStatus(null);
      } finally {
        setEligibilityChecked(true);
      }
    }

    void checkEligibility();
  }, [user?.id]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<NewApplicationFormData>({
    resolver: zodResolver(newApplicationSchema),
    defaultValues: {
      province: "Bulacan",
      citizenship: "Filipino",
      barangay: "San Miguel",
      municipality: "Hagonoy",
    },
  });

  const stepFieldErrorMap: Record<
    number,
    Array<keyof NewApplicationFormData>
  > = {
    2: [
      "lastName",
      "firstName",
      "middleName",
      "dateOfBirth",
      "placeOfBirth",
      "age",
      "sex",
    ],
    3: [
      "houseNumber",
      "purok",
      "barangay",
      "municipality",
      "province",
      "citizenship",
      "contactNumber",
      "religion",
      "course",
      "yearLevel",
    ],
  };

  const stepHasErrors = (stepNumber: number): boolean => {
    const fields = stepFieldErrorMap[stepNumber];
    if (!fields) return false;
    return fields.some((field) => Boolean(errors[field]));
  };

  const watchedLastName = watch("lastName");
  const watchedFirstName = watch("firstName");
  const watchedMiddleName = watch("middleName");
  const watchedDateOfBirth = watch("dateOfBirth");
  const watchedAge = watch("age");

  const isContactNumberValid = (): boolean => {
    const contactNumber = (watch("contactNumber") || "").trim();
    if (!contactNumber) return false;
    if (contactNumber.toLowerCase() === "n/a") return true;
    return contactNumber.startsWith("09") && /^\d{11}$/.test(contactNumber);
  };

  const applicantName = useMemo(() => {
    const lastName = (watchedLastName || "").trim();
    const firstName = (watchedFirstName || "").trim();
    const middleName = (watchedMiddleName || "").trim();

    if (!lastName || !firstName) return null;
    const middleInitial = middleName
      ? `${middleName.charAt(0).toUpperCase()}.`
      : "";
    return `${lastName}, ${firstName}${
      middleInitial ? ` ${middleInitial}` : ""
    }`;
  }, [watchedLastName, watchedFirstName, watchedMiddleName]);

  useEffect(() => {
    if (!watchedDateOfBirth) {
      if (watchedAge) {
        setValue("age", "", { shouldValidate: true });
      }
      return;
    }

    const birthDate = new Date(watchedDateOfBirth);
    if (Number.isNaN(birthDate.getTime())) {
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age -= 1;
    }

    const ageString = Math.max(age, 0).toString();
    if (watchedAge !== ageString) {
      setValue("age", ageString, { shouldValidate: true });
    }
  }, [watchedDateOfBirth, watchedAge, setValue]);

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
      // File is managed in state, not in form
      // Reset processing state for new file
      setIsIdProcessingDone(false);
      setProcessedIdFile("");
      setPendingIdFile(null);
    } else if (pendingCogFile) {
      setCertificateOfGrades(pendingCogFile);
      // File is managed in state, not in form
      // Reset processing state for new file
      setIsCogProcessingDone(false);
      setProcessedCogFile("");
      setPendingCogFile(null);
    } else if (pendingCorFile) {
      setCertificateOfRegistration(pendingCorFile);
      // File is managed in state, not in form
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
    // File is managed in state, not in form
  };

  const handleRemoveGradesFile = (): void => {
    setCertificateOfGrades(null);
    setIsCogProcessingDone(false);
    setProcessedCogFile("");
    // File is managed in state, not in form
  };

  const handleRemoveRegistrationFile = (): void => {
    setCertificateOfRegistration(null);
    setIsCorProcessingDone(false);
    setProcessedCorFile("");
    // File is managed in state, not in form
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

  if (!eligibilityChecked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
          <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
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
                  Application Unavailable
                </CardTitle>
                <CardDescription>
                  {lockReason ||
                    "You cannot start a new application at the moment."}
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
                    onClick={() => router.push("/user-dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onSubmit = async (data: NewApplicationFormData): Promise<void> => {
    console.log("🚀 onSubmit called with data:", data);
    try {
      setIsSubmitting(true);
      console.log("📝 Starting submission process...");

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

      // Prepare submission data
      const submissionData = {
        formData: {
          lastName: data.lastName,
          firstName: data.firstName,
          middleName: data.middleName,
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

      // Check payload size before sending (Vercel has 4.5MB limit)
      const payloadSize = new Blob([JSON.stringify(submissionData)]).size;
      const payloadSizeMB = payloadSize / (1024 * 1024);

      if (payloadSizeMB > 4) {
        toast.error(
          "Request payload too large. Please reduce file sizes or try again later.",
          {
            description: `Payload size: ${payloadSizeMB.toFixed(
              2
            )}MB (max: 4MB)`,
          }
        );
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/applications/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        // Handle 413 errors (Content Too Large) - Vercel returns plain text, not JSON
        if (response.status === 413) {
          const errorText = await response.text();
          throw new Error(
            "Request payload too large. Please reduce file sizes or try again later."
          );
        }

        // Try to parse JSON error, fallback to text if it fails
        let error;
        try {
          error = await response.json();
        } catch {
          const errorText = await response.text();
          throw new Error(
            errorText || `Request failed with status ${response.status}`
          );
        }
        throw new Error(error.error || "Failed to submit application");
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
          ? "Application approved instantly!"
          : "Application submitted successfully!",
        {
          description:
            resultingStatus === "APPROVED"
              ? "All required documents were provided."
              : "Missing documents detected. Please upload the rest to get approved.",
        }
      );
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit application";
      toast.error(errorMessage);
      console.error("Submission error:", error);
    }
  };

  const getFirstErrorMessage = (
    validationErrors: FieldErrors<NewApplicationFormData>
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
    validationErrors: FieldErrors<NewApplicationFormData>
  ): void => {
    const message =
      getFirstErrorMessage(validationErrors) ||
      "Please review your information and correct any highlighted fields.";
    toast.error("Unable to submit application", {
      description: message,
    });
  };

  const nextStep = (): void => {
    if (currentStep < newApplicationSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
          <div className="p-4 md:p-6">
            <ApplicationSuccess
              applicationId={submittedApplicationId || undefined}
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
              steps={newApplicationSteps}
            />

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <StepErrorBoundary stepName="ID Upload Step">
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
                    onInvalidFileTypeChange={setIsIdInvalidFileType}
                  />
                </StepErrorBoundary>
              )}

              {currentStep === 2 && (
                <StepErrorBoundary stepName="Personal Information Step 1">
                  <PersonalInfoStepPart1
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                  />
                </StepErrorBoundary>
              )}

              {currentStep === 3 && (
                <StepErrorBoundary stepName="Personal Information Step 2">
                  <PersonalInfoStepPart2
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                  />
                </StepErrorBoundary>
              )}

              {currentStep === 4 && (
                <StepErrorBoundary stepName="Documents Upload Step">
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
                    onCogInvalidFileTypeChange={setIsCogInvalidFileType}
                    onCorInvalidFileTypeChange={setIsCorInvalidFileType}
                    applicantName={applicantName || undefined}
                  />
                </StepErrorBoundary>
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
                onClick={async (e) => {
                  console.log("🔘 Button clicked, step:", currentStep);
                  if (currentStep === newApplicationSteps.length) {
                    console.log("📤 Submitting form...");
                    console.log("Form errors:", errors);
                    console.log("Form values:", watch());
                    await handleSubmit(onSubmit, handleValidationErrors)(e);
                  } else {
                    const stepFields = stepFieldErrorMap[currentStep];
                    if (stepFields && stepFields.length > 0) {
                      const isValid = await trigger(stepFields, {
                        shouldFocus: true,
                      });
                      if (!isValid) {
                        return;
                      }
                    }
                    nextStep();
                  }
                }}
                disabled={
                  isSubmitting ||
                  isIdInvalidFileType ||
                  isCogInvalidFileType ||
                  isCorInvalidFileType ||
                  (currentStep === 1 &&
                    (!uploadedFile || !isIdProcessingDone)) ||
                  (currentStep === 2 &&
                    (!watch("lastName") ||
                      !watch("firstName") ||
                      !watch("dateOfBirth") ||
                      !watch("placeOfBirth") ||
                      !watch("age") ||
                      !watch("sex") ||
                      stepHasErrors(2))) ||
                  (currentStep === 3 &&
                    (!watch("houseNumber") ||
                      !watch("purok") ||
                      !watch("barangay") ||
                      !watch("municipality") ||
                      !watch("contactNumber") ||
                      !watch("religion") ||
                      !watch("course") ||
                      !watch("yearLevel") ||
                      !isContactNumberValid() ||
                      stepHasErrors(3))) ||
                  (currentStep === 4 && documentsProcessing)
                }
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : currentStep === newApplicationSteps.length ? (
                  "Submit Application"
                ) : (
                  "Next"
                )}
                {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
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
