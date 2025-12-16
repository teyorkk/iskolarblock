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
 * Sends an email notification directly to n8n webhook
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

    // Get n8n webhook URL from environment variable
    const webhookUrl = process.env.N8N_WEBHOOK_URL_EMAIL;

    if (!webhookUrl) {
      console.warn(
        "⚠️ N8N_WEBHOOK_URL_EMAIL not configured, skipping email notification"
      );
      return false;
    }

    // Send directly to n8n webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorData;

      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        errorData = await response.text();
      }

      console.error("❌ Email notification failed:", errorData);
      return false;
    }

    console.log("✅ Email notification sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Error sending email notification:", error);
    return false;
  }
}
