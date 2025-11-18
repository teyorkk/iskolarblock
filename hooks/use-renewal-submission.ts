import { useState } from "react";
import { toast } from "sonner";
import type {
  COGExtractionResponse,
  CORExtractionResponse,
} from "@/lib/services/document-extraction";

interface UseRenewalSubmissionOptions {
  uploadedFile: File | null;
  certificateOfGrades: File | null;
  certificateOfRegistration: File | null;
  idOcrText: string;
  cogOcrText: string;
  cogExtractedData: COGExtractionResponse | null;
  cogFileUrl: string;
  corOcrText: string;
  corExtractedData: CORExtractionResponse | null;
  corFileUrl: string;
}

const readFileAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function useRenewalSubmission(options: UseRenewalSubmissionOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<"PENDING" | "APPROVED">("PENDING");
  const [submittedApplicationId, setSubmittedApplicationId] = useState<string | null>(null);

  const onSubmit = async (): Promise<void> => {
    console.log("🚀 Renewal submission called");
    try {
      setIsSubmitting(true);

      // Convert ID file to base64
      let idImageBase64 = "";
      if (options.uploadedFile) {
        idImageBase64 = await readFileAsBase64(options.uploadedFile);
      }

      let cogFileBase64: string | null = null;
      if (options.certificateOfGrades) {
        try {
          cogFileBase64 = await readFileAsBase64(options.certificateOfGrades);
        } catch (error) {
          console.error("COG file conversion error:", error);
          toast.error("Failed to read Certificate of Grades file");
          setIsSubmitting(false);
          return;
        }
      }

      let corFileBase64: string | null = null;
      if (options.certificateOfRegistration) {
        try {
          corFileBase64 = await readFileAsBase64(options.certificateOfRegistration);
        } catch (error) {
          console.error("COR file conversion error:", error);
          toast.error("Failed to read Certificate of Registration file");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare submission data
      const submissionData = {
        idImage: idImageBase64,
        idOcr: {
          rawText: options.idOcrText,
        },
        cogOcr: {
          rawText: options.cogOcrText || "",
          extractedData: options.cogExtractedData || null,
          fileUrl: options.cogFileUrl || undefined,
        },
        corOcr: {
          rawText: options.corOcrText || "",
          extractedData: options.corExtractedData || null,
          fileUrl: options.corFileUrl || undefined,
        },
        cogFile: cogFileBase64,
        corFile: corFileBase64,
        cogFileName: options.certificateOfGrades?.name ?? null,
        corFileName: options.certificateOfRegistration?.name ?? null,
      };

      const response = await fetch("/api/applications/renew", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit renewal application");
      }

      const result = await response.json();
      const resultingStatus =
        typeof result.status === "string" ? result.status : "PENDING";
      setSubmittedApplicationId(result.applicationId || `SCH-${Date.now()}`);
      setSubmittedStatus(
        resultingStatus === "APPROVED" ? "APPROVED" : "PENDING"
      );
      setIsSubmitted(true);
      setIsSubmitting(false);
      toast.success(
        resultingStatus === "APPROVED"
          ? "Renewal approved instantly!"
          : "Renewal application submitted!",
        {
          description:
            resultingStatus === "APPROVED"
              ? "All required documents were provided."
              : "Missing documents detected. Submit the rest to move from Pending to Approved.",
        }
      );
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit renewal application";
      toast.error(errorMessage);
      console.error("Renewal submission error:", error);
    }
  };

  return {
    isSubmitting,
    isSubmitted,
    submittedStatus,
    submittedApplicationId,
    onSubmit,
  };
}

