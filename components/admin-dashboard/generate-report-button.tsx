"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2, FileSpreadsheet, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { StatsCard } from "@/types";
import { generateExcelReport, generatePDFReport } from "@/lib/reports";
import { getCurrentTimePH } from "@/lib/utils/date-formatting";

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
    remarks?: string | null;
    applicationDetails?: {
      personalInfo?: {
        firstName?: string;
        middleName?: string | null;
        lastName?: string;
        yearLevel?: string;
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
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const [iskolarblockBase64, skLogoBase64] = await Promise.all([
          imageToBase64("/iskolarblock.png"),
          imageToBase64("/sk-logo.png"),
        ]);
        setIskolarblockLogo(iskolarblockBase64);
        setSkLogo(skLogoBase64);
      } catch {
        // Silently handle - images are optional for PDF
      }
    };

    void loadImages();
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const blob = await generatePDFReport({
        stats,
        pieData,
        period,
        applications,
        iskolarblockLogo,
        skLogo,
      });

      // Create PDF URL and open for printing
      const url = URL.createObjectURL(blob);

      // Open PDF in new window for printing
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }

      // Also download the PDF
      const link = document.createElement("a");
      link.href = url;
      link.download = `admin-dashboard-report-${
        getCurrentTimePH().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up URL after a delay to allow printing
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      // Log the event
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

      toast.success("Report generated and opened for printing!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateExcel = async () => {
    setIsGenerating(true);
    try {
      const excelBlob = await generateExcelReport({
        stats,
        applications,
        period,
      });

      // Generate filename
      const filename = `admin-dashboard-report-${
        getCurrentTimePH().split("T")[0]
      }.xlsx`;

      // Download the file
      const url = URL.createObjectURL(excelBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Log the event
      try {
        await fetch("/api/log-events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventType: "ADMIN_REPORT_GENERATED",
            message: "Generated dashboard Excel report",
          }),
        });
      } catch (error) {
        console.error("Failed to log report generation:", error);
      }

      toast.success("Excel report generated successfully!");
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast.error("Failed to generate Excel report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-white text-red-600 hover:bg-gray-100"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
              <ChevronDown className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleGenerateReport}>
          <FileText className="w-4 h-4 mr-2" />
          PDF Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleGenerateExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Excel Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
