"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserSidebar } from "@/components/user-sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema, type ApplicationFormData } from "@/lib/validations";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { applicationSteps } from "@/lib/constants/application-steps";
import { ApplicationProgress } from "@/components/application/application-progress";
import { ApplicationTypeStep } from "@/components/application/application-type-step";
import { IdUploadStep } from "@/components/application/id-upload-step";
import { FaceScanStep } from "@/components/application/face-scan-step";
import { PersonalInfoStep } from "@/components/application/personal-info-step";
import { DocumentsUploadStep } from "@/components/application/documents-upload-step";
import { ApplicationSuccess } from "@/components/application/application-success";

export default function ApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [certificateOfGrades, setCertificateOfGrades] = useState<File | null>(
    null
  );
  const [certificateOfRegistration, setCertificateOfRegistration] =
    useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const onDrop = (acceptedFiles: File[]): void => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
      setValue("idDocument", acceptedFiles[0]);
    }
  };

  const onDropGrades = (acceptedFiles: File[]): void => {
    if (acceptedFiles.length > 0) {
      setCertificateOfGrades(acceptedFiles[0]);
      setValue("certificateOfGrades", acceptedFiles[0]);
    }
  };

  const onDropRegistration = (acceptedFiles: File[]): void => {
    if (acceptedFiles.length > 0) {
      setCertificateOfRegistration(acceptedFiles[0]);
      setValue("certificateOfRegistration", acceptedFiles[0]);
    }
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
    if (currentStep < applicationSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFaceScan = (): void => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      nextStep();
    }, 2000);
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
              steps={applicationSteps}
            />

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <ApplicationTypeStep
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                />
              )}

              {currentStep === 2 && (
                <IdUploadStep
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  uploadedFile={uploadedFile}
                  getRootProps={getRootProps}
                  getInputProps={getInputProps}
                  isDragActive={isDragActive}
                />
              )}

              {currentStep === 3 && (
                <FaceScanStep
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  isScanning={isScanning}
                  onStartScan={handleFaceScan}
                />
              )}

              {currentStep === 4 && (
                <PersonalInfoStep
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                />
              )}

              {currentStep === 5 && (
                <DocumentsUploadStep
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
                />
              )}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={currentStep === 5 ? handleSubmit(onSubmit) : nextStep}
                disabled={
                  (currentStep === 1 && !watch("type")) ||
                  (currentStep === 2 && !uploadedFile) ||
                  (currentStep === 5 &&
                    (!certificateOfGrades ||
                      !certificateOfRegistration ||
                      !watch("fullName")))
                }
              >
                {currentStep === 5 ? "Submit Application" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
