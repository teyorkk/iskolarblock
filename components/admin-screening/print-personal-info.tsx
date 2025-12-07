"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface PersonalInfo {
  lastName: string;
  firstName: string;
  middleName?: string | null;
  dateOfBirth: string;
  placeOfBirth: string;
  age: string;
  sex: "male" | "female";
  houseNumber: string;
  purok: string;
  barangay: string;
  municipality: string;
  province: string;
  citizenship: string;
  contactNumber: string;
  religion: string;
  course: string;
  yearLevel: string;
}

interface PrintPersonalInfoProps {
  personalInfo: PersonalInfo | null;
  userEmail?: string;
}

// Convert image URL to base64
const imageToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { cache: "no-cache" });
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
    return "";
  }
};

export function PrintPersonalInfo({
  personalInfo,
  userEmail,
}: PrintPersonalInfoProps) {
  const [iskolarblockLogo, setIskolarblockLogo] = useState<string>("");
  const [skLogo, setSkLogo] = useState<string>("");

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
        // Silently handle - images are optional
      }
    };

    void loadImages();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePrint = () => {
    if (!personalInfo) {
      toast.error("No personal information available to print");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print");
      return;
    }

    const fullName = [
      personalInfo.firstName,
      personalInfo.middleName,
      personalInfo.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    const address = [
      personalInfo.houseNumber,
      personalInfo.purok,
      personalInfo.barangay,
      personalInfo.municipality,
      personalInfo.province,
    ]
      .filter(Boolean)
      .join(", ");

    const logoHtml =
      iskolarblockLogo || skLogo
        ? `<div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
          ${
            iskolarblockLogo
              ? `<img src="${iskolarblockLogo}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 10px;" />`
              : ""
          }
          ${
            skLogo
              ? `<img src="${skLogo}" style="width: 50px; height: 50px; object-fit: contain;" />`
              : ""
          }
        </div>`
        : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Personal Information - ${fullName}</title>
          <style>
            @media print {
              @page {
                margin: 0.5in;
                size: letter;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 15px;
              max-width: 100%;
              margin: 0 auto;
              font-size: 11px;
            }
            .page-header {
              border-bottom: 2px solid #f97316;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .header-content {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .header-text {
              flex: 1;
              text-align: center;
            }
            .header-text h2 {
              color: #f97316;
              margin: 0;
              font-size: 18px;
              font-weight: bold;
            }
            .header-text p {
              color: #6b7280;
              margin: 3px 0;
              font-size: 10px;
            }
            .header-date {
              text-align: right;
              font-size: 9px;
              color: #6b7280;
            }
            h1 {
              color: #f97316;
              border-bottom: 2px solid #f97316;
              padding-bottom: 5px;
              margin-bottom: 10px;
              margin-top: 12px;
              font-size: 14px;
            }
            .info-section {
              margin-bottom: 12px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            .info-row {
              display: flex;
              margin-bottom: 6px;
              padding: 4px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: bold;
              width: 140px;
              color: #374151;
              font-size: 10px;
            }
            .info-value {
              flex: 1;
              color: #111827;
              font-size: 10px;
            }
            .full-width {
              grid-column: 1 / -1;
            }
          </style>
        </head>
        <body>
          <div class="page-header">
            ${logoHtml}
            <div class="header-content">
              <div class="header-text">
                <h2>Personal Information</h2>
                <p>Barangay San Miguel Scholarship Program</p>
              </div>
            </div>
            <div class="header-date">Printed on: ${new Date().toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}</div>
          </div>
          <h1>Personal Information</h1>
          <div class="info-section">
            <div class="info-grid">
              <div class="info-row full-width">
                <div class="info-label">Full Name:</div>
                <div class="info-value">${fullName}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Date of Birth:</div>
                <div class="info-value">${formatDate(
                  personalInfo.dateOfBirth
                )}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Place of Birth:</div>
                <div class="info-value">${
                  personalInfo.placeOfBirth || "N/A"
                }</div>
              </div>
              <div class="info-row">
                <div class="info-label">Age:</div>
                <div class="info-value">${personalInfo.age || "N/A"}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Sex:</div>
                <div class="info-value">${
                  personalInfo.sex
                    ? personalInfo.sex.charAt(0).toUpperCase() +
                      personalInfo.sex.slice(1)
                    : "N/A"
                }</div>
              </div>
              <div class="info-row">
                <div class="info-label">Citizenship:</div>
                <div class="info-value">${
                  personalInfo.citizenship || "N/A"
                }</div>
              </div>
              <div class="info-row">
                <div class="info-label">Religion:</div>
                <div class="info-value">${personalInfo.religion || "N/A"}</div>
              </div>
            </div>
          </div>
          <h1>Contact Information</h1>
          <div class="info-section">
            <div class="info-grid">
              <div class="info-row">
                <div class="info-label">Contact Number:</div>
                <div class="info-value">${
                  personalInfo.contactNumber || "N/A"
                }</div>
              </div>
              <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">${userEmail || "N/A"}</div>
              </div>
            </div>
          </div>
          <h1>Address</h1>
          <div class="info-section">
            <div class="info-grid">
              <div class="info-row full-width">
                <div class="info-label">Complete Address:</div>
                <div class="info-value">${address || "N/A"}</div>
              </div>
              <div class="info-row">
                <div class="info-label">House Number:</div>
                <div class="info-value">${
                  personalInfo.houseNumber || "N/A"
                }</div>
              </div>
              <div class="info-row">
                <div class="info-label">Purok:</div>
                <div class="info-value">${personalInfo.purok || "N/A"}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Barangay:</div>
                <div class="info-value">${personalInfo.barangay || "N/A"}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Municipality:</div>
                <div class="info-value">${
                  personalInfo.municipality || "N/A"
                }</div>
              </div>
              <div class="info-row">
                <div class="info-label">Province:</div>
                <div class="info-value">${personalInfo.province || "N/A"}</div>
              </div>
            </div>
          </div>
          <h1>Academic Information</h1>
          <div class="info-section">
            <div class="info-grid">
              <div class="info-row">
                <div class="info-label">Course:</div>
                <div class="info-value">${personalInfo.course || "N/A"}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Year Level:</div>
                <div class="info-value">${personalInfo.yearLevel || "N/A"}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (!personalInfo) {
    return null;
  }

  return (
    <Button
      variant="outline"
      className="text-orange-600 border-orange-600 hover:bg-orange-50"
      onClick={handlePrint}
    >
      <Printer className="w-4 h-4 mr-2" />
      Print
    </Button>
  );
}
