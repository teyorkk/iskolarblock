interface ApplicationPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

interface Application {
  id: string;
  status: string;
  createdAt?: string;
  applicationDetails?: {
    personalInfo?: {
      firstName?: string;
      middleName?: string | null;
      lastName?: string;
      yearLevel?: string;
    };
  } | null;
}

interface GenerateAwardingSheetPDFParams {
  applications: Application[];
  period: ApplicationPeriod | null;
  iskolarblockLogo?: string;
  skLogo?: string;
}

export async function generateAwardingSheetPDF({
  applications,
  period,
  iskolarblockLogo,
  skLogo,
}: GenerateAwardingSheetPDFParams): Promise<Blob> {
  // Dynamic import to avoid React 19 compatibility issues on page load
  const { pdf } = await import("@react-pdf/renderer");
  const { AwardingSheetPDF } = await import(
    "@/components/admin-awarding/awarding-sheet-pdf"
  );

  const element = AwardingSheetPDF({
    applications,
    period,
    iskolarblockLogo,
    skLogo,
  });

  const blob = await pdf(element).toBlob();
  return blob;
}
