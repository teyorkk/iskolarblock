"use client";

import { Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import type { ApplicationStepProps } from "@/types/components";
import type {
  NewApplicationFormData,
  RenewalApplicationFormData,
} from "@/lib/validations";
import type {
  COGExtractionResponse,
  CORExtractionResponse,
} from "@/lib/services/document-extraction";
import { useCogProcessing } from "@/hooks/use-cog-processing";
import { useCorProcessing } from "@/hooks/use-cor-processing";
import { DocumentStatusAlert } from "./document-status-alert";
import { CogUploadSection } from "./cog-upload-section";
import { CorUploadSection } from "./cor-upload-section";

interface DocumentsUploadStepProps<
  T extends NewApplicationFormData | RenewalApplicationFormData
> extends ApplicationStepProps<T> {
  certificateOfGrades: File | null;
  certificateOfRegistration: File | null;
  getRootPropsGrades: () => DropzoneRootProps;
  getInputPropsGrades: () => DropzoneInputProps;
  isDragActiveGrades: boolean;
  getRootPropsRegistration: () => DropzoneRootProps;
  getInputPropsRegistration: () => DropzoneInputProps;
  isDragActiveRegistration: boolean;
  onRemoveGradesFile?: () => void;
  onRemoveRegistrationFile?: () => void;
  isCogProcessingDone: boolean;
  setIsCogProcessingDone: (done: boolean) => void;
  isCorProcessingDone: boolean;
  setIsCorProcessingDone: (done: boolean) => void;
  processedCogFile: string;
  setProcessedCogFile: (filename: string) => void;
  processedCorFile: string;
  setProcessedCorFile: (filename: string) => void;
  onCogOcrChange?: (
    text: string,
    data: COGExtractionResponse | null,
    fileUrl?: string
  ) => void;
  onCorOcrChange?: (
    text: string,
    data: CORExtractionResponse | null,
    fileUrl?: string
  ) => void;
  existingCogFileUrl?: string | null;
  existingCorFileUrl?: string | null;
  cogUploadLocked?: boolean;
  corUploadLocked?: boolean;
  onUnlockCogUpload?: () => void;
  onUnlockCorUpload?: () => void;
}

export function DocumentsUploadStep<
  T extends NewApplicationFormData | RenewalApplicationFormData
>({
  errors,
  certificateOfGrades,
  certificateOfRegistration,
  getRootPropsGrades,
  getInputPropsGrades,
  isDragActiveGrades,
  getRootPropsRegistration,
  getInputPropsRegistration,
  isDragActiveRegistration,
  onRemoveGradesFile,
  onRemoveRegistrationFile,
  isCogProcessingDone,
  setIsCogProcessingDone,
  isCorProcessingDone,
  setIsCorProcessingDone,
  processedCogFile,
  setProcessedCogFile,
  processedCorFile,
  setProcessedCorFile,
  onCogOcrChange,
  onCorOcrChange,
  existingCogFileUrl,
  existingCorFileUrl,
  cogUploadLocked,
  corUploadLocked,
  onUnlockCogUpload,
  onUnlockCorUpload,
}: DocumentsUploadStepProps<T>): React.JSX.Element {
  const gradesMessage = (
    errors as unknown as { certificateOfGrades?: { message?: unknown } }
  )?.certificateOfGrades?.message;
  const registrationMessage = (
    errors as unknown as { certificateOfRegistration?: { message?: unknown } }
  )?.certificateOfRegistration?.message;

  const gradesErrorText =
    typeof gradesMessage === "string" ? gradesMessage : undefined;
  const registrationErrorText =
    typeof registrationMessage === "string" ? registrationMessage : undefined;

  const cogProcessing = useCogProcessing({
    certificateOfGrades,
    processedCogFile,
    isCogProcessingDone,
    setIsCogProcessingDone,
    setProcessedCogFile,
    onOcrChange: onCogOcrChange,
  });

  const corProcessing = useCorProcessing({
    certificateOfRegistration,
    processedCorFile,
    isCorProcessingDone,
    setIsCorProcessingDone,
    setProcessedCorFile,
    onOcrChange: onCorOcrChange,
  });

  const hasErrors = Boolean(cogProcessing.ocrError || corProcessing.ocrError);
  const bothFilesUploaded = Boolean(
    certificateOfGrades && certificateOfRegistration
  );
  const bothProcessingDone = isCogProcessingDone && isCorProcessingDone;
  const missingDocuments = !certificateOfGrades || !certificateOfRegistration;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2 text-orange-500" />
          Upload Required Documents
        </CardTitle>
        <CardDescription>
          Upload your certificate of grades and certificate of registration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DocumentStatusAlert
          bothFilesUploaded={bothFilesUploaded}
          bothProcessingDone={bothProcessingDone}
          hasErrors={hasErrors}
          missingDocuments={missingDocuments}
        />

        <CogUploadSection
          certificateOfGrades={certificateOfGrades}
          getRootProps={getRootPropsGrades}
          getInputProps={getInputPropsGrades}
          isDragActive={isDragActiveGrades}
          error={gradesErrorText}
          onRemove={onRemoveGradesFile}
          isProcessing={cogProcessing.isProcessing}
          progress={cogProcessing.progress}
          statusMessage={cogProcessing.statusMessage}
          extractedData={cogProcessing.extractedData}
          ocrError={cogProcessing.ocrError}
          cogUploadLocked={cogUploadLocked}
          existingCogFileUrl={existingCogFileUrl}
          onUnlockCogUpload={onUnlockCogUpload}
        />

        <CorUploadSection
          certificateOfRegistration={certificateOfRegistration}
          getRootProps={getRootPropsRegistration}
          getInputProps={getInputPropsRegistration}
          isDragActive={isDragActiveRegistration}
          error={registrationErrorText}
          onRemove={onRemoveRegistrationFile}
          isProcessing={corProcessing.isProcessing}
          progress={corProcessing.progress}
          statusMessage={corProcessing.statusMessage}
          extractedData={corProcessing.extractedData}
          ocrError={corProcessing.ocrError}
          corUploadLocked={corUploadLocked}
          existingCorFileUrl={existingCorFileUrl}
          onUnlockCorUpload={onUnlockCorUpload}
        />

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Please ensure that all documents are clear
            and readable. The certificate of grades should show your academic
            performance for the latest semester, and the certificate of
            registration should prove your current enrollment status.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
