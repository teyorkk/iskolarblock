import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

export interface CORExtractionResponse {
  "Certificate of Registration": boolean;
  school: string | null;
  school_year: string | null;
  semester: string | null;
  course: string | null;
  name: string | null;
  total_units: number | null;
}

// N8N response format with value and accuracy
interface N8NFieldResponse {
  value: string | number | null;
  accuracy: number;
}

interface N8NWebhookResponse {
  "Certificate of Registration": boolean;
  school: N8NFieldResponse;
  school_year: N8NFieldResponse;
  semester: N8NFieldResponse;
  course: N8NFieldResponse;
  name: N8NFieldResponse;
  total_units: N8NFieldResponse;
}

interface RequestBody {
  ocrText: string;
}

/**
 * Transform N8N response format to our expected format
 * N8N returns: { field: { value: "X", accuracy: 0.9 } }
 * We need: { field: "X" }
 */
function transformN8NResponse(
  n8nData: N8NWebhookResponse | N8NWebhookResponse[]
): CORExtractionResponse {
  // Handle array response (N8N returns array with single object)
  const dataObject = Array.isArray(n8nData) ? n8nData[0] : n8nData;

  if (!dataObject) {
    throw new Error("N8N response is empty");
  }

  // Extract values from N8N format
  const extractValue = (
    field: N8NFieldResponse | string | number | null
  ): string | number | null => {
    if (field === null || field === undefined) return null;
    if (typeof field === "string" || typeof field === "number") return field; // Backward compatibility
    if (typeof field === "object" && "value" in field) {
      return field.value;
    }
    return null;
  };

  const transformed: CORExtractionResponse = {
    "Certificate of Registration":
      dataObject["Certificate of Registration"] ?? true,
    school: extractValue(dataObject.school) as string | null,
    school_year: extractValue(dataObject.school_year) as string | null,
    semester: extractValue(dataObject.semester) as string | null,
    course: extractValue(dataObject.course) as string | null,
    name: extractValue(dataObject.name) as string | null,
    total_units: extractValue(dataObject.total_units) as number | null,
  };

  // Log accuracy information if available
  console.log("=== COR Field Accuracy Report ===");
  Object.entries(dataObject).forEach(([key, field]) => {
    if (
      field &&
      typeof field === "object" &&
      "accuracy" in field &&
      "value" in field
    ) {
      if (field.value !== null) {
        console.log(
          `  ${key}: ${JSON.stringify(field.value).substring(
            0,
            100
          )} (accuracy: ${(field.accuracy * 100).toFixed(0)}%)`
        );
      }
    }
  });

  return transformed;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body: RequestBody;
    try {
      body = (await request.json()) as RequestBody;
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { ocrText } = body;

    // Validate OCR text
    if (!ocrText || typeof ocrText !== "string") {
      return NextResponse.json(
        { error: "OCR text is required and must be a string" },
        { status: 400 }
      );
    }

    if (ocrText.trim().length === 0) {
      return NextResponse.json(
        { error: "OCR text cannot be empty" },
        { status: 400 }
      );
    }

    if (ocrText.length > 50000) {
      return NextResponse.json(
        { error: "OCR text is too long (max 50,000 characters)" },
        { status: 400 }
      );
    }

    // Check environment variables
    const webhookUrl = process.env.N8N_WEBHOOK_URL3; // COR uses N8N_WEBHOOK_URL3
    const jwtSecret = process.env.JWT_SECRET;

    if (!webhookUrl) {
      console.error("N8N_WEBHOOK_URL3 environment variable is not configured");
      return NextResponse.json(
        { error: "COR extraction service not configured" },
        { status: 503 }
      );
    }

    if (!jwtSecret) {
      console.error("JWT_SECRET environment variable is not configured");
      return NextResponse.json(
        { error: "Authentication service not configured" },
        { status: 503 }
      );
    }

    // Validate webhook URL format
    try {
      new URL(webhookUrl);
    } catch (urlError) {
      console.error("Invalid N8N_WEBHOOK_URL3:", webhookUrl);
      return NextResponse.json(
        { error: "Invalid webhook URL configuration" },
        { status: 500 }
      );
    }

    // Create JWT token with OCR text payload
    let token: string;
    try {
      const payload = {
        ocrText,
        timestamp: Date.now(),
      };

      token = sign(payload, jwtSecret, {
        expiresIn: "5m",
      });
    } catch (jwtError) {
      console.error("Failed to create JWT token:", jwtError);
      return NextResponse.json(
        { error: "Failed to create authentication token" },
        { status: 500 }
      );
    }

    // Send to N8N webhook
    let response: Response;
    try {
      const requestBody = { ocrText };
      console.log("=== N8N COR Webhook Request ===");
      console.log("URL:", webhookUrl);
      console.log("OCR Text Length:", ocrText.length);
      console.log("OCR Text Preview:", ocrText.substring(0, 200));

      response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("=== N8N COR Webhook Response ===");
      console.log("Status Code:", response.status);
      console.log("Status Text:", response.statusText);
    } catch (fetchError) {
      if (fetchError instanceof Error) {
        console.error("COR webhook request failed:", fetchError.message);
        return NextResponse.json(
          {
            error: "Failed to connect to extraction service. Please try again.",
          },
          { status: 503 }
        );
      }
      console.error("Unknown webhook error:", fetchError);
      return NextResponse.json(
        { error: "Network error occurred" },
        { status: 503 }
      );
    }

    // Check response status
    if (!response.ok) {
      const statusCode = response.status;
      let errorMessage = `Webhook returned status ${statusCode}`;

      try {
        const errorData = await response.text();
        console.error(
          `COR Webhook error response (${statusCode}):`,
          errorData.substring(0, 500)
        );
        errorMessage += `: ${errorData.substring(0, 100)}`;
      } catch (textError) {
        console.error("Could not read error response body");
      }

      // Return appropriate error based on status code
      if (statusCode === 401 || statusCode === 403) {
        return NextResponse.json(
          { error: "Authentication failed with extraction service" },
          { status: 502 }
        );
      } else if (statusCode === 404) {
        return NextResponse.json(
          { error: "Extraction service endpoint not found" },
          { status: 502 }
        );
      } else if (statusCode >= 500) {
        return NextResponse.json(
          { error: "Extraction service is temporarily unavailable" },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: "Failed to extract data from document" },
        { status: 502 }
      );
    }

    // Parse response data
    let data: CORExtractionResponse;
    try {
      const responseText = await response.text();
      console.log("=== N8N COR Webhook Response Body ===");
      console.log("Raw Response:", responseText.substring(0, 1000));

      const rawData = JSON.parse(responseText) as
        | N8NWebhookResponse
        | N8NWebhookResponse[];
      console.log("Parsed Raw Data:", JSON.stringify(rawData, null, 2));

      // Transform N8N format to our expected format
      data = transformN8NResponse(rawData);
      console.log("=== Transformed COR Response Data ===");
      console.log(JSON.stringify(data, null, 2));
    } catch (jsonError) {
      console.error("Failed to parse COR webhook response:", jsonError);
      const errorMessage =
        jsonError instanceof Error ? jsonError.message : "Unknown error";
      return NextResponse.json(
        { error: `Invalid response from extraction service: ${errorMessage}` },
        { status: 502 }
      );
    }

    // Validate response structure
    if (!data || typeof data !== "object") {
      console.error("COR Webhook returned invalid data structure:", data);
      return NextResponse.json(
        { error: "Invalid data format from extraction service" },
        { status: 502 }
      );
    }

    console.log(
      "✅ Successfully extracted and transformed COR data from N8N webhook"
    );
    return NextResponse.json(data);
  } catch (error) {
    // Catch-all error handler
    console.error("Unexpected error in extract-cor API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "An unexpected error occurred while processing your request",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
