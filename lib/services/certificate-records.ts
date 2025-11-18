import { randomUUID } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { GradeSubject } from "@/lib/services/document-extraction";

interface COGExtractedData {
  school: string | null;
  school_year: string | null;
  semester: string | null;
  course: string | null;
  name: string | null;
  gwa: number | null;
  total_units: number | null;
  subjects: GradeSubject[] | null;
}

interface CORExtractedData {
  school: string | null;
  school_year: string | null;
  semester: string | null;
  course: string | null;
  name: string | null;
  total_units: number | null;
}

interface CreateCertificateRecordsParams {
  supabase: ReturnType<typeof getSupabaseServerClient>;
  applicationId: string;
  cogData?: COGExtractedData;
  corData?: CORExtractedData;
  cogDocumentUrl?: string | null;
  corDocumentUrl?: string | null;
}

export async function createCertificateRecords({
  supabase,
  applicationId,
  cogData,
  corData,
  cogDocumentUrl,
  corDocumentUrl,
}: CreateCertificateRecordsParams): Promise<void> {
  // Create CertificateOfGrades record
  if (cogData) {
    const cogId = randomUUID();
    const { error: cogError } = await supabase
      .from("CertificateOfGrades")
      .insert({
        id: cogId,
        applicationId: applicationId,
        school: cogData.school || "",
        schoolYear: cogData.school_year || "",
        semester: cogData.semester || "",
        course: cogData.course || "",
        name: cogData.name || "",
        gwa: cogData.gwa || 0,
        totalUnits: cogData.total_units || 0,
        subjects: cogData.subjects || [],
        fileUrl: cogDocumentUrl,
      });

    if (cogError) {
      console.error("CertificateOfGrades creation error:", cogError);
    }
  }

  // Create CertificateOfRegistration record
  if (corData) {
    const corId = randomUUID();
    const { error: corError } = await supabase
      .from("CertificateOfRegistration")
      .insert({
        id: corId,
        applicationId: applicationId,
        school: corData.school || "",
        schoolYear: corData.school_year || "",
        semester: corData.semester || "",
        course: corData.course || "",
        name: corData.name || "",
        totalUnits: corData.total_units || 0,
        fileUrl: corDocumentUrl,
      });

    if (corError) {
      console.error("CertificateOfRegistration creation error:", corError);
    }
  }
}

