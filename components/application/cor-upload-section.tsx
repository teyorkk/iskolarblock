import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUploadZone } from "./file-upload-zone";
import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import type { CORExtractionResponse } from "@/lib/services/document-extraction";

interface CorUploadSectionProps {
  certificateOfRegistration: File | null;
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  isDragActive: boolean;
  error?: string;
  onRemove?: () => void;
  isProcessing: boolean;
  progress: number;
  statusMessage: string;
  extractedData: CORExtractionResponse | null;
  ocrError: string;
  corUploadLocked?: boolean;
  existingCorFileUrl?: string | null;
  onUnlockCorUpload?: () => void;
}

export function CorUploadSection({
  certificateOfRegistration,
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
  corUploadLocked,
  existingCorFileUrl,
  onUnlockCorUpload,
}: CorUploadSectionProps) {
  return (
    <div className="space-y-3">
      {corUploadLocked && !certificateOfRegistration ? (
        <div className="flex items-center justify-between rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <span>
            An existing Certificate of Registration is already on file. View it
            or replace with a new upload.
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
          isDragActive={isDragActive}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          error={error}
          label="Certificate of Registration"
          onRemove={onRemove}
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
      {isProcessing && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600">{statusMessage}</p>
        </div>
      )}

      {/* COR Extracted Data Success */}
      {extractedData && !isProcessing && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start">
            <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Certificate of Registration processed successfully
              </p>
              <div className="mt-2 text-xs text-green-700 space-y-1">
                {extractedData.name && <p>• Student: {extractedData.name}</p>}
                {extractedData.school && (
                  <p>• School: {extractedData.school}</p>
                )}
                {extractedData.total_units && (
                  <p>• Total Units: {extractedData.total_units}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COR Error Display */}
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

