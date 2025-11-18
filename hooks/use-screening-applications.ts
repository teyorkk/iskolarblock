import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface Application {
  id: string;
  userId: string;
  status: string;
  applicationType: string;
  createdAt: string;
  User: {
    id: string;
    name: string;
    email: string;
  };
}

export function useScreeningApplications(selectedPeriodId: string | null) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const url = selectedPeriodId
        ? `/api/admin/applications?periodId=${selectedPeriodId}`
        : "/api/admin/applications";
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to fetch applications");
        return;
      }

      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("An error occurred while fetching applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchApplications();
  }, [selectedPeriodId]);

  return {
    applications,
    isLoading,
    refetch: fetchApplications,
  };
}

