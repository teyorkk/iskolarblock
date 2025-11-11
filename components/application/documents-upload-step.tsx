"use client";

import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
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
import {
  extractCOGData,
  extractCORData,
  type COGExtractionResponse,
  type CORExtractionResponse,
} from "@/lib/services/document-extraction";
import { toast } from "sonner";

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
}: DocumentsUploadStepProps<T>): React.JSX.Element {
  // Certificate of Grades state
  const [cogOcrText, setCogOcrText] = useState<string>("");
  const [cogOcrError, setCogOcrError] = useState<string>("");
  const [isCogProcessing, setIsCogProcessing] = useState<boolean>(false);
  const [cogProgress, setCogProgress] = useState<number>(0);
  const [cogStatusMessage, setCogStatusMessage] = useState<string>("");
  const [cogExtractedData, setCogExtractedData] =
    useState<COGExtractionResponse | null>(null);

  // Certificate of Registration state
  const [corOcrText, setCorOcrText] = useState<string>("");
  const [corOcrError, setCorOcrError] = useState<string>("");
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

  // Process Certificate of Grades
  useEffect(() => {
    let cancelled = false;

    async function runCOGOCR() {
      if (!certificateOfGrades) {
        setCogOcrText("");
        setCogOcrError("");
        setCogProgress(0);
        setCogStatusMessage("");
        setIsCogProcessing(false);
        setCogExtractedData(null);
        setIsCogProcessingDone(false);
        setProcessedCogFile("");
        return;
      }

      // Skip if we've already processed this exact file
      if (
        certificateOfGrades.name === processedCogFile &&
        isCogProcessingDone
      ) {
        return;
      }

      setCogOcrText("");
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
      setCogProgress(80);

      // Step 2: Send to webhook for data extraction
      if (result.text && result.text.trim().length > 0) {
        setCogStatusMessage("Extracting data from document...");
        try {
          const extractedData = await extractCOGData(result.text);

          if (cancelled) return;

          if (extractedData) {
            setCogExtractedData(extractedData);
            setCogProgress(100);
            setCogStatusMessage("Extraction complete!");
            setProcessedCogFile(certificateOfGrades.name); // Mark as processed in parent
            setIsCogProcessingDone(true); // Mark processing as complete
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
          setCogOcrError(errorMessage);
          setCogProgress(0);
          toast.error("Failed to extract data from Certificate of Grades", {
            description: errorMessage,
          });
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
  }, [certificateOfGrades, processedCogFile, isCogProcessingDone, setIsCogProcessingDone, setProcessedCogFile]);

  // Process Certificate of Registration
  useEffect(() => {
    let cancelled = false;

    async function runCOROCR() {
      if (!certificateOfRegistration) {
        setCorOcrText("");
        setCorOcrError("");
        setCorProgress(0);
        setCorStatusMessage("");
        setIsCorProcessing(false);
        setCorExtractedData(null);
        setIsCorProcessingDone(false);
        setProcessedCorFile("");
        return;
      }

      // Skip if we've already processed this exact file
      if (
        certificateOfRegistration.name === processedCorFile &&
        isCorProcessingDone
      ) {
        return;
      }

      setCorOcrText("");
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
      setCorProgress(80);

      // Step 2: Send to webhook for data extraction
      if (result.text && result.text.trim().length > 0) {
        setCorStatusMessage("Extracting data from document...");
        try {
          const extractedData = await extractCORData(result.text);

          if (cancelled) return;

          if (extractedData) {
            setCorExtractedData(extractedData);
            setCorProgress(100);
            setCorStatusMessage("Extraction complete!");
            setProcessedCorFile(certificateOfRegistration.name); // Mark as processed in parent
            setIsCorProcessingDone(true); // Mark processing as complete
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
          setCorOcrError(errorMessage);
          setCorProgress(0);
          toast.error(
            "Failed to extract data from Certificate of Registration",
            {
              description: errorMessage,
            }
          );
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
  }, [certificateOfRegistration, processedCorFile, isCorProcessingDone, setIsCorProcessingDone, setProcessedCorFile]);

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
        {/* Certificate of Grades Upload */}
        <div className="space-y-3">
          <FileUploadZone
            uploadedFile={certificateOfGrades}
            isDragActive={isDragActiveGrades}
            getRootProps={getRootPropsGrades}
            getInputProps={getInputPropsGrades}
            error={gradesErrorText}
            label="Certificate of Grades"
            onRemove={onRemoveGradesFile}
          />

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
          {cogOcrError && !isCogProcessing && (
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
          <FileUploadZone
            uploadedFile={certificateOfRegistration}
            isDragActive={isDragActiveRegistration}
            getRootProps={getRootPropsRegistration}
            getInputProps={getInputPropsRegistration}
            error={registrationErrorText}
            label="Certificate of Registration"
            onRemove={onRemoveRegistrationFile}
          />

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
          {corOcrError && !isCorProcessing && (
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
