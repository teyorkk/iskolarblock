import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Header with logos
  pageHeader: {
    backgroundColor: "#ffffff",
    padding: 20,
    paddingTop: 30,
    paddingBottom: 25,
    marginBottom: 0,
    borderBottom: "2 solid #f97316",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: "contain",
  },
  roundedLogo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    overflow: "hidden",
  },
  headerText: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f97316",
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#666666",
  },
  headerDate: {
    fontSize: 9,
    color: "#666666",
    marginTop: 10,
  },
  // Main content area
  content: {
    padding: 40,
    paddingTop: 30,
    paddingBottom: 60, // Increased bottom padding to prevent overflow
    marginBottom: 20, // Additional bottom margin
    maxHeight: 650, // Limit maximum height to prevent overflow
  },
  section: {
    marginBottom: 15, // Reduced margin to fit more content
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f97316",
    marginBottom: 10,
    borderBottom: "2 solid #f97316",
    paddingBottom: 5,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  statBox: {
    width: "48%",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff7ed",
    border: "1 solid #fed7aa",
    marginRight: "2%",
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f97316",
  },
  table: {
    width: "100%",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #fed7aa",
    paddingVertical: 6, // Reduced padding to fit more rows
    minHeight: 20, // Minimum row height
  },
  tableHeader: {
    backgroundColor: "#fff7ed",
    fontWeight: "bold",
    fontSize: 10,
    color: "#f97316",
  },
  tableCell: {
    fontSize: 9,
    paddingHorizontal: 5,
    flex: 1,
    color: "#333",
  },
  tableCellName: {
    fontSize: 9,
    paddingHorizontal: 5,
    flex: 2,
    color: "#333",
  },
  tableCellId: {
    fontSize: 8,
    paddingHorizontal: 5,
    flex: 1.5,
    color: "#333",
  },
  tableCellDate: {
    fontSize: 8,
    paddingHorizontal: 5,
    flex: 1.2,
    color: "#333",
  },
  tableCellRemarks: {
    fontSize: 8,
    paddingHorizontal: 5,
    flex: 2,
    color: "#333",
  },
  periodInfo: {
    backgroundColor: "#fff7ed",
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    border: "1 solid #fed7aa",
  },
  periodTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f97316",
    marginBottom: 5,
  },
  periodDate: {
    fontSize: 10,
    color: "#666",
  },
});

interface StatsCard {
  title: string;
  value: string;
  description: string;
}

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

interface AdminReportPDFProps {
  stats: StatsCard[];
  pieData: PieData[];
  period: ApplicationPeriod | null;
  applications?: Application[];
  iskolarblockLogo?: string;
  skLogo?: string;
}

