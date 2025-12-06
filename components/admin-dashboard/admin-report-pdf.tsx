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
    backgroundColor: "#f97316",
    padding: 20,
    paddingTop: 30,
    paddingBottom: 25,
    marginBottom: 0,
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
  headerText: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#fff7ed",
  },
  headerDate: {
    fontSize: 9,
    color: "#fff7ed",
    marginTop: 10,
  },
  // Main content area
  content: {
    padding: 40,
    paddingTop: 30,
    paddingBottom: 40,
    minHeight: 600, // Ensure minimum height for content
  },
  section: {
    marginBottom: 20,
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
    paddingVertical: 8,
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
  applicationDetails?: {
    personalInfo?: {
      firstName?: string;
      middleName?: string | null;
      lastName?: string;
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
  const getApplicantName = (application: Application): string => {
    const personalInfo = application.applicationDetails?.personalInfo;
    if (personalInfo) {
      const firstName = personalInfo.firstName || "";
      const middleName = personalInfo.middleName || "";
      const lastName = personalInfo.lastName || "";
      const nameParts = [firstName, middleName, lastName].filter(Boolean);
      return nameParts.join(" ") || "N/A";
    }
    return "N/A";
  };

  // Format status for display
  const formatStatus = (status: string): string => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logos */}
        <View style={styles.pageHeader}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              {iskolarblockLogoUrl && (
                <Image src={iskolarblockLogoUrl} style={styles.logo} />
              )}
              {skLogoUrl && <Image src={skLogoUrl} style={styles.logo} />}
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Admin Dashboard Report</Text>
              <Text style={styles.headerSubtitle}>
                Barangay San Miguel Scholarship Program
              </Text>
            </View>
          </View>
          <Text style={styles.headerDate}>Generated on: {currentDate}</Text>
        </View>

        {/* Main Content */}
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
              {stats.map((stat, index) => (
                <View key={index} style={styles.statBox}>
                  <Text style={styles.statLabel}>{stat.title}</Text>
                  <Text style={styles.statValue}>
                    {stat.title.includes("Budget")
                      ? formatCurrency(stat.value)
                      : stat.value}
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

          {/* Applicants List */}
          {applications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>List of Applicants</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCellId}>Application ID</Text>
                  <Text style={styles.tableCellName}>Name</Text>
                  <Text style={styles.tableCell}>Status</Text>
                  <Text style={styles.tableCellDate}>Date Submitted</Text>
                </View>
                {applications.map((application) => (
                  <View key={application.id} style={styles.tableRow}>
                    <Text style={styles.tableCellId}>
                      {application.id.substring(0, 8)}...
                    </Text>
                    <Text style={styles.tableCellName}>
                      {getApplicantName(application)}
                    </Text>
                    <Text style={styles.tableCell}>
                      {formatStatus(application.status)}
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
          )}
        </View>
      </Page>
    </Document>
  );
}
