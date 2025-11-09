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

interface IdUploadStepProps extends ApplicationStepProps {
  uploadedFile: File | null;
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  isDragActive: boolean;
}

export function IdUploadStep({
  errors,
  uploadedFile,
  getRootProps,
  getInputProps,
  isDragActive,
}: IdUploadStepProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2 text-orange-500" />
          Upload ID Document
        </CardTitle>
        <CardDescription>
          Student or Valid ID (PDF, JPG, or PNG)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUploadZone
          uploadedFile={uploadedFile}
          isDragActive={isDragActive}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          error={errors.idDocument?.message}
        />
      </CardContent>
    </Card>
  );
}

