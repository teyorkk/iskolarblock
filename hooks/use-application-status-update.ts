import { toast } from "sonner";

export function useApplicationStatusUpdate(onSuccess?: () => void) {
  const updateStatus = async (
    applicationId: string,
    newStatus: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update application status");
        return false;
      }

      toast.success(`Application ${newStatus.toLowerCase()} successfully`);
      onSuccess?.();
      return true;
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("An error occurred while updating application status");
      return false;
    }
  };

  return { updateStatus };
}

