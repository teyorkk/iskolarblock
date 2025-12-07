import ExcelJS from "exceljs";
import type { StatsCard } from "@/types";

interface Application {
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
}

interface ApplicationPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

interface GenerateExcelReportParams {
  stats: StatsCard[];
  applications: Application[];
  period: ApplicationPeriod | null;
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "FFF97316"; // Orange
    case "APPROVED":
      return "FF22C55E"; // Green
    case "REJECTED":
      return "FFEF4444"; // Red
    case "GRANTED":
      return "FFA855F7"; // Purple
    default:
      return "FF000000"; // Black
  }
};

// Helper function to get applicant name from applicationDetails
// Format: "Surname, First Name M.I."
const getApplicantName = (app: Application): string => {
  const personalInfo = app.applicationDetails?.personalInfo;
  if (personalInfo) {
    const firstName = personalInfo.firstName || "";
    const middleName = personalInfo.middleName || "";
    const lastName = personalInfo.lastName || "";

    // Format as "LastName, FirstName M.I."
    if (lastName) {
      const parts: string[] = [lastName];
      if (firstName) {
        let namePart = firstName;
        // Add middle initial if middle name exists
        if (middleName && middleName.trim()) {
          const middleInitial = middleName.trim().charAt(0).toUpperCase();
          namePart += ` ${middleInitial}.`;
        }
        parts.push(namePart);
      }
      return parts.join(", ") || "N/A";
    }
    // Fallback if no lastname
    const nameParts = [firstName, middleName].filter(Boolean);
    return nameParts.join(" ").trim() || "N/A";
  }
  return "N/A";
};

// Helper function to get lastname for sorting
const getLastName = (app: Application): string => {
  const lastName = app.applicationDetails?.personalInfo?.lastName;
  return (lastName || "").toLowerCase().trim();
};

// Helper function to sort applications by lastname alphabetically
const sortByLastName = (applications: Application[]): Application[] => {
  return [...applications].sort((a, b) => {
    const lastNameA = getLastName(a);
    const lastNameB = getLastName(b);
    return lastNameA.localeCompare(lastNameB);
  });
};

// Helper function to create applicant sheet
const createApplicantSheet = (
  workbook: ExcelJS.Workbook,
  sheetName: string,
  applicantList: Application[]
) => {
  const sheet = workbook.addWorksheet(sheetName);

  // Sort applicants by lastname alphabetically
  const sortedApplicants = sortByLastName(applicantList);

  // Set column widths
  sheet.columns = [
    { width: 30 }, // Name
    { width: 15 }, // Status
    { width: 35 }, // Remarks
    { width: 20 }, // Submitted At
  ];

  // Title
  const titleRow = sheet.getRow(1);
  titleRow.getCell(1).value = `${sheetName} Applicants`;
  titleRow.getCell(1).font = { bold: true, size: 16 };
  titleRow.getCell(1).alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  sheet.mergeCells(1, 1, 1, 4);

  // Table header
  const headerRow = sheet.getRow(3);
  headerRow.values = ["Name", "Status", "Remarks", "Submitted At"];
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF97316" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Data rows
  let currentRow = 4;
  sortedApplicants.forEach((app) => {
    const fullName = getApplicantName(app);

    const row = sheet.getRow(currentRow);
    row.values = [
      fullName,
      app.status,
      app.remarks || "N/A",
      app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A",
    ];

    // Apply status color to text
    const statusColor = getStatusColor(app.status);
    row.font = { color: { argb: statusColor } };
    row.alignment = { vertical: "middle" };

    // Add borders
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    currentRow++;
  });

  return sheet;
};

export async function generateExcelReport({
  stats,
  applications,
  period,
}: GenerateExcelReportParams): Promise<Blob> {
  // Calculate statistics
  const totalPending = applications.filter(
    (app) => app.status === "PENDING"
  ).length;
  const totalApproved = applications.filter(
    (app) => app.status === "APPROVED"
  ).length;
  const totalRejected = applications.filter(
    (app) => app.status === "REJECTED"
  ).length;
  const totalGranted = applications.filter(
    (app) => app.status === "GRANTED"
  ).length;

  // Total applicants
  const totalApplicants = applications.length;

  // Get remaining budget from stats
  const budgetStat = stats.find((stat) => stat.title === "Remaining Budget");
  const remainingBudget = budgetStat ? budgetStat.value : "N/A";

  // Create workbook
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Statistics
  const statsSheet = workbook.addWorksheet("Statistics");
  statsSheet.columns = [
    { width: 30 }, // Metric
    { width: 25 }, // Value
  ];

  // Title
  const statsTitleRow = statsSheet.getRow(1);
  statsTitleRow.getCell(1).value = "IskolarBlock Report";
  statsTitleRow.getCell(1).font = { bold: true, size: 16 };
  statsTitleRow.getCell(1).alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  statsSheet.mergeCells(1, 1, 1, 2);

  let currentRow = 3;

  // Application Cycle Details Section (if period exists)
  if (period) {
    const cycleHeaderRow = statsSheet.getRow(currentRow);
    cycleHeaderRow.getCell(1).value = "Application Cycle Details";
    cycleHeaderRow.getCell(1).font = {
      bold: true,
      size: 12,
      color: { argb: "FFFFFFFF" },
    };
    cycleHeaderRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cycleHeaderRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF97316" }, // Orange
    };
    statsSheet.mergeCells(currentRow, 1, currentRow, 2);
    currentRow++;

    // Cycle details
    const cycleDetails = [
      ["Title", period.title],
      [
        "Start Date",
        new Date(period.startDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      ],
      [
        "End Date",
        new Date(period.endDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      ],
    ];

    cycleDetails.forEach((detail) => {
      const row = statsSheet.getRow(currentRow);
      row.values = detail;
      row.alignment = { vertical: "middle", wrapText: true };
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
      currentRow++;
    });

    // Empty row
    currentRow++;
  }

  // Statistics Section Header
  const statsHeaderRow = statsSheet.getRow(currentRow);
  statsHeaderRow.values = ["Metric", "Value"];
  statsHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  statsHeaderRow.alignment = { horizontal: "center", vertical: "middle" };
  statsHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF97316" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
  currentRow++;

  // Statistics data
  const statsData = [
    ["Total Applicants", totalApplicants],
    ["Total Pending", totalPending],
    ["Total Approved", totalApproved],
    ["Total Rejected", totalRejected],
    ["Total Granted", totalGranted],
    ["Remaining Budget", remainingBudget],
  ];

  statsData.forEach((stat) => {
    const row = statsSheet.getRow(currentRow);
    row.values = stat;
    row.alignment = { vertical: "middle" };
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    currentRow++;
  });

  // Sheet 2: SHS Applicants
  const shsApplicants = applications.filter((app) => {
    const yearLevel = app.applicationDetails?.personalInfo?.yearLevel;
    return yearLevel === "G11" || yearLevel === "G12";
  });
  createApplicantSheet(workbook, "SHS", shsApplicants);

  // Sheet 3: College Applicants
  const collegeApplicants = applications.filter((app) => {
    const yearLevel = app.applicationDetails?.personalInfo?.yearLevel;
    return (
      yearLevel === "1" ||
      yearLevel === "2" ||
      yearLevel === "3" ||
      yearLevel === "4"
    );
  });
  createApplicantSheet(workbook, "College", collegeApplicants);

  // Write to buffer and return as blob
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  return blob;
}
