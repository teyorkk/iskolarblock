"use client";

import { motion } from "framer-motion";
import { useState } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newApplicationSchema,
  type NewApplicationFormData,
} from "@/lib/validations";
import { newApplicationSteps } from "@/lib/constants/application-steps";
import { ApplicationProgress } from "@/components/application/application-progress";
import { IdUploadStep } from "@/components/application/id-upload-step";
import { PersonalInfoStepPart1 } from "@/components/application/personal-info-step-part1";
import { PersonalInfoStepPart2 } from "@/components/application/personal-info-step-part2";
import { DocumentsUploadStep } from "@/components/application/documents-upload-step";
import { ApplicationSuccess } from "@/components/application/application-success";
import { FileUploadConfirmationModal } from "@/components/application/file-upload-confirmation-modal";
import { StepErrorBoundary } from "@/components/application/error-boundary";
import { useSession } from "@/components/session-provider";
import { useApplicationEligibility } from "@/hooks/use-application-eligibility";
import { useApplicationFileUploads } from "@/hooks/use-application-file-uploads";
import { useApplicationSubmission } from "@/hooks/use-application-submission";

export default function NewApplicationPage() {
  const router = useRouter();
  const { user } = useSession();
  const [currentStep, setCurrentStep] = useState(1);

  const eligibility = useApplicationEligibility({ userId: user?.id });
  const fileUploads = useApplicationFileUploads();

  const submission = useApplicationSubmission({
    uploadedFile: fileUploads.uploadedFile,
    certificateOfGrades: fileUploads.certificateOfGrades,
    certificateOfRegistration: fileUploads.certificateOfRegistration,
    idOcrText: fileUploads.idOcrText,
    cogOcrText: fileUploads.cogOcrText,
    cogExtractedData: fileUploads.cogExtractedData,
    cogFileUrl: fileUploads.cogFileUrl,
    corOcrText: fileUploads.corOcrText,
    corExtractedData: fileUploads.corExtractedData,
    corFileUrl: fileUploads.corFileUrl,
  });

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

  if (!eligibility.eligibilityChecked) {
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

  if (eligibility.isPageLocked) {
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
                  {eligibility.lockReason ||
                    "You cannot start a new application at the moment."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {eligibility.lockStatus && (
                  <p className="text-sm text-gray-600">
                    Current application status:{" "}
                    <span className="font-semibold">
                      {eligibility.lockStatus}
                    </span>
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

  if (submission.isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
          <div className="p-4 md:p-6">
            <ApplicationSuccess
              applicationId={submission.submittedApplicationId || undefined}
              status={submission.submittedStatus}
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
                    uploadedFile={fileUploads.uploadedFile}
                    getRootProps={fileUploads.getRootProps}
                    getInputProps={fileUploads.getInputProps}
                    isDragActive={fileUploads.isDragActive}
                    onRemoveFile={fileUploads.handleRemoveIdFile}
                    isProcessingDone={fileUploads.isIdProcessingDone}
                    setIsProcessingDone={fileUploads.setIsIdProcessingDone}
                    processedIdFile={fileUploads.processedIdFile}
                    setProcessedIdFile={fileUploads.setProcessedIdFile}
                    onOcrTextChange={fileUploads.setIdOcrText}
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
                    certificateOfGrades={fileUploads.certificateOfGrades}
                    certificateOfRegistration={
                      fileUploads.certificateOfRegistration
                    }
                    getRootPropsGrades={fileUploads.getRootPropsGrades}
                    getInputPropsGrades={fileUploads.getInputPropsGrades}
                    isDragActiveGrades={fileUploads.isDragActiveGrades}
                    getRootPropsRegistration={
                      fileUploads.getRootPropsRegistration
                    }
                    getInputPropsRegistration={
                      fileUploads.getInputPropsRegistration
                    }
                    isDragActiveRegistration={
                      fileUploads.isDragActiveRegistration
                    }
                    onRemoveGradesFile={fileUploads.handleRemoveGradesFile}
                    onRemoveRegistrationFile={
                      fileUploads.handleRemoveRegistrationFile
                    }
                    isCogProcessingDone={fileUploads.isCogProcessingDone}
                    setIsCogProcessingDone={fileUploads.setIsCogProcessingDone}
                    isCorProcessingDone={fileUploads.isCorProcessingDone}
                    setIsCorProcessingDone={fileUploads.setIsCorProcessingDone}
                    processedCogFile={fileUploads.processedCogFile}
                    setProcessedCogFile={fileUploads.setProcessedCogFile}
                    processedCorFile={fileUploads.processedCorFile}
                    setProcessedCorFile={fileUploads.setProcessedCorFile}
                    onCogOcrChange={(text, data, fileUrl) => {
                      fileUploads.setCogOcrText(text);
                      fileUploads.setCogExtractedData(data);
                      fileUploads.setCogFileUrl(fileUrl || "");
                    }}
                    onCorOcrChange={(text, data, fileUrl) => {
                      fileUploads.setCorOcrText(text);
                      fileUploads.setCorExtractedData(data);
                      fileUploads.setCorFileUrl(fileUrl || "");
                    }}
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
                    if (currentStep > 1) {
                      setCurrentStep(currentStep - 1);
                    }
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
                    await handleSubmit(
                      submission.onSubmit,
                      submission.handleValidationErrors
                    )(e);
                  } else {
                    if (currentStep < newApplicationSteps.length) {
                      setCurrentStep(currentStep + 1);
                    }
                  }
                }}
                disabled={
                  submission.isSubmitting ||
                  (currentStep === 1 &&
                    (!fileUploads.uploadedFile ||
                      !fileUploads.isIdProcessingDone)) ||
                  (currentStep === 2 &&
                    (!watch("lastName") ||
                      !watch("firstName") ||
                      !watch("dateOfBirth") ||
                      !watch("placeOfBirth") ||
                      !watch("age") ||
                      !watch("sex"))) ||
                  (currentStep === 3 &&
                    (!watch("houseNumber") ||
                      !watch("purok") ||
                      !watch("barangay") ||
                      !watch("municipality") ||
                      !watch("contactNumber") ||
                      !watch("religion") ||
                      !watch("course") ||
                      !watch("yearLevel"))) ||
                  (currentStep === 4 && fileUploads.documentsProcessing)
                }
              >
                {submission.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : currentStep === newApplicationSteps.length ? (
                  "Submit Application"
                ) : (
                  "Next"
                )}
                {!submission.isSubmitting && (
                  <ArrowRight className="w-4 h-4 ml-2" />
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* File Upload Confirmation Modal */}
      <FileUploadConfirmationModal
        isOpen={fileUploads.confirmationModalOpen}
        onConfirm={fileUploads.handleConfirmUpload}
        onCancel={fileUploads.handleCancelUpload}
        fileName={fileUploads.getPendingFileName()}
        fileType={fileUploads.currentFileType}
      />
    </div>
  );
}
