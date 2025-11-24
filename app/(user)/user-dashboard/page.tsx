"use client";

import { FileText, History, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserSidebar } from "@/components/user-sidebar";
import { StatsGrid } from "@/components/common/stats-grid";
import { UserDashboardHeader } from "@/components/user-dashboard/user-dashboard-header";
import { RecentApplications } from "@/components/user-dashboard/recent-applications";
import { UserQuickActions } from "@/components/user-dashboard/quick-actions";
import { useSession } from "@/components/session-provider";
import { userStatsCards } from "@/lib/constants/dashboard-stats";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ApplicationPeriodBanner } from "@/components/common/application-period-banner";

interface Application {
  id: string;
  date: string;
  type: string;
  status: string;
  remarks: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  bio: string | null;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const { user } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data and applications
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const supabase = getSupabaseBrowserClient();

        // Fetch user profile data
        const { data: userProfile, error: userError } = await supabase
          .from("User")
          .select("*")
          .eq("email", user.email)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
        } else if (userProfile) {
          setUserData(userProfile);
        }

        // Fetch user applications
        const { data: userDataForApps, error: userDataError } = await supabase
          .from("User")
          .select("id")
          .eq("email", user.email)
          .single();

        if (userDataError || !userDataForApps) {
          console.error("Error fetching user ID:", userDataError);
          setIsLoading(false);
          return;
        }

        const { data: apps, error: appsError } = await supabase
          .from("Application")
          .select(
            `
            id,
            status,
            applicationType,
            createdAt,
            updatedAt
          `
          )
          .eq("userId", userDataForApps.id)
          .order("createdAt", { ascending: false })
          .limit(8);

        if (appsError) {
          console.error("Error fetching applications:", appsError);
          toast.error("Failed to load applications");
        } else if (apps) {
          const transformedApps: Application[] = apps.map((app) => ({
            id: app.id,
            date: new Date(app.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            type:
              app.applicationType === "NEW"
                ? "New Application"
                : "Renewal Application",
            status: app.status,
            remarks: getStatusRemarks(app.status),
          }));
          setApplications(transformedApps);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("An error occurred while loading dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDashboardData();

    // Listen for profile update events
    const handleProfileUpdate = () => {
      void fetchDashboardData();
    };

    window.addEventListener("userProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
    };
  }, [user?.email]);

  const getStatusRemarks = (status: string): string => {
    switch (status) {
      case "APPROVED":
        return "Your have completed your application. It has been approved. Congratulations!";
      case "GRANTED":
        return "Your scholarship has been granted.";
      case "PENDING":
        return "Your application is incomplete. Please provide the missing files and information.";
      case "REJECTED":
        return "Your application was not approved. You may apply again in the next period.";
      default:
        return "Status unknown";
    }
  };

  const quickActions = [
    {
      label: "Application",
      icon: FileText,
      onClick: () => router.push("/application"),
    },
    {
      label: "View History",
      icon: History,
      onClick: () => router.push("/history"),
    },
    {
      label: "Update Profile",
      icon: Users,
      onClick: () => router.push("/user-settings"),
    },
  ];

  const pendingCount = applications.filter((app) => app.status === "PENDING").length;
  const approvedCount = applications.filter((app) => app.status === "APPROVED").length;
  const grantedCount = applications.filter((app) => app.status === "GRANTED").length;

  // Calculate stats from real data
  const stats = [
    {
      ...userStatsCards[0],
      value: applications.length.toString(),
    },
    {
      ...userStatsCards[1],
      value: pendingCount.toString(),
    },
    {
      ...userStatsCards[2],
      value: approvedCount.toString(),
    },
    {
      ...userStatsCards[3],
      value: grantedCount.toString(),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
          <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar />

      {/* Main Content */}
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <UserDashboardHeader user={user} userData={userData} />

          <ApplicationPeriodBanner variant="user" />

          <StatsGrid stats={stats} />

          <RecentApplications applications={applications} />

          <UserQuickActions actions={quickActions} />
        </div>
      </div>
    </div>
  );
}
