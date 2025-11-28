"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlobProvider } from "@react-pdf/renderer";
import { AdminReportPDF } from "./admin-report-pdf";
import type { StatsCard } from "@/types";

// Convert image URL to base64
// Note: Browser may show a warning in development (HTTP) but this is harmless
// and won't appear in production (HTTPS)
const imageToBase64 = async (url: string): Promise<string> => {
  try {
    // Suppress console warnings for mixed content in development
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      // Filter out mixed content warnings
      if (
        typeof args[0] === "string" &&
        args[0].includes("insecure connection")
      ) {
        return; // Suppress this specific warning
      }
      originalWarn.apply(console, args);
    };

    const response = await fetch(url, {
      cache: "no-cache",
    });

    // Restore console.warn
    console.warn = originalWarn;

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert image to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    // Silently handle errors - images are optional for PDF generation
    return "";
  }
};

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

interface GenerateReportButtonProps {
  stats: StatsCard[];
  pieData: PieData[];
  period: ApplicationPeriod | null;
  applications?: Array<{
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
  }>;
}

export function GenerateReportButton({
  stats,
  pieData,
  period,
  applications = [],
}: GenerateReportButtonProps): React.JSX.Element {
  const [iskolarblockLogo, setIskolarblockLogo] = useState<string>("");
  const [skLogo, setSkLogo] = useState<string>("");
  const [imagesLoading, setImagesLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      // Use relative paths to avoid mixed content warnings
      // In production with HTTPS, this warning won't appear
      try {
        const [iskolarblockBase64, skLogoBase64] = await Promise.all([
          imageToBase64("/iskolarblock.svg"),
          imageToBase64("/sk-logo.png"),
        ]);
        setIskolarblockLogo(iskolarblockBase64);
        setSkLogo(skLogoBase64);
        setImagesLoading(false);
      } catch {
        // Silently handle - images are optional for PDF
        setImagesLoading(false);
      }
    };

    void loadImages();
  }, []);

  const handleDownload = (blob: Blob | null) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `admin-dashboard-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <BlobProvider
      document={
        <AdminReportPDF
          stats={stats}
          pieData={pieData}
          period={period}
          applications={applications}
          iskolarblockLogo={iskolarblockLogo}
          skLogo={skLogo}
        />
      }
    >
      {({ blob, loading, error }) => {
        if (error) {
          console.error("Error generating PDF:", error);
        }

        return (
          <Button
            variant="outline"
            className="border-white text-red-600 hover:bg-gray-100"
            onClick={async () => {
              if (blob && !loading && !imagesLoading) {
                handleDownload(blob);
                try {
                  await fetch("/api/log-events", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      eventType: "ADMIN_REPORT_GENERATED",
                      message: "Generated dashboard PDF report",
                    }),
                  });
                } catch (error) {
                  console.error("Failed to log report generation:", error);
                }
              }
            }}
            disabled={loading || !blob || imagesLoading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        );
      }}
    </BlobProvider>
  );
}
