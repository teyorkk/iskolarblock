/**
 * Email notification service for sending application status updates
 */

import { getCurrentTimePH } from "@/lib/utils/date-formatting";

interface SendEmailNotificationParams {
  applicantName: string;
  applicantEmail: string;
  applicationId: string;
  applicationType: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "GRANTED";
  rejectionReason?: string;
  submissionDate?: string;
}

/**
 * Sends an email notification via the internal API route
 * @param params Email notification parameters
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function sendEmailNotification(
  params: SendEmailNotificationParams
): Promise<boolean> {
  try {
    const payload = {
      applicantName: params.applicantName,
      applicantEmail: params.applicantEmail,
      applicationId: params.applicationId,
      applicationType: params.applicationType,
      status: params.status,
      rejectionReason: params.rejectionReason || "",
      submissionDate: params.submissionDate || getCurrentTimePH(),
    };

    console.log("📧 Sending email notification:", {
      email: params.applicantEmail,
      status: params.status,
      applicationId: params.applicationId,
    });

    const response = await fetch(
      `${process.env.APP_URL || "http://localhost:3000"}/api/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Email notification failed:", errorData);
      return false;
    }

    const result = await response.json();
    console.log("Email notification sent successfully:", result);
    return true;
  } catch (error) {
    console.error(" Error sending email notification:", error);
    return false;
  }
}
