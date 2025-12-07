"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Clock,
  Coins,
  Filter,
  Search,
  ArrowUpDown,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/common/pagination";
import { ResponsiveTableWrapper } from "@/components/common/responsive-table-wrapper";
import { AwardingTableDesktop } from "@/components/admin-awarding/awarding-table-desktop";
import { AwardingTableMobile } from "@/components/admin-awarding/awarding-table-mobile";
import type {
  AwardingApplication,
  AwardingStatus,
  LevelFilter,
} from "@/types/components";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface ApplicationPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

function extractPersonalInfo(
  details: AwardingApplication["applicationDetails"]
) {
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

function deriveFullName(application: AwardingApplication) {
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
    if (nameParts.length > 0) {
      return nameParts.join(" ");
    }
  }

  if (application.User?.name) {
    return application.User.name;
  }

  return "Unnamed Scholar";
}

// Helper function to get lastname for sorting
function getLastName(application: AwardingApplication): string {
  const personalInfo = extractPersonalInfo(application.applicationDetails);
  if (personalInfo) {
    const lastName = personalInfo.lastName as string | undefined;
    return (lastName || "").toLowerCase().trim();
  }
  // Fallback to User.name if no applicationDetails
  const fullName = deriveFullName(application);
  const nameParts = fullName.split(" ");
  return nameParts.length > 0
    ? nameParts[nameParts.length - 1].toLowerCase()
    : "";
}

function deriveLevel(application: AwardingApplication): LevelFilter {
  const personalInfo = extractPersonalInfo(application.applicationDetails);
  const yearLevel =
    (personalInfo?.yearLevel as string | undefined)?.toLowerCase() ?? "";

  if (
    yearLevel.includes("g11") ||
    yearLevel.includes("grade 11") ||
    yearLevel.includes("g12") ||
    yearLevel.includes("grade 12")
  ) {
    return "SENIOR_HIGH";
  }

  return "COLLEGE";
}

function formatLevel(level: LevelFilter) {
  return level === "SENIOR_HIGH" ? "Senior High School" : "College";
}

