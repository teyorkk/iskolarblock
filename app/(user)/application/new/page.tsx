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

export default function NewApplicationPage() {
  const router = useRouter();
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
  } = useForm<NewApplicationFormData>({
    resolver: zodResolver(newApplicationSchema),
    defaultValues: {
      province: "Bulacan",
      citizenship: "Filipino",
    },
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
    if (currentStep < newApplicationSteps.length) {
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
                />
              )}

              {currentStep === 2 && (
                <FaceScanStep<NewApplicationFormData>
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  isScanning={isScanning}
                  onStartScan={handleFaceScan}
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
                  (currentStep === 1 && !uploadedFile) ||
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
    </div>
  );
}
