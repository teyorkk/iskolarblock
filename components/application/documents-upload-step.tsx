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
import { FileUploadZone } from "./file-upload-zone";
import type { ApplicationStepProps } from "@/types/components";
import type {
  NewApplicationFormData,
  RenewalApplicationFormData,
} from "@/lib/validations";

interface DocumentsUploadStepProps<T extends NewApplicationFormData | RenewalApplicationFormData>
  extends ApplicationStepProps<T> {
  certificateOfGrades: File | null;
  certificateOfRegistration: File | null;
  getRootPropsGrades: () => DropzoneRootProps;
  getInputPropsGrades: () => DropzoneInputProps;
  isDragActiveGrades: boolean;
  getRootPropsRegistration: () => DropzoneRootProps;
  getInputPropsRegistration: () => DropzoneInputProps;
  isDragActiveRegistration: boolean;
}

export function DocumentsUploadStep<T extends NewApplicationFormData | RenewalApplicationFormData>({
  errors,
  certificateOfGrades,
  certificateOfRegistration,
  getRootPropsGrades,
  getInputPropsGrades,
  isDragActiveGrades,
  getRootPropsRegistration,
  getInputPropsRegistration,
  isDragActiveRegistration,
}: DocumentsUploadStepProps<T>): React.JSX.Element {
  const gradesMessage =
    (errors as unknown as { certificateOfGrades?: { message?: unknown } })
      ?.certificateOfGrades?.message;
  const registrationMessage =
    (errors as unknown as { certificateOfRegistration?: { message?: unknown } })
      ?.certificateOfRegistration?.message;

  const gradesErrorText =
    typeof gradesMessage === "string" ? gradesMessage : undefined;
  const registrationErrorText =
    typeof registrationMessage === "string" ? registrationMessage : undefined;
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
        <FileUploadZone
          uploadedFile={certificateOfGrades}
          isDragActive={isDragActiveGrades}
          getRootProps={getRootPropsGrades}
          getInputProps={getInputPropsGrades}
          error={gradesErrorText}
          label="Certificate of Grades"
        />

        <FileUploadZone
          uploadedFile={certificateOfRegistration}
          isDragActive={isDragActiveRegistration}
          getRootProps={getRootPropsRegistration}
          getInputProps={getInputPropsRegistration}
          error={registrationErrorText}
          label="Certificate of Registration"
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
