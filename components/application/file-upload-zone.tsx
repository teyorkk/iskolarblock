"use client";

import { Upload, X } from "lucide-react";
import type { FileUploadZoneProps } from "@/types/components";
import { Button } from "@/components/ui/button";

export function FileUploadZone({
  uploadedFile,
  isDragActive,
  getRootProps,
  getInputProps,
  error,
  label = "Upload Document",
  onRemove,
}: FileUploadZoneProps): React.JSX.Element {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the file picker
    onRemove?.();
  };

  return (
    <div>
      {label && (
        <label className="text-sm font-medium mb-2 block">{label}</label>
      )}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-orange-500 bg-orange-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        {uploadedFile ? (
          <div className="space-y-2">
            <p className="font-medium text-green-600">{uploadedFile.name}</p>
            <p className="text-sm text-gray-500">File uploaded successfully</p>
            {onRemove && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="mt-2"
              >
                <X className="w-4 h-4 mr-1" />
                Remove File
              </Button>
            )}
          </div>
        ) : (
          <div>
            <p className="font-medium text-gray-900">
              {isDragActive ? "Drop the file here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-sm text-gray-500">PDF, JPG, or PNG (max. 5MB)</p>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}

