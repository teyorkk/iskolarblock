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
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { extractText } from "@/lib/services/ocr";

type IdForm = NewApplicationFormData | RenewalApplicationFormData;

interface IdUploadStepProps<T extends IdForm> extends ApplicationStepProps<T> {
  uploadedFile: File | null;
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  isDragActive: boolean;
}

export function IdUploadStep<T extends IdForm>({
  errors,
  uploadedFile,
  getRootProps,
  getInputProps,
  isDragActive,
}: IdUploadStepProps<T>): React.JSX.Element {
  const [ocrText, setOcrText] = useState<string>("");
  const [ocrError, setOcrError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function runOCR() {
      if (!uploadedFile) {
        setOcrText("");
        setOcrError("");
        setProgress(0);
        setStatusMessage("");
        setIsProcessing(false);
        return;
      }

      setOcrText("");
      setOcrError("");
      setProgress(1);
      setIsProcessing(true);

      const result = await extractText(uploadedFile, (progressInfo) => {
        if (!cancelled) {
          setProgress(progressInfo.progress);
          setStatusMessage(progressInfo.status);
        }
      });

      if (!cancelled) {
        if (result.error) {
          setOcrError(result.error);
          setProgress(0);
        } else {
          setOcrText(result.text);
          setProgress(100);
        }
        setIsProcessing(false);
      }
    }

    void runOCR();

    return () => {
      cancelled = true;
    };
  }, [uploadedFile]);

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
          error={
            typeof (errors as unknown as { idDocument?: { message?: unknown } })
              ?.idDocument?.message === "string"
              ? ((errors as unknown as { idDocument?: { message?: unknown } })
                  ?.idDocument?.message as string)
              : undefined
          }
        />

        {/* OCR Status */}
        {uploadedFile && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                {isProcessing
                  ? statusMessage || "Processing document..."
                  : ocrText
                  ? "OCR completed"
                  : ocrError
                  ? "OCR failed"
                  : ""}
              </p>
              {isProcessing && (
                <span className="text-xs text-gray-500">{progress}%</span>
              )}
            </div>
            {isProcessing && <Progress value={progress} />}

            {ocrError && <p className="text-sm text-red-600">{ocrError}</p>}

            {ocrText && (
              <div className="border rounded-md bg-gray-50 p-3 max-h-48 overflow-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  {ocrText}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
