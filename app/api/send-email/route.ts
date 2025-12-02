import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      applicantName,
      applicantEmail,
      applicationId,
      applicationType,
      status,
    } = body;

    if (
      !applicantName ||
      !applicantEmail ||
      !applicationId ||
      !applicationType ||
      !status
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // n8n webhook URL from environment variable
    const webhookUrl = process.env.N8N_WEBHOOK_URL_EMAIL || "";

    console.log("Forwarding to n8n:", webhookUrl);
    console.log("Payload:", body);

    // Forward request to n8n webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("n8n response status:", response.status);

    // Handle n8n response
    let result;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = { message: text || "Email sent successfully" };
    }

    if (!response.ok) {
      console.error("n8n error:", result);
      return NextResponse.json(
        {
          error: "Failed to send email via n8n",
          details: result,
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in send-email API route:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        details:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack:
                  process.env.NODE_ENV === "development"
                    ? error.stack
                    : undefined,
              }
            : null,
      },
      { status: 500 }
    );
  }
}
