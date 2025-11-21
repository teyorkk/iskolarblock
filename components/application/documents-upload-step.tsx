"use client";

import { Upload, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  extractCOGData,
  extractCORData,
  type COGExtractionResponse,
  type CORExtractionResponse,
} from "@/lib/services/document-extraction";
import { toast } from "sonner";
import { useSession } from "@/components/session-provider";

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
  onCogInvalidFileTypeChange?: (isInvalid: boolean) => void;
  onCorInvalidFileTypeChange?: (isInvalid: boolean) => void;
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
  onCogInvalidFileTypeChange,
  onCorInvalidFileTypeChange,
}: DocumentsUploadStepProps<T>): React.JSX.Element {
  const { user } = useSession();
  // Certificate of Grades state
  const [_cogOcrText, setCogOcrText] = useState<string>("");
  const [cogOcrError, setCogOcrError] = useState<string>("");
  const [isCogInvalidFileType, setIsCogInvalidFileType] =
    useState<boolean>(false);
  const [cogInvalidFileTypeError, setCogInvalidFileTypeError] =
    useState<string>("");
  const [isCogProcessing, setIsCogProcessing] = useState<boolean>(false);
  const [cogProgress, setCogProgress] = useState<number>(0);
  const [cogStatusMessage, setCogStatusMessage] = useState<string>("");
  const [cogExtractedData, setCogExtractedData] =
    useState<COGExtractionResponse | null>(null);

  // Certificate of Registration state
  const [_corOcrText, setCorOcrText] = useState<string>("");
  const [corOcrError, setCorOcrError] = useState<string>("");
  const [isCorInvalidFileType, setIsCorInvalidFileType] =
    useState<boolean>(false);
  const [corInvalidFileTypeError, setCorInvalidFileTypeError] =
    useState<string>("");
  const [isCorProcessing, setIsCorProcessing] = useState<boolean>(false);
  const [corProgress, setCorProgress] = useState<number>(0);
  const [corStatusMessage, setCorStatusMessage] = useState<string>("");
  const [corExtractedData, setCorExtractedData] =
    useState<CORExtractionResponse | null>(null);

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

  const hasErrors = cogOcrError || corOcrError;
  const bothFilesUploaded = certificateOfGrades && certificateOfRegistration;
  const bothProcessingDone = isCogProcessingDone && isCorProcessingDone;
  const missingDocuments = !certificateOfGrades || !certificateOfRegistration;

  // Process Certificate of Grades
  useEffect(() => {
    let cancelled = false;

    async function runCOGOCR() {
      if (!certificateOfGrades) {
        // Clear invalid file type state when file is removed to enable submit button
        // But keep the error message visible via Alert component
        // Check if there's an invalid file type error message to preserve it
        if (
          cogInvalidFileTypeError &&
          cogInvalidFileTypeError.includes("Invalid file type")
        ) {
          setIsCogInvalidFileType(false);
          onCogInvalidFileTypeChange?.(false);
          // Don't clear cogInvalidFileTypeError - keep it visible in the Alert
        } else {
          // Only clear errors if it's not an invalid file type error
          setCogOcrError("");
          setCogInvalidFileTypeError("");
        }
        setCogOcrText("");
        onCogOcrChange?.("", null);
        setCogProgress(0);
        setCogStatusMessage("");
        setIsCogProcessing(false);
        setCogExtractedData(null);
        setIsCogProcessingDone(false);
        setProcessedCogFile("");
        return;
      }

      // Clear invalid file type error when a new file is uploaded
      if (
        isCogInvalidFileType &&
        certificateOfGrades.name !== processedCogFile
      ) {
        setIsCogInvalidFileType(false);
        onCogInvalidFileTypeChange?.(false);
        setCogOcrError("");
        setCogInvalidFileTypeError("");
      }

      // Skip if we've already processed this exact file
      if (
        certificateOfGrades.name === processedCogFile &&
        isCogProcessingDone
      ) {
        return;
      }

      setCogOcrText("");
      onCogOcrChange?.("", null);
      setCogOcrError("");
      setCogProgress(1);
      setIsCogProcessing(true);
      setCogExtractedData(null);

      // Step 1: Extract text from image/PDF
      const result = await extractText(certificateOfGrades, (progressInfo) => {
        if (!cancelled) {
          setCogProgress(Math.min(80, progressInfo.progress)); // Cap at 80% for OCR
          setCogStatusMessage(progressInfo.status);
        }
      });

      if (cancelled) return;

      if (result.error) {
        setCogOcrError(result.error);
        setCogProgress(0);
        setIsCogProcessing(false);
        toast.error("Failed to process Certificate of Grades", {
          description: result.error,
        });
        return;
      }

      setCogOcrText(result.text);
      onCogOcrChange?.(result.text, null);
      setCogProgress(80);

      // Step 2: Send to webhook for data extraction (and upload to Supabase)
      if (result.text && result.text.trim().length > 0) {
        setCogStatusMessage("Extracting data from document...");
        try {
          const extractedData = await extractCOGData(
            result.text,
            certificateOfGrades,
            user?.id
          );

          if (cancelled) return;

          if (extractedData) {
            setCogExtractedData(extractedData);
            onCogOcrChange?.(
              result.text,
              extractedData,
              extractedData.fileUrl || undefined
            );
            setCogProgress(100);
            setCogStatusMessage("Extraction complete!");
            setProcessedCogFile(certificateOfGrades.name); // Mark as processed in parent
            setIsCogProcessingDone(true); // Mark processing as complete
            // Clear invalid file type error if data was successfully extracted
            setIsCogInvalidFileType(false);
            setCogInvalidFileTypeError("");
            setCogOcrError("");
            onCogInvalidFileTypeChange?.(false);
            toast.success("Certificate of Grades processed successfully", {
              description: `Extracted data for ${
                extractedData.name || "student"
              }`,
            });
          } else {
            setCogOcrError("No data could be extracted from the document");
            setCogProgress(0);
            toast.warning("No data extracted from Certificate of Grades", {
              description: "The document may not contain readable information",
            });
          }
        } catch (error) {
          if (cancelled) return;

          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          // Check if the uploaded file is not a valid Certificate of Grades
          if (
            errorMessage.includes("Invalid file type") ||
            errorMessage.includes("not a valid Certificate of Grades") ||
            errorMessage.includes("Certificate of Grades document")
          ) {
            const fullErrorMessage = `${errorMessage}. Please remove this file and upload a valid Certificate of Grades document.`;
            // Set the state BEFORE removing file so useEffect knows to preserve the error
            setIsCogInvalidFileType(true);
            setCogInvalidFileTypeError(fullErrorMessage);
            setCogOcrError(fullErrorMessage);
            toast.error(errorMessage, { duration: 8000 });
            // Clear the uploaded file to force re-upload
            onRemoveGradesFile?.();
            setCogOcrText("");
            onCogOcrChange?.("", null);
            setCogExtractedData(null);
            setIsCogProcessingDone(false);
            setProcessedCogFile("");
            setCogProgress(0);
            // Clear invalid file type state after removing file to enable submit button
            // The error message will still be shown via Alert component
            setIsCogInvalidFileType(false);
            onCogInvalidFileTypeChange?.(false);
            return;
          } else {
            setIsCogInvalidFileType(false);
            onCogInvalidFileTypeChange?.(false);
            setCogOcrError(errorMessage);
            setCogProgress(0);
            toast.error("Failed to extract data from Certificate of Grades", {
              description: errorMessage,
            });
          }
        }
      } else {
        setCogOcrError("No text could be extracted from the image");
        setCogProgress(0);
        setIsCogProcessingDone(true); // Mark as done even if extraction failed
      }

      setIsCogProcessing(false);
    }

    void runCOGOCR();

    return () => {
      cancelled = true;
    };
  }, [
    certificateOfGrades,
    processedCogFile,
    isCogProcessingDone,
    setIsCogProcessingDone,
    setProcessedCogFile,
  ]);

  // Process Certificate of Registration
  useEffect(() => {
    let cancelled = false;

    async function runCOROCR() {
      if (!certificateOfRegistration) {
        // Clear invalid file type state when file is removed to enable submit button
        // But keep the error message visible via Alert component
        // Check if there's an invalid file type error message to preserve it
        if (
          corInvalidFileTypeError &&
          corInvalidFileTypeError.includes("Invalid file type")
        ) {
          setIsCorInvalidFileType(false);
          onCorInvalidFileTypeChange?.(false);
          // Don't clear corInvalidFileTypeError - keep it visible in the Alert
        } else {
          // Only clear errors if it's not an invalid file type error
          setCorOcrError("");
          setCorInvalidFileTypeError("");
        }
        setCorOcrText("");
        onCorOcrChange?.("", null);
        setCorProgress(0);
        setCorStatusMessage("");
        setIsCorProcessing(false);
        setCorExtractedData(null);
        setIsCorProcessingDone(false);
        setProcessedCorFile("");
        return;
      }

      // Clear invalid file type error when a new file is uploaded
      if (
        isCorInvalidFileType &&
        certificateOfRegistration.name !== processedCorFile
      ) {
        setIsCorInvalidFileType(false);
        onCorInvalidFileTypeChange?.(false);
        setCorOcrError("");
        setCorInvalidFileTypeError("");
      }

      // Skip if we've already processed this exact file
      if (
        certificateOfRegistration.name === processedCorFile &&
        isCorProcessingDone
      ) {
        return;
      }

      setCorOcrText("");
      onCorOcrChange?.("", null);
      setCorOcrError("");
      setCorProgress(1);
      setIsCorProcessing(true);
      setCorExtractedData(null);

      // Step 1: Extract text from image/PDF
      const result = await extractText(
        certificateOfRegistration,
        (progressInfo) => {
          if (!cancelled) {
            setCorProgress(Math.min(80, progressInfo.progress)); // Cap at 80% for OCR
            setCorStatusMessage(progressInfo.status);
          }
        }
      );

      if (cancelled) return;

      if (result.error) {
        setCorOcrError(result.error);
        setCorProgress(0);
        setIsCorProcessing(false);
        toast.error("Failed to process Certificate of Registration", {
          description: result.error,
        });
        return;
      }

      setCorOcrText(result.text);
      onCorOcrChange?.(result.text, null);
      setCorProgress(80);

      // Step 2: Send to webhook for data extraction (and upload to Supabase)
      if (result.text && result.text.trim().length > 0) {
        setCorStatusMessage("Extracting data from document...");
        try {
          const extractedData = await extractCORData(
            result.text,
            certificateOfRegistration,
            user?.id
          );

          if (cancelled) return;

          if (extractedData) {
            setCorExtractedData(extractedData);
            onCorOcrChange?.(
              result.text,
              extractedData,
              extractedData.fileUrl || undefined
            );
            setCorProgress(100);
            setCorStatusMessage("Extraction complete!");
            setProcessedCorFile(certificateOfRegistration.name); // Mark as processed in parent
            setIsCorProcessingDone(true); // Mark processing as complete
            // Clear invalid file type error if data was successfully extracted
            setIsCorInvalidFileType(false);
            setCorInvalidFileTypeError("");
            setCorOcrError("");
            onCorInvalidFileTypeChange?.(false);
            toast.success(
              "Certificate of Registration processed successfully",
              {
                description: `Extracted data for ${
                  extractedData.name || "student"
                }`,
              }
            );
          } else {
            setCorOcrError("No data could be extracted from the document");
            setCorProgress(0);
            toast.warning(
              "No data extracted from Certificate of Registration",
              {
                description:
                  "The document may not contain readable information",
              }
            );
          }
        } catch (error) {
          if (cancelled) return;

          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          // Check if the uploaded file is not a valid Certificate of Registration
          if (
            errorMessage.includes("Invalid file type") ||
            errorMessage.includes("not a valid Certificate of Registration") ||
            errorMessage.includes("Certificate of Registration document")
          ) {
            const fullErrorMessage = `${errorMessage}. Please remove this file and upload a valid Certificate of Registration document.`;
            // Set the state BEFORE removing file so useEffect knows to preserve the error
            setIsCorInvalidFileType(true);
            setCorInvalidFileTypeError(fullErrorMessage);
            setCorOcrError(fullErrorMessage);
            toast.error(errorMessage, { duration: 8000 });
            // Clear the uploaded file to force re-upload
            onRemoveRegistrationFile?.();
            setCorOcrText("");
            onCorOcrChange?.("", null);
            setCorExtractedData(null);
            setIsCorProcessingDone(false);
            setProcessedCorFile("");
            setCorProgress(0);
            // Clear invalid file type state after removing file to enable submit button
            // The error message will still be shown via Alert component
            setIsCorInvalidFileType(false);
            onCorInvalidFileTypeChange?.(false);
            return;
          } else {
            setIsCorInvalidFileType(false);
            onCorInvalidFileTypeChange?.(false);
            setCorOcrError(errorMessage);
            setCorProgress(0);
            toast.error(
              "Failed to extract data from Certificate of Registration",
              {
                description: errorMessage,
              }
            );
          }
        }
      } else {
        setCorOcrError("No text could be extracted from the image");
        setCorProgress(0);
        setIsCorProcessingDone(true); // Mark as done even if extraction failed
      }

      setIsCorProcessing(false);
    }

    void runCOROCR();

    return () => {
      cancelled = true;
    };
  }, [
    certificateOfRegistration,
    processedCorFile,
    isCorProcessingDone,
    setIsCorProcessingDone,
    setProcessedCorFile,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2 text-orange-500" />
          Upload Required Documents
        </CardTitle>
        <CardDescription>
          Upload your certificate of grades and/or certificate of registration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status Alert */}
        {bothFilesUploaded && !bothProcessingDone && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Processing Documents</AlertTitle>
            <AlertDescription>
              Please wait while we extract and verify your documents...
            </AlertDescription>
          </Alert>
        )}
        {bothFilesUploaded && bothProcessingDone && !hasErrors && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">
              Documents Verified
            </AlertTitle>
            <AlertDescription className="text-green-600">
              Document(s) have been successfully processed.
            </AlertDescription>
          </Alert>
        )}
        {hasErrors && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Processing Errors</AlertTitle>
            <AlertDescription>
              Some documents encountered errors during processing. You can still
              proceed, but please verify your information.
            </AlertDescription>
          </Alert>
        )}
        {!hasErrors && missingDocuments && (
          <Alert className="border-blue-200 bg-blue-50 text-blue-700">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Submit now, finish later</AlertTitle>
            <AlertDescription>
              You may submit with at least one document. Upload the other
              document later if needed.
            </AlertDescription>
          </Alert>
        )}

        {/* Certificate of Grades Upload */}
        <div className="space-y-3">
          {/* Invalid File Type Error Alert for COG */}
          {cogInvalidFileTypeError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invalid File Type</AlertTitle>
              <AlertDescription>{cogInvalidFileTypeError}</AlertDescription>
            </Alert>
          )}

          {cogUploadLocked && !certificateOfGrades ? (
            <div className="flex items-center justify-between rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              <span>
                An existing Certificate of Grades is already on file. You can
                view it below or replace it with a new upload.
              </span>
              <div className="flex gap-2">
                {existingCogFileUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(existingCogFileUrl, "_blank")}
                    className="text-black hover:text-gray-600"
                  >
                    View
                  </Button>
                )}
                {onUnlockCogUpload && (
                  <Button type="button" size="sm" onClick={onUnlockCogUpload}>
                    Replace
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <FileUploadZone
              uploadedFile={certificateOfGrades}
              isDragActive={isDragActiveGrades}
              getRootProps={getRootPropsGrades}
              getInputProps={getInputPropsGrades}
              error={gradesErrorText}
              label="Certificate of Grades"
              onRemove={onRemoveGradesFile}
            />
          )}

          {/* COG Processing Status */}
          {isCogProcessing && (
            <div className="space-y-2">
              <Progress value={cogProgress} className="w-full" />
              <p className="text-sm text-gray-600">{cogStatusMessage}</p>
            </div>
          )}

          {/* COG Extracted Data Success */}
          {cogExtractedData && !isCogProcessing && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Certificate of Grades processed successfully
                  </p>
                  <div className="mt-2 text-xs text-green-700 space-y-1">
                    {cogExtractedData.name && (
                      <p>• Student: {cogExtractedData.name}</p>
                    )}
                    {cogExtractedData.school && (
                      <p>• School: {cogExtractedData.school}</p>
                    )}
                    {cogExtractedData.gwa && (
                      <p>• GWA: {cogExtractedData.gwa}</p>
                    )}
                    {cogExtractedData.subjects && (
                      <p>
                        • Subjects: {cogExtractedData.subjects.length} found
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COG Error Display */}
          {cogOcrError && !isCogProcessing && !isCogInvalidFileType && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    Processing error
                  </p>
                  <p className="text-xs text-red-700 mt-1">{cogOcrError}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Certificate of Registration Upload */}
        <div className="space-y-3">
          {/* Invalid File Type Error Alert for COR */}
          {corInvalidFileTypeError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invalid File Type</AlertTitle>
              <AlertDescription>{corInvalidFileTypeError}</AlertDescription>
            </Alert>
          )}

          {corUploadLocked && !certificateOfRegistration ? (
            <div className="flex items-center justify-between rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              <span>
                An existing Certificate of Registration is already on file. View
                it or replace with a new upload.
              </span>
              <div className="flex gap-2">
                {existingCorFileUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(existingCorFileUrl, "_blank")}
                    className="text-black hover:text-gray-600"
                  >
                    View
                  </Button>
                )}
                {onUnlockCorUpload && (
                  <Button type="button" size="sm" onClick={onUnlockCorUpload}>
                    Replace
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <FileUploadZone
              uploadedFile={certificateOfRegistration}
              isDragActive={isDragActiveRegistration}
              getRootProps={getRootPropsRegistration}
              getInputProps={getInputPropsRegistration}
              error={registrationErrorText}
              label="Certificate of Registration"
              onRemove={onRemoveRegistrationFile}
            />
          )}

          {existingCorFileUrl && !certificateOfRegistration && (
            <div className="flex items-center justify-between text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
              <span>An existing Certificate of Registration is on file.</span>
              <Button
                type="button"
                variant="link"
                className="px-0"
                onClick={() => window.open(existingCorFileUrl, "_blank")}
              >
                View
              </Button>
            </div>
          )}

          {/* COR Processing Status */}
          {isCorProcessing && (
            <div className="space-y-2">
              <Progress value={corProgress} className="w-full" />
              <p className="text-sm text-gray-600">{corStatusMessage}</p>
            </div>
          )}

          {/* COR Extracted Data Success */}
          {corExtractedData && !isCorProcessing && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Certificate of Registration processed successfully
                  </p>
                  <div className="mt-2 text-xs text-green-700 space-y-1">
                    {corExtractedData.name && (
                      <p>• Student: {corExtractedData.name}</p>
                    )}
                    {corExtractedData.school && (
                      <p>• School: {corExtractedData.school}</p>
                    )}
                    {corExtractedData.total_units && (
                      <p>• Total Units: {corExtractedData.total_units}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COR Error Display */}
          {corOcrError && !isCorProcessing && !isCorInvalidFileType && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    Processing error
                  </p>
                  <p className="text-xs text-red-700 mt-1">{corOcrError}</p>
                </div>
              </div>
            </div>
          )}
        </div>

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
