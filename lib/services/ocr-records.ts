import { randomUUID } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface OCRData {
  rawText: string;
  processedText?: string;
}

interface CreateOCRRecordsParams {
  supabase: ReturnType<typeof getSupabaseServerClient>;
  userId: string;
  applicationId: string;
  idOcr?: OCRData;
  cogOcr?: OCRData;
  corOcr?: OCRData;
}

export async function createOCRRecords({
  supabase,
  userId,
  applicationId,
  idOcr,
  cogOcr,
  corOcr,
}: CreateOCRRecordsParams): Promise<void> {
  const ocrRawRecords = [];

  // ID OCR
  if (idOcr?.rawText) {
    const idOcrRawId = randomUUID();
    ocrRawRecords.push({
      id: idOcrRawId,
      userId: userId,
      applicationId: applicationId,
      rawText: idOcr.rawText,
      file_type: "id",
    });

    if (idOcr.processedText) {
      const idOcrProcessedId = randomUUID();
      await supabase.from("OCRProcessed").insert({
        id: idOcrProcessedId,
        ocrRawId: idOcrRawId,
        cleanedText: idOcr.processedText,
        accuracyPercent: 100,
      });
    }
  }

  // COG OCR
  if (cogOcr?.rawText) {
    const cogOcrRawId = randomUUID();
    ocrRawRecords.push({
      id: cogOcrRawId,
      userId: userId,
      applicationId: applicationId,
      rawText: cogOcr.rawText,
      file_type: "cog",
    });

    if (cogOcr.processedText) {
      const cogOcrProcessedId = randomUUID();
      await supabase.from("OCRProcessed").insert({
        id: cogOcrProcessedId,
        ocrRawId: cogOcrRawId,
        cleanedText: cogOcr.processedText,
        accuracyPercent: 100,
      });
    }
  }

  // COR OCR
  if (corOcr?.rawText) {
    const corOcrRawId = randomUUID();
    ocrRawRecords.push({
      id: corOcrRawId,
      userId: userId,
      applicationId: applicationId,
      rawText: corOcr.rawText,
      file_type: "cor",
    });

    if (corOcr.processedText) {
      const corOcrProcessedId = randomUUID();
      await supabase.from("OCRProcessed").insert({
        id: corOcrProcessedId,
        ocrRawId: corOcrRawId,
        cleanedText: corOcr.processedText,
        accuracyPercent: 100,
      });
    }
  }

  // Insert all OCRRaw records
  if (ocrRawRecords.length > 0) {
    const { error: ocrError } = await supabase
      .from("OCRRaw")
      .insert(ocrRawRecords);

    if (ocrError) {
      console.error("OCRRaw creation error:", ocrError);
    }
  }
}

