import { useEffect, useState } from "react";
import { toast } from "sonner";
import { extractText } from "@/lib/services/ocr";
import {
  extractCOGData,
  type COGExtractionResponse,
} from "@/lib/services/document-extraction";
import { useSession } from "@/components/session-provider";

interface UseCogProcessingOptions {
  certificateOfGrades: File | null;
  processedCogFile: string;
  isCogProcessingDone: boolean;
  setIsCogProcessingDone: (done: boolean) => void;
  setProcessedCogFile: (filename: string) => void;
  onOcrChange?: (
    text: string,
    data: COGExtractionResponse | null,
    fileUrl?: string
  ) => void;
}

export function useCogProcessing(options: UseCogProcessingOptions) {
  const { user } = useSession();
  const [ocrText, setOcrText] = useState<string>("");
  const [ocrError, setOcrError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [extractedData, setExtractedData] = useState<COGExtractionResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function runCOGOCR() {
      if (!options.certificateOfGrades) {
        setOcrText("");
        options.onOcrChange?.("", null);
        setOcrError("");
        setProgress(0);
        setStatusMessage("");
        setIsProcessing(false);
        setExtractedData(null);
        options.setIsCogProcessingDone(false);
        options.setProcessedCogFile("");
        return;
      }

      // Skip if we've already processed this exact file
      if (
        options.certificateOfGrades.name === options.processedCogFile &&
        options.isCogProcessingDone
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
      const result = await extractText(options.certificateOfGrades, (progressInfo) => {
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
        toast.error("Failed to process Certificate of Grades", {
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
          const extracted = await extractCOGData(
            result.text,
            options.certificateOfGrades,
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
            options.setProcessedCogFile(options.certificateOfGrades.name);
            options.setIsCogProcessingDone(true);
            toast.success("Certificate of Grades processed successfully", {
              description: `Extracted data for ${extracted.name || "student"}`,
            });
          } else {
            setOcrError("No data could be extracted from the document");
            setProgress(0);
            toast.warning("No data extracted from Certificate of Grades", {
              description: "The document may not contain readable information",
            });
          }
        } catch (error) {
          if (cancelled) return;

          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          setOcrError(errorMessage);
          setProgress(0);
          toast.error("Failed to extract data from Certificate of Grades", {
            description: errorMessage,
          });
        }
      } else {
        setOcrError("No text could be extracted from the image");
        setProgress(0);
        options.setIsCogProcessingDone(true);
      }

      setIsProcessing(false);
    }

    void runCOGOCR();

    return () => {
      cancelled = true;
    };
  }, [
    options.certificateOfGrades,
    options.processedCogFile,
    options.isCogProcessingDone,
    options.setIsCogProcessingDone,
    options.setProcessedCogFile,
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

