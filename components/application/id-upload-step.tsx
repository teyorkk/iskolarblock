"use client";

import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import { FileUploadZone } from "./file-upload-zone";
import type { ApplicationStepProps } from "@/types/components";
import type {
  NewApplicationFormData,
  RenewalApplicationFormData,
} from "@/lib/validations";
import { useEffect, useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { extractText } from "@/lib/services/ocr";
import {
  extractIDData,
  parseResidentialAddress,
  type IDExtractionResponse,
} from "@/lib/services/id-extraction";
import { toast } from "sonner";

type IdForm = NewApplicationFormData | RenewalApplicationFormData;

interface IdUploadStepProps<T extends IdForm> extends ApplicationStepProps<T> {
  uploadedFile: File | null;
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  isDragActive: boolean;
  onRemoveFile?: () => void;
  isProcessingDone: boolean;
  setIsProcessingDone: (done: boolean) => void;
  processedIdFile: string;
  setProcessedIdFile: (filename: string) => void;
  onOcrTextChange?: (text: string) => void;
}

export function IdUploadStep<T extends IdForm>({
  errors,
  uploadedFile,
  getRootProps,
  getInputProps,
  isDragActive,
  setValue,
  onRemoveFile,
  isProcessingDone,
  setIsProcessingDone,
  processedIdFile,
  setProcessedIdFile,
  onOcrTextChange,
}: IdUploadStepProps<T>): React.JSX.Element {
  const [ocrText, setOcrText] = useState<string>("");
  const [ocrError, setOcrError] = useState<string>("");
  const [isInvalidFileType, setIsInvalidFileType] = useState<boolean>(false);
  const invalidFileTypeRef = useRef<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [extractedData, setExtractedData] =
    useState<IDExtractionResponse | null>(null);
const [isExtractingData, setIsExtractingData] = useState<boolean>(false);

  // Auto-fill form fields with extracted data
  const autoFillFormFields = (data: IDExtractionResponse): void => {
    // Only auto-fill for new applications (not renewal)
    if (!setValue) return;

    let filledCount = 0;

    // Helper to safely set value
    const safeSetValue = (field: string, value: string): void => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(field as any, value as any);
        filledCount++;
      } catch (error) {
        console.error(`Failed to set field ${field}:`, error);
      }
    };

    // Part 1 fields
    if (data.last_name) safeSetValue("lastName", data.last_name);
    if (data.first_name) safeSetValue("firstName", data.first_name);
    if (data.middle_name) safeSetValue("middleName", data.middle_name);
    if (data.date_of_birth) safeSetValue("dateOfBirth", data.date_of_birth);
    if (data.place_of_birth) safeSetValue("placeOfBirth", data.place_of_birth);
    if (data.age) safeSetValue("age", data.age);
    if (data.sex && (data.sex === "male" || data.sex === "female")) {
      safeSetValue("sex", data.sex);
    }

    // Part 2 fields - Address parsing
    if (data.residential_address) {
      const parsedAddress = parseResidentialAddress(data.residential_address);
      if (parsedAddress) {
        if (parsedAddress.houseNumber)
          safeSetValue("houseNumber", parsedAddress.houseNumber);
        if (parsedAddress.purok) safeSetValue("purok", parsedAddress.purok);
        if (parsedAddress.barangay)
          safeSetValue("barangay", parsedAddress.barangay);
        if (parsedAddress.municipality)
          safeSetValue("municipality", parsedAddress.municipality);
      }
    }

    if (data.citizenship) safeSetValue("citizenship", data.citizenship);
    if (data.contact_no) safeSetValue("contactNumber", data.contact_no);
    if (data.religion) safeSetValue("religion", data.religion);
    if (data.course_or_strand) safeSetValue("course", data.course_or_strand);
    if (
      data.year_level &&
      ["G11", "G12", "1", "2", "3", "4"].includes(data.year_level)
    ) {
      safeSetValue("yearLevel", data.year_level);
    }

    if (filledCount > 0) {
      toast.success(`Auto-filled ${filledCount} field(s) from ID document`);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function runOCR() {
      if (!uploadedFile) {
        // Don't reset error state if it's an invalid file type error
        // This allows the error message to persist even after file removal
        if (!invalidFileTypeRef.current) {
          setOcrText("");
          setOcrError("");
          setIsInvalidFileType(false);
        }
        setProgress(0);
        setStatusMessage("");
        setIsProcessing(false);
        setExtractedData(null);
        setIsProcessingDone(false);
        setProcessedIdFile("");
        return;
      }

      // Clear invalid file type error when a new file is uploaded
      if (invalidFileTypeRef.current && uploadedFile.name !== processedIdFile) {
        invalidFileTypeRef.current = false;
        setIsInvalidFileType(false);
        setOcrError("");
      }

      // Skip if we've already processed this exact file
      if (uploadedFile.name === processedIdFile && isProcessingDone) {
        console.log(
          "✓ Skipping re-processing - file already processed:",
          uploadedFile.name
        );
        return;
      }

      setOcrText("");
      onOcrTextChange?.("");
      setOcrError("");
      setProgress(1);
      setIsProcessing(true);
      setExtractedData(null);

      // Step 1: Extract text from image/PDF
      const result = await extractText(uploadedFile, (progressInfo) => {
        if (!cancelled) {
          setProgress(Math.min(80, progressInfo.progress)); // Cap at 80% for OCR
          setStatusMessage(progressInfo.status);
        }
      });

      if (cancelled) return;

      if (result.error) {
        setOcrError(result.error);
        setProgress(0);
        setIsProcessing(false);
        return;
      }

      setOcrText(result.text);
      onOcrTextChange?.(result.text);
      setProgress(80);

      // Step 2: Send to webhook for data extraction
      if (result.text && result.text.trim().length > 0) {
        setStatusMessage("Extracting personal information...");
        setIsExtractingData(true);
        setProgress(85);

        try {
          const extractedInfo = await extractIDData(result.text);

          if (!cancelled) {
            setIsExtractingData(false);
            setProgress(100);
            setStatusMessage("Completed");

            if (extractedInfo) {
              setExtractedData(extractedInfo);
              setProcessedIdFile(uploadedFile.name); // Mark as processed
              setIsProcessingDone(true); // Mark processing as complete
              autoFillFormFields(extractedInfo);
            } else {
              // No data extracted, but not an error
              toast.info(
                "Could not extract structured data from ID. Please fill the form manually.",
                { duration: 5000 }
              );
              console.warn(
                "No structured data extracted from OCR text. OCR text:",
                result.text.substring(0, 200)
              );
            }
          }
        } catch (extractError) {
          if (!cancelled) {
            setIsExtractingData(false);
            setProgress(0); // Reset progress

            // Handle different error types
            const errorMessage =
              extractError instanceof Error
                ? extractError.message
                : "Unknown error occurred";

            console.error("ID extraction error:", errorMessage);

            // Check if the uploaded file is not a valid ID
            if (
              errorMessage.includes("Invalid file type") ||
              errorMessage.includes("not a valid ID document") ||
              errorMessage.includes("wrong file") ||
              errorMessage.includes("valid ID document")
            ) {
              console.log("Invalid file type detected, setting error state");
              invalidFileTypeRef.current = true;
              setIsInvalidFileType(true);
              const fullErrorMessage = `${errorMessage}. Please remove this file and upload a valid Student ID or Valid ID.`;
              setOcrError(fullErrorMessage);
              toast.error(errorMessage, { duration: 8000 });
              // Clear the uploaded file to force re-upload
              onRemoveFile?.();
              setOcrText("");
              onOcrTextChange?.("");
              setExtractedData(null);
              setIsProcessingDone(false);
              setProcessedIdFile("");
              console.log("Error state set, isInvalidFileType:", true, "ocrError:", fullErrorMessage);
              return;
            } else if (errorMessage.includes("timeout")) {
              invalidFileTypeRef.current = false;
              setIsInvalidFileType(false);
              toast.error(
                "Extraction timed out. Please try uploading your document again.",
                { duration: 6000 }
              );
              setOcrError(
                "Extraction service timed out. Your OCR text is still available below."
              );
            } else if (errorMessage.includes("Network error")) {
              invalidFileTypeRef.current = false;
              setIsInvalidFileType(false);
              toast.error(
                "Network error. Please check your connection and try again.",
                { duration: 6000 }
              );
              setOcrError(
                "Network error occurred during extraction. Please try again."
              );
            } else if (errorMessage.includes("not configured")) {
              invalidFileTypeRef.current = false;
              setIsInvalidFileType(false);
              toast.warning(
                "Auto-fill is not configured. Please fill the form manually.",
                { duration: 5000 }
              );
              console.warn("Extraction service not configured");
            } else if (errorMessage.includes("temporarily unavailable")) {
              invalidFileTypeRef.current = false;
              setIsInvalidFileType(false);
              toast.error(
                "Extraction service is temporarily unavailable. Please try again in a few minutes.",
                { duration: 6000 }
              );
              setOcrError(
                "Extraction service is currently unavailable. You can still view the OCR text below."
              );
            } else {
              // Generic error
              invalidFileTypeRef.current = false;
              setIsInvalidFileType(false);
              toast.error(
                `Failed to extract data: ${errorMessage}. Please fill the form manually.`,
                { duration: 6000 }
              );
              setOcrError(
                `Extraction failed: ${errorMessage}. OCR text is still available below.`
              );
            }
          }
        }
      } else {
        // No OCR text extracted
        setProgress(100);
        setStatusMessage("Completed");
        setIsProcessingDone(true); // Mark as done even if no text extracted
        toast.warning(
          "No text could be extracted from the document. Please ensure the document is clear and try again.",
          { duration: 6000 }
        );
      }

      if (!cancelled) {
        setIsProcessing(false);
      }
    }

    void runOCR();

    return () => {
      cancelled = true;
    };
  }, [
    uploadedFile,
    setValue,
    processedIdFile,
    isProcessingDone,
    setIsProcessingDone,
    setProcessedIdFile,
  ]);

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
          onRemove={onRemoveFile}
        />

        {/* Invalid File Type Error Alert - Show even when file is removed */}
        {isInvalidFileType && ocrError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invalid File Type</AlertTitle>
            <AlertDescription>{ocrError}</AlertDescription>
          </Alert>
        )}

        {/* OCR Status */}
        {uploadedFile && !isInvalidFileType && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                {isProcessing
                  ? statusMessage || "Processing document..."
                  : ocrText
                  ? "Document processed successfully"
                  : ocrError
                  ? "Processing failed"
                  : ""}
              </p>
              {isProcessing && (
                <span className="text-xs text-gray-500">{progress}%</span>
              )}
            </div>
            {isProcessing && <Progress value={progress} />}

            {ocrError && !isInvalidFileType && (
              <p className="text-sm text-red-600">{ocrError}</p>
            )}

            {extractedData && (
              <div className="border rounded-md bg-green-50 p-4 space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-semibold text-green-800">
                    Information extracted from ID
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {extractedData.first_name && (
                    <div>
                      <span className="text-gray-600">First Name:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {extractedData.first_name}
                      </span>
                    </div>
                  )}
                  {extractedData.last_name && (
                    <div>
                      <span className="text-gray-600">Last Name:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {extractedData.last_name}
                      </span>
                    </div>
                  )}
                  {extractedData.middle_name && (
                    <div>
                      <span className="text-gray-600">Middle Name:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {extractedData.middle_name}
                      </span>
                    </div>
                  )}
                  {extractedData.date_of_birth && (
                    <div>
                      <span className="text-gray-600">Date of Birth:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {extractedData.date_of_birth}
                      </span>
                    </div>
                  )}
                  {extractedData.age && (
                    <div>
                      <span className="text-gray-600">Age:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {extractedData.age}
                      </span>
                    </div>
                  )}
                  {extractedData.sex && (
                    <div>
                      <span className="text-gray-600">Sex:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {extractedData.sex}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Fields have been auto-filled. Please review and edit if
                  needed.
                </p>
              </div>
            )}

            {ocrText && !extractedData && !isExtractingData && (
              <div className="border rounded-md bg-gray-50 p-3 max-h-48 overflow-auto">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Raw OCR Text:
                </p>
                <pre className="whitespace-pre-wrap text-xs text-gray-800">
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