export function AdminReportPDF({
  stats,
  pieData,
  period,
  applications = [],
  iskolarblockLogo,
  skLogo,
}: AdminReportPDFProps): React.JSX.Element {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Use provided base64 images or fallback to URLs
  const getImageUrl = (path: string, base64?: string): string => {
    if (base64) return base64;
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  const iskolarblockLogoUrl = getImageUrl(
    "/iskolarblock.svg",
    iskolarblockLogo
  );
  const skLogoUrl = getImageUrl("/sk-logo.png", skLogo);

  const formatCurrency = (value: string): string => {
    // Remove any existing currency symbols, special characters, and clean the value
    // Handle cases where peso sign (₱) might be corrupted to "+-" or other characters
    const cleanedValue = value
      .replace(/[₱PHPphp]/g, "") // Remove peso and PHP
      .replace(/[±\+\-]/g, "") // Remove corrupted peso signs (+-, ±, etc.)
      .trim();

    // Try to parse and format the number
    const num = parseFloat(cleanedValue.replace(/[^0-9.]/g, ""));
    if (!isNaN(num)) {
      // Use "PHP" instead of peso sign since React-PDF default font doesn't support it
      return `PHP ${num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return value;
  };

  // Extract full name from applicationDetails.personalInfo
  // Format: "Surname, First Name M.I."
  const getApplicantName = (application: Application): string => {
    const personalInfo = application.applicationDetails?.personalInfo;
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
  const getLastName = (application: Application): string => {
    const lastName = application.applicationDetails?.personalInfo?.lastName;
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

  // Format status for display
  const formatStatus = (status: string): string => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  // Helper to render applicant table rows with pagination
  const renderApplicantTable = (
    applicants: Application[],
    sectionTitle: string,
    startPageNumber: number
  ) => {
    const rowsPerPage = 20; // Reduced to account for margins and prevent overflow
    const pages: Application[][] = [];

    for (let i = 0; i < applicants.length; i += rowsPerPage) {
      pages.push(applicants.slice(i, i + rowsPerPage));
    }

    return pages.map((pageApplicants, pageIndex) => (
      <Page
        key={`${sectionTitle}-${pageIndex}`}
        size="A4"
        style={styles.page}
        break={pageIndex > 0 || startPageNumber > 2}
      >
        {/* Header with Logos */}
        <View style={styles.pageHeader}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              {iskolarblockLogoUrl && (
                <View style={styles.roundedLogo}>
                  <Image src={iskolarblockLogoUrl} style={styles.logo} />
                </View>
              )}
              {skLogoUrl && <Image src={skLogoUrl} style={styles.logo} />}
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>IskolarBlock Report</Text>
              <Text style={styles.headerSubtitle}>
                Barangay San Miguel Scholarship Program
              </Text>
            </View>
          </View>
          <Text style={styles.headerDate}>Generated on: {currentDate}</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Applicant List Section */}
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            <View style={styles.table} wrap={false}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCellName}>Name</Text>
                <Text style={styles.tableCell}>Status</Text>
                <Text style={styles.tableCellRemarks}>Remarks</Text>
                <Text style={styles.tableCellDate}>Date Submitted</Text>
              </View>
              {pageApplicants.map((application) => (
                <View key={application.id} style={styles.tableRow}>
                  <Text style={styles.tableCellName}>
                    {getApplicantName(application)}
                  </Text>
                  <Text style={styles.tableCell}>
                    {formatStatus(application.status)}
                  </Text>
                  <Text style={styles.tableCellRemarks}>
                    {application.remarks || "N/A"}
                  </Text>
                  <Text style={styles.tableCellDate}>
                    {application.createdAt
                      ? new Date(application.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "N/A"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    ));
  };

  // Prepare applicant lists
  const shsApplicants = applications.filter((app) => {
    const yearLevel = app.applicationDetails?.personalInfo?.yearLevel;
    return yearLevel === "G11" || yearLevel === "G12";
  });
  const sortedShsApplicants = sortByLastName(shsApplicants);

  const collegeApplicants = applications.filter((app) => {
    const yearLevel = app.applicationDetails?.personalInfo?.yearLevel;
    return (
      yearLevel === "1" ||
      yearLevel === "2" ||
      yearLevel === "3" ||
      yearLevel === "4"
    );
  });
  const sortedCollegeApplicants = sortByLastName(collegeApplicants);

  // Calculate starting page number for college applicants
  const shsPages = Math.ceil(sortedShsApplicants.length / 20);
  const collegeStartPage = 2 + shsPages;

  return (
    <Document>
      {/* Page 1: Key Statistics */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              {iskolarblockLogoUrl && (
                <View style={styles.roundedLogo}>
                  <Image src={iskolarblockLogoUrl} style={styles.logo} />
                </View>
              )}
              {skLogoUrl && <Image src={skLogoUrl} style={styles.logo} />}
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>IskolarBlock Report</Text>
              <Text style={styles.headerSubtitle}>
                Barangay San Miguel Scholarship Program
              </Text>
            </View>
          </View>
          <Text style={styles.headerDate}>Generated on: {currentDate}</Text>
        </View>

        <View style={styles.content}>
          {/* Application Cycle Info */}
          {period && (
            <View style={styles.periodInfo}>
              <Text style={styles.periodTitle}>Application Cycle</Text>
              <Text style={styles.periodDate}>{period.title}</Text>
              <Text style={styles.periodDate}>
                Start:{" "}
                {new Date(period.startDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text style={styles.periodDate}>
                End:{" "}
                {new Date(period.endDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          )}

          {/* Statistics Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Statistics</Text>
            <View style={styles.statsContainer}>
              {/* Total Applicants */}
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Applicants</Text>
                <Text style={styles.statValue}>{applications.length}</Text>
                <Text style={styles.statLabel}>All applications</Text>
              </View>
              {/* Remaining Budget */}
              {stats
                .filter((stat) => stat.title === "Remaining Budget")
                .map((stat, index) => (
                  <View key={index} style={styles.statBox}>
                    <Text style={styles.statLabel}>{stat.title}</Text>
                    <Text style={styles.statValue}>
                      {formatCurrency(stat.value)}
                    </Text>
                    <Text style={styles.statLabel}>{stat.description}</Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Application Status Distribution */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Application Status Distribution
            </Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Status</Text>
                <Text style={styles.tableCell}>Count</Text>
                <Text style={styles.tableCell}>Percentage</Text>
              </View>
              {(() => {
                const total = pieData.reduce((sum, d) => sum + d.value, 0);
                return pieData.map((item, index) => {
                  const percentageValue =
                    total > 0 ? (item.value / total) * 100 : 0;
                  // Format percentage: show whole number if no decimal, otherwise 1 decimal place
                  const percentage =
                    percentageValue % 1 === 0
                      ? percentageValue.toFixed(0)
                      : percentageValue.toFixed(1);
                  return (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.name}</Text>
                      <Text style={styles.tableCell}>{item.value}</Text>
                      <Text style={styles.tableCell}>{percentage}%</Text>
                    </View>
                  );
                });
              })()}
            </View>
          </View>
        </View>
      </Page>

      {/* Page 2+: SHS Applicants */}
      {sortedShsApplicants.length > 0 &&
        renderApplicantTable(sortedShsApplicants, "SHS Applicants", 2)}

      {/* College Applicants pages */}
      {sortedCollegeApplicants.length > 0 &&
        renderApplicantTable(
          sortedCollegeApplicants,
          "College Applicants",
          collegeStartPage
        )}
    </Document>
  );
}
