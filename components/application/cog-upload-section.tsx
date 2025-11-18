import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUploadZone } from "./file-upload-zone";
import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import type { COGExtractionResponse } from "@/lib/services/document-extraction";

interface CogUploadSectionProps {
  certificateOfGrades: File | null;
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  isDragActive: boolean;
  error?: string;
  onRemove?: () => void;
  isProcessing: boolean;
  progress: number;
  statusMessage: string;
  extractedData: COGExtractionResponse | null;
  ocrError: string;
  cogUploadLocked?: boolean;
  existingCogFileUrl?: string | null;
  onUnlockCogUpload?: () => void;
}

export function CogUploadSection({
  certificateOfGrades,
  getRootProps,
  getInputProps,
  isDragActive,
  error,
  onRemove,
  isProcessing,
  progress,
  statusMessage,
  extractedData,
  ocrError,
  cogUploadLocked,
  existingCogFileUrl,
  onUnlockCogUpload,
}: CogUploadSectionProps) {
  return (
    <div className="space-y-3">
      {cogUploadLocked && !certificateOfGrades ? (
        <div className="flex items-center justify-between rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <span>
            An existing Certificate of Grades is already on file. You can view
            it below or replace it with a new upload.
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
          isDragActive={isDragActive}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          error={error}
          label="Certificate of Grades"
          onRemove={onRemove}
        />
      )}

      {/* COG Processing Status */}
      {isProcessing && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600">{statusMessage}</p>
        </div>
      )}

      {/* COG Extracted Data Success */}
      {extractedData && !isProcessing && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start">
            <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Certificate of Grades processed successfully
              </p>
              <div className="mt-2 text-xs text-green-700 space-y-1">
                {extractedData.name && <p>• Student: {extractedData.name}</p>}
                {extractedData.school && (
                  <p>• School: {extractedData.school}</p>
                )}
                {extractedData.gwa && <p>• GWA: {extractedData.gwa}</p>}
                {extractedData.subjects && (
                  <p>• Subjects: {extractedData.subjects.length} found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COG Error Display */}
      {ocrError && !isProcessing && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                Processing error
              </p>
              <p className="text-xs text-red-700 mt-1">{ocrError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

