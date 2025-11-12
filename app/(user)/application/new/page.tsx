"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserSidebar } from "@/components/user-sidebar";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { FaceScanStep } from "@/components/application/face-scan-step";
import { PersonalInfoStepPart1 } from "@/components/application/personal-info-step-part1";
import { PersonalInfoStepPart2 } from "@/components/application/personal-info-step-part2";
import { DocumentsUploadStep } from "@/components/application/documents-upload-step";
import { ApplicationSuccess } from "@/components/application/application-success";
import { FileUploadConfirmationModal } from "@/components/application/file-upload-confirmation-modal";

export default function NewApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isIdProcessingDone, setIsIdProcessingDone] = useState<boolean>(false);
  const [processedIdFile, setProcessedIdFile] = useState<string>("");
  const [isFaceVerified, setIsFaceVerified] = useState<boolean>(false);
  const [certificateOfGrades, setCertificateOfGrades] = useState<File | null>(
    null
  );
  const [isCogProcessingDone, setIsCogProcessingDone] = useState<boolean>(false);
  const [certificateOfRegistration, setCertificateOfRegistration] =
    useState<File | null>(null);
  const [isCorProcessingDone, setIsCorProcessingDone] = useState<boolean>(false);

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NewApplicationFormData>({
    resolver: zodResolver(newApplicationSchema),
    defaultValues: {
      province: "Bulacan",
      citizenship: "Filipino",
    },
  });

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
      setValue("idDocument", pendingIdFile);
      // Reset processing state for new file
      setIsIdProcessingDone(false);
      setProcessedIdFile("");
      setPendingIdFile(null);
    } else if (pendingCogFile) {
      setCertificateOfGrades(pendingCogFile);
      setValue("certificateOfGrades", pendingCogFile);
      // Reset processing state for new file
      setIsCogProcessingDone(false);
      setProcessedCogFile("");
      setPendingCogFile(null);
    } else if (pendingCorFile) {
      setCertificateOfRegistration(pendingCorFile);
      setValue("certificateOfRegistration", pendingCorFile);
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
    setValue("idDocument", undefined as never);
  };

  const handleRemoveGradesFile = (): void => {
    setCertificateOfGrades(null);
    setIsCogProcessingDone(false);
    setProcessedCogFile("");
    setValue("certificateOfGrades", undefined as never);
  };

  const handleRemoveRegistrationFile = (): void => {
    setCertificateOfRegistration(null);
    setIsCorProcessingDone(false);
    setProcessedCorFile("");
    setValue("certificateOfRegistration", undefined as never);
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

  const onSubmit = (): void => {
    setIsSubmitted(true);
    toast.success("Application submitted successfully!");
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
            <ApplicationSuccess applicationId={`SCH-${Date.now()}`} />
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
                />
              )}

              {currentStep === 2 && (
                <FaceScanStep<NewApplicationFormData>
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  uploadedIdFile={uploadedFile}
                  onVerificationComplete={setIsFaceVerified}
                />
              )}

              {currentStep === 3 && (
                <PersonalInfoStepPart1
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                />
              )}

              {currentStep === 4 && (
                <PersonalInfoStepPart2
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                />
              )}

              {currentStep === 5 && (
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
                  currentStep === newApplicationSteps.length
                    ? handleSubmit(onSubmit)
                    : nextStep
                }
                disabled={
                  (currentStep === 1 && (!uploadedFile || !isIdProcessingDone)) ||
                  (currentStep === 2 && !isFaceVerified) ||
                  (currentStep === 3 &&
                    (!watch("lastName") ||
                      !watch("firstName") ||
                      !watch("dateOfBirth") ||
                      !watch("placeOfBirth") ||
                      !watch("age") ||
                      !watch("sex"))) ||
                  (currentStep === 4 &&
                    (!watch("houseNumber") ||
                      !watch("purok") ||
                      !watch("barangay") ||
                      !watch("municipality") ||
                      !watch("contactNumber") ||
                      !watch("religion") ||
                      !watch("course") ||
                      !watch("yearLevel"))) ||
                  (currentStep === 5 &&
                    (!certificateOfGrades || !certificateOfRegistration))
                }
              >
                {currentStep === newApplicationSteps.length
                  ? "Submit Application"
                  : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
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
