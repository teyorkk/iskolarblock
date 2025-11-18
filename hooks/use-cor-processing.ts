import { useEffect, useState } from "react";
import { toast } from "sonner";
import { extractText } from "@/lib/services/ocr";
import {
  extractCORData,
  type CORExtractionResponse,
} from "@/lib/services/document-extraction";
import { useSession } from "@/components/session-provider";

interface UseCorProcessingOptions {
  certificateOfRegistration: File | null;
  processedCorFile: string;
  isCorProcessingDone: boolean;
  setIsCorProcessingDone: (done: boolean) => void;
  setProcessedCorFile: (filename: string) => void;
  onOcrChange?: (
    text: string,
    data: CORExtractionResponse | null,
    fileUrl?: string
  ) => void;
}

export function useCorProcessing(options: UseCorProcessingOptions) {
  const { user } = useSession();
  const [ocrText, setOcrText] = useState<string>("");
  const [ocrError, setOcrError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [extractedData, setExtractedData] = useState<CORExtractionResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function runCOROCR() {
      if (!options.certificateOfRegistration) {
        setOcrText("");
        options.onOcrChange?.("", null);
        setOcrError("");
        setProgress(0);
        setStatusMessage("");
        setIsProcessing(false);
        setExtractedData(null);
        options.setIsCorProcessingDone(false);
        options.setProcessedCorFile("");
        return;
      }

      // Skip if we've already processed this exact file
      if (
        options.certificateOfRegistration.name === options.processedCorFile &&
        options.isCorProcessingDone
      ) {
        return;
      }

      setOcrText("");
      options.onOcrChange?.("", null);
      setOcrError("");
      setProgress(1);
      setIsProcessing(true);
      setExtractedData(null);

      // Step 1: Extract text from image/PDF
      const result = await extractText(
        options.certificateOfRegistration,
        (progressInfo) => {
          if (!cancelled) {
            setProgress(Math.min(80, progressInfo.progress)); // Cap at 80% for OCR
            setStatusMessage(progressInfo.status);
          }
        }
      );

      if (cancelled) return;

      if (result.error) {
        setOcrError(result.error);
        setProgress(0);
        setIsProcessing(false);
        toast.error("Failed to process Certificate of Registration", {
          description: result.error,
        });
        return;
      }

      setOcrText(result.text);
      options.onOcrChange?.(result.text, null);
      setProgress(80);

      // Step 2: Send to webhook for data extraction (and upload to Supabase)
      if (result.text && result.text.trim().length > 0) {
        setStatusMessage("Extracting data from document...");
        try {
          const extracted = await extractCORData(
            result.text,
            options.certificateOfRegistration,
            user?.id
          );

          if (cancelled) return;

          if (extracted) {
            setExtractedData(extracted);
            options.onOcrChange?.(
              result.text,
              extracted,
              extracted.fileUrl || undefined
            );
            setProgress(100);
            setStatusMessage("Extraction complete!");
            options.setProcessedCorFile(options.certificateOfRegistration.name);
            options.setIsCorProcessingDone(true);
            toast.success(
              "Certificate of Registration processed successfully",
              {
                description: `Extracted data for ${extracted.name || "student"}`,
              }
            );
          } else {
            setOcrError("No data could be extracted from the document");
            setProgress(0);
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
          setOcrError(errorMessage);
          setProgress(0);
          toast.error(
            "Failed to extract data from Certificate of Registration",
            {
              description: errorMessage,
            }
          );
        }
      } else {
        setOcrError("No text could be extracted from the image");
        setProgress(0);
        options.setIsCorProcessingDone(true);
      }

      setIsProcessing(false);
    }

    void runCOROCR();

    return () => {
      cancelled = true;
    };
  }, [
    options.certificateOfRegistration,
    options.processedCorFile,
    options.isCorProcessingDone,
    options.setIsCorProcessingDone,
    options.setProcessedCorFile,
    options.onOcrChange,
    user?.id,
  ]);

  return {
    ocrText,
    ocrError,
    isProcessing,
    progress,
    statusMessage,
    extractedData,
  };
}

