import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
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
  content: {
    padding: 40,
    paddingTop: 30,
    paddingBottom: 60,
    marginBottom: 20,
    maxHeight: 650,
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
  table: {
    width: "100%",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #fed7aa",
    paddingVertical: 8,
    minHeight: 25,
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
    flex: 2.5,
    color: "#333",
  },
  tableCellLevel: {
    fontSize: 9,
    paddingHorizontal: 5,
    flex: 1.5,
    color: "#333",
  },
  tableCellSignature: {
    fontSize: 9,
    paddingHorizontal: 5,
    flex: 2,
    color: "#333",
    borderLeft: "1 solid #fed7aa",
    minHeight: 30,
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

interface AwardingSheetPDFProps {
  applications: Application[];
  period: ApplicationPeriod | null;
  iskolarblockLogo?: string;
  skLogo?: string;
}

function extractPersonalInfo(details: Application["applicationDetails"]) {
  if (!details || typeof details !== "object") {
    return null;
  }

  if ("personalInfo" in details && details.personalInfo) {
    const info = details.personalInfo;
    if (info && typeof info === "object") {
      return info as Record<string, unknown>;
    }
  }

  return details as Record<string, unknown>;
}

function getApplicantName(application: Application): string {
  const personalInfo = extractPersonalInfo(application.applicationDetails);
  if (personalInfo) {
    const firstName = personalInfo.firstName as string | undefined;
    const middleName = personalInfo.middleName as string | undefined;
    const lastName = personalInfo.lastName as string | undefined;

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
}

function getLevel(application: Application): string {
  const personalInfo = extractPersonalInfo(application.applicationDetails);
  if (personalInfo) {
    const yearLevel = (personalInfo.yearLevel as string | undefined)?.toLowerCase() ?? "";
    if (yearLevel === "g11" || yearLevel === "g12" || yearLevel.includes("grade 11") || yearLevel.includes("grade 12")) {
      return "SHS";
    }
    if (yearLevel === "1" || yearLevel === "2" || yearLevel === "3" || yearLevel === "4") {
      return "College";
    }
  }
  return "—";
}

function getLastName(application: Application): string {
  const personalInfo = extractPersonalInfo(application.applicationDetails);
  if (personalInfo) {
    const lastName = personalInfo.lastName as string | undefined;
    return (lastName || "").toLowerCase().trim();
  }
  return "";
}

function sortByLastName(applications: Application[]): Application[] {
  return [...applications].sort((a, b) => {
    const lastNameA = getLastName(a);
    const lastNameB = getLastName(b);
    return lastNameA.localeCompare(lastNameB);
  });
}

export function AwardingSheetPDF({
  applications,
  period,
  iskolarblockLogo,
  skLogo,
}: AwardingSheetPDFProps): React.JSX.Element {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

  // Sort applications by lastname
  const sortedApplications = sortByLastName(applications);

  // Helper to render applicant table rows with pagination
  const renderApplicantTable = (applicants: Application[]) => {
    const rowsPerPage = 20;
    const pages: Application[][] = [];

    for (let i = 0; i < applicants.length; i += rowsPerPage) {
      pages.push(applicants.slice(i, i + rowsPerPage));
    }

    return pages.map((pageApplicants, pageIndex) => (
      <Page
        key={`awarding-sheet-${pageIndex}`}
        size="A4"
        style={styles.page}
        break={pageIndex > 0}
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
              <Text style={styles.headerTitle}>Awarding Sheet</Text>
              <Text style={styles.headerSubtitle}>
                Barangay San Miguel Scholarship Program
              </Text>
            </View>
          </View>
          <Text style={styles.headerDate}>Generated on: {currentDate}</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {pageIndex === 0 && (
            <>
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
            </>
          )}

          {/* Applicant List Section */}
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Scholars List</Text>
            <View style={styles.table} wrap={false}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCellName}>Name</Text>
                <Text style={styles.tableCellLevel}>Level</Text>
                <Text style={styles.tableCellSignature}>Signature</Text>
              </View>
              {pageApplicants.map((application) => (
                <View key={application.id} style={styles.tableRow}>
                  <Text style={styles.tableCellName}>
                    {getApplicantName(application)}
                  </Text>
                  <Text style={styles.tableCellLevel}>
                    {getLevel(application)}
                  </Text>
                  <View style={styles.tableCellSignature}></View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    ));
  };

  return <Document>{renderApplicantTable(sortedApplications)}</Document>;
}

