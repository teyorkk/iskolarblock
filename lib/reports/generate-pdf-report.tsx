import type { StatsCard } from "@/types";

interface PieData {
  name: string;
  value: number;
  color: string;
}

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
    };
  } | null;
}

interface GeneratePDFReportParams {
  stats: StatsCard[];
  pieData: PieData[];
  period: ApplicationPeriod | null;
  applications: Application[];
  iskolarblockLogo: string;
  skLogo: string;
}

export async function generatePDFReport({
  stats,
  pieData,
  period,
  applications,
  iskolarblockLogo,
  skLogo,
}: GeneratePDFReportParams): Promise<Blob> {
  // Dynamic import to avoid React 19 compatibility issues on page load
  const { pdf } = await import("@react-pdf/renderer");
  const { AdminReportPDF } = await import(
    "@/components/admin-dashboard/admin-report-pdf"
  );

  const element = AdminReportPDF({
    stats,
    pieData,
    period,
    applications,
    iskolarblockLogo,
    skLogo,
  });

  const blob = await pdf(element).toBlob();
  return blob;
}