function getScholarAmount(level: LevelFilter) {
  return level === "SENIOR_HIGH" ? 500 : 1000;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export default function AwardingPage() {
  const [applications, setApplications] = useState<AwardingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periods, setPeriods] = useState<ApplicationPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [latestPeriodId, setLatestPeriodId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"default" | "az" | "za">(
    "default"
  );
  const [statusFilters, setStatusFilters] = useState<Set<AwardingStatus>>(
    new Set()
  );
  const [levelFilters, setLevelFilters] = useState<Set<LevelFilter>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmGrantId, setConfirmGrantId] = useState<string | null>(null);
  const [isGeneratingAwardingSheet, setIsGeneratingAwardingSheet] =
    useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("ApplicationPeriod")
          .select("id, title, startDate, endDate, createdAt")
          .order("createdAt", { ascending: false });

        if (error) {
          throw error;
        }

        setPeriods(data ?? []);
        if (data && data.length > 0) {
          setLatestPeriodId(data[0].id);

          // Find the currently active period (where today's date falls within the period)
          const now = new Date();
          const activePeriod = data.find((period) => {
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);
            return now >= start && now <= end;
          });

          // Set default period: active period if exists, otherwise the most recent one
          setSelectedPeriodId(activePeriod?.id ?? data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch periods:", err);
        toast.error("Failed to load application periods");
      }
    };

    void fetchPeriods();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (!selectedPeriodId) {
      setApplications([]);
      return;
    }

    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/admin/awardings?periodId=${selectedPeriodId}`
        );
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "Failed to fetch awarding data");
          setApplications([]);
          return;
        }

        setApplications(data.applications ?? []);
      } catch (error) {
        console.error("Failed to fetch awarding applications:", error);
        toast.error("An error occurred while fetching awarding data");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchApplications();
  }, [selectedPeriodId]);

  const toggleStatusFilter = (status: AwardingStatus) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const toggleLevelFilter = (level: LevelFilter) => {
    setLevelFilters((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const stats = useMemo(() => {
    const totalGranted = applications.filter(
      (app) => app.status === "GRANTED"
    ).length;
    const totalPending = applications.filter(
      (app) => app.status === "APPROVED"
    ).length;
    const totalAmount = applications.reduce((sum, app) => {
      const level = deriveLevel(app);
      return sum + getScholarAmount(level);
    }, 0);

    return {
      totalApproved: applications.length,
      pending: totalPending,
      granted: totalGranted,
      totalAmount,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    let filtered = applications.filter((app) => {
      const status = (app.status as AwardingStatus) ?? "APPROVED";
      if (statusFilters.size > 0 && !statusFilters.has(status)) {
        return false;
      }

      const level = deriveLevel(app);
      if (levelFilters.size > 0 && !levelFilters.has(level)) {
        return false;
      }

      if (!debouncedSearchTerm) {
        return true;
      }

      // Search in name from application details
      const name = deriveFullName(app).toLowerCase();
      const email = (app.User?.email ?? "").toLowerCase();
      const type = app.applicationType.toLowerCase();
      return (
        name.includes(debouncedSearchTerm) ||
        email.includes(debouncedSearchTerm) ||
        type.includes(debouncedSearchTerm)
      );
    });

    // Apply sorting by lastname (always sort, default is A-Z)
    filtered = [...filtered].sort((a, b) => {
      const lastNameA = getLastName(a);
      const lastNameB = getLastName(b);

      if (sortOrder === "za") {
        return lastNameB.localeCompare(lastNameA);
      } else {
        // Default and "az" both sort A-Z
        return lastNameA.localeCompare(lastNameB);
      }
    });

    return filtered;
  }, [
    applications,
    statusFilters,
    levelFilters,
    debouncedSearchTerm,
    sortOrder,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredApplications.slice(startIndex, endIndex);
  }, [filteredApplications, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilters, levelFilters, debouncedSearchTerm, sortOrder]);

  const handleGrantScholarship = async (applicationId: string) => {
    setUpdatingId(applicationId);
    setConfirmGrantId(null);
    try {
      const response = await fetch(`/api/admin/awardings/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "GRANTED" }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to grant scholarship");
        return;
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: "GRANTED" } : app
        )
      );

      toast.success("Scholarship marked as granted");
    } catch (error) {
      console.error("Failed to grant scholarship:", error);
      toast.error("An error occurred while updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleGenerateAwardingSheet = async () => {
    if (applications.length === 0) {
      toast.error("No applications available to generate awarding sheet");
      return;
    }

    setIsGeneratingAwardingSheet(true);
    try {
      // Convert images to base64
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

      const [iskolarblockBase64, skLogoBase64] = await Promise.all([
        imageToBase64("/iskolarblock.png"),
        imageToBase64("/sk-logo.png"),
      ]);

      const { generateAwardingSheetPDF } = await import(
        "@/lib/reports/generate-awarding-sheet-pdf"
      );

      const blob = await generateAwardingSheetPDF({
        applications: filteredApplications,
        period: periods.find((p) => p.id === selectedPeriodId) || null,
        iskolarblockLogo: iskolarblockBase64,
        skLogo: skLogoBase64,
      });

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const periodTitle =
        periods.find((p) => p.id === selectedPeriodId)?.title ||
        "awarding-sheet";
      const sanitizedTitle = periodTitle
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase();
      link.download = `awarding-sheet-${sanitizedTitle}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Awarding sheet generated successfully!");
    } catch (error) {
      console.error("Error generating awarding sheet:", error);
      toast.error("Failed to generate awarding sheet. Please try again.");
    } finally {
      setIsGeneratingAwardingSheet(false);
    }
  };

  const canModifyAwards =
    selectedPeriodId !== null && selectedPeriodId === latestPeriodId;

  const renderStatusBadge = (status: AwardingStatus | null | undefined) => {
    if (status === "GRANTED") {
      return (
        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
          Granted
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-orange-50 text-orange-700 border-orange-200"
      >
        Pending
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      {/* Main Content */}
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Scholarship Awarding
                </h1>
                <p className="text-gray-600">
                  Review approved scholars and release stipends per application
                  period
                </p>
              </div>
              <Button
                onClick={handleGenerateAwardingSheet}
                disabled={
                  isGeneratingAwardingSheet || applications.length === 0
                }
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isGeneratingAwardingSheet ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Awarding Sheet
                  </>
                )}
              </Button>
            </div>

            {/* Application Period Selector */}
            {periods.length > 0 && (
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="w-full sm:max-w-md">
                  <Label
                    htmlFor="period-select"
                    className="text-sm font-medium mb-1 inline-flex"
                  >
                    Application Period
                  </Label>
                  <Select
                    value={selectedPeriodId ?? undefined}
                    onValueChange={(value) => setSelectedPeriodId(value)}
                  >
                    <SelectTrigger id="period-select">
                      <SelectValue placeholder="Select application period" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedPeriodId && selectedPeriodId !== latestPeriodId && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200 w-full sm:w-auto text-center py-2"
                  >
                    View Only · Past Period
                  </Badge>
                )}
              </div>
            )}

            {/* Search & Sort */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full sm:w-auto">
                <Select
                  value={sortOrder}
                  onValueChange={(value: "default" | "az" | "za") =>
                    setSortOrder(value)
                  }
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4 text-gray-500" />
                      <SelectValue placeholder="Sort by name" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="az">A-Z</SelectItem>
                    <SelectItem value="za">Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Release</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {isLoading ? "--" : stats.pending}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Granted Scholars</p>
                      <p className="text-2xl font-bold text-green-600">
                        {isLoading ? "--" : stats.granted}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Projected Disbursement Amount
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {isLoading
                          ? "--"
                          : currencyFormatter.format(stats.totalAmount)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Coins className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Filters */}
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-3 bg-white border rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filter by status:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["APPROVED", "GRANTED"] as AwardingStatus[]).map(
                    (status) => (
                      <Button
                        key={status}
                        type="button"
                        variant={
                          statusFilters.has(status) ? "default" : "outline"
                        }
                        size="sm"
                        className={
                          statusFilters.has(status)
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : undefined
                        }
                        onClick={() => toggleStatusFilter(status)}
                      >
                        {status === "GRANTED" ? "Granted" : "Pending"}
                      </Button>
                    )
                  )}
                  {(["SENIOR_HIGH", "COLLEGE"] as LevelFilter[]).map(
                    (level) => (
                      <Button
                        key={level}
                        type="button"
                        variant={
                          levelFilters.has(level) ? "default" : "outline"
                        }
                        size="sm"
                        className={
                          levelFilters.has(level)
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : undefined
                        }
                        onClick={() => toggleLevelFilter(level)}
                      >
                        {formatLevel(level)}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Scholars Table */}
            <Card>
              <CardHeader>
                <CardTitle>Awarding Queue</CardTitle>
                <CardDescription>
                  All approved scholars within the selected application period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading scholars...</p>
                    </div>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    No approved scholars found for this period.
                  </div>
                ) : paginatedApplications.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    No scholars match the selected filters.
                  </div>
                ) : (
                  <ResponsiveTableWrapper
                    desktopView={
                      <AwardingTableDesktop
                        applications={paginatedApplications}
                        deriveFullName={deriveFullName}
                        deriveLevel={deriveLevel}
                        getScholarAmount={getScholarAmount}
                        formatLevel={formatLevel}
                        formatDateTime={formatDateTime}
                        currencyFormatter={currencyFormatter}
                        renderStatusBadge={renderStatusBadge}
                        canModifyAwards={canModifyAwards}
                        updatingId={updatingId}
                        confirmGrantId={confirmGrantId}
                        setConfirmGrantId={setConfirmGrantId}
                        handleGrantScholarship={handleGrantScholarship}
                      />
                    }
                    mobileView={
                      <AwardingTableMobile
                        applications={paginatedApplications}
                        deriveFullName={deriveFullName}
                        deriveLevel={deriveLevel}
                        getScholarAmount={getScholarAmount}
                        formatLevel={formatLevel}
                        formatDateTime={formatDateTime}
                        currencyFormatter={currencyFormatter}
                        renderStatusBadge={renderStatusBadge}
                        canModifyAwards={canModifyAwards}
                        updatingId={updatingId}
                        confirmGrantId={confirmGrantId}
                        setConfirmGrantId={setConfirmGrantId}
                        handleGrantScholarship={handleGrantScholarship}
                      />
                    }
                  />
                )}
                {filteredApplications.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredApplications.length}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
