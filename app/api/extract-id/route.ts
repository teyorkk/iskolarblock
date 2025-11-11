import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

export interface IDExtractionResponse {
  last_name: string | null;
  first_name: string | null;
  middle_name: string | null;
  date_of_birth: string | null;
  place_of_birth: string | null;
  age: string | null;
  sex: string | null;
  residential_address: string | null;
  citizenship: string | null;
  contact_no: string | null;
  religion: string | null;
  course_or_strand: string | null;
  year_level: string | null;
}

// N8N response format with value and accuracy
interface N8NFieldResponse {
  value: string | null;
  accuracy: number;
}

interface N8NWebhookResponse {
  last_name: N8NFieldResponse;
  first_name: N8NFieldResponse;
  middle_name: N8NFieldResponse;
  date_of_birth: N8NFieldResponse;
  place_of_birth: N8NFieldResponse;
  age: N8NFieldResponse;
  sex: N8NFieldResponse;
  residential_address: N8NFieldResponse;
  citizenship: N8NFieldResponse;
  contact_no: N8NFieldResponse;
  religion: N8NFieldResponse;
  course_or_strand: N8NFieldResponse;
  year_level: N8NFieldResponse;
}

interface RequestBody {
  ocrText: string;
}

/**
 * Calculate age from date of birth
 * Supports formats: MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY
 */
function calculateAge(dateOfBirth: string | null): string | null {
  if (!dateOfBirth) return null;

  try {
    let birthDate: Date;

    // Try different date formats
    if (dateOfBirth.includes("/")) {
      // Format: MM/DD/YYYY or DD/MM/YYYY
      const parts = dateOfBirth.split("/");
      if (parts.length === 3) {
        const [first, second, year] = parts;
        // Assume MM/DD/YYYY format (common in Philippines)
        birthDate = new Date(
          parseInt(year),
          parseInt(first) - 1,
          parseInt(second)
        );
      } else {
        return null;
      }
    } else if (dateOfBirth.includes("-")) {
      // Format: YYYY-MM-DD or DD-MM-YYYY
      const parts = dateOfBirth.split("-");
      if (parts.length === 3 && parts[0].length === 4) {
        // YYYY-MM-DD
        birthDate = new Date(dateOfBirth);
      } else {
        // DD-MM-YYYY
        const [day, month, year] = parts;
        birthDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
      }
    } else {
      return null;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Validate age is reasonable (between 0 and 120)
    if (age < 0 || age > 120) {
      console.warn(
        `Calculated age ${age} seems unreasonable, skipping auto-calculation`
      );
      return null;
    }

    console.log(`Calculated age: ${age} from date of birth: ${dateOfBirth}`);
    return age.toString();
  } catch (error) {
    console.error("Failed to calculate age from date of birth:", error);
    return null;
  }
}

/**
 * Transform N8N response format to our expected format
 * N8N returns: { field: { value: "X", accuracy: 0.9 } }
 * We need: { field: "X" }
 */
function transformN8NResponse(
  n8nData: N8NWebhookResponse | N8NWebhookResponse[]
): IDExtractionResponse {
  // Handle array response (N8N returns array with single object)
  const dataObject = Array.isArray(n8nData) ? n8nData[0] : n8nData;

  if (!dataObject) {
    throw new Error("N8N response is empty");
  }

  // Extract values from N8N format
  const extractValue = (
    field: N8NFieldResponse | string | null
  ): string | null => {
    if (field === null || field === undefined) return null;
    if (typeof field === "string") return field; // Backward compatibility
    if (typeof field === "object" && "value" in field) {
      return field.value;
    }
    return null;
  };

  const dateOfBirth = extractValue(dataObject.date_of_birth);
  let age = extractValue(dataObject.age);

  // Calculate age if not provided but date of birth is available
  if (!age && dateOfBirth) {
    age = calculateAge(dateOfBirth);
  }

  const transformed: IDExtractionResponse = {
    last_name: extractValue(dataObject.last_name),
    first_name: extractValue(dataObject.first_name),
    middle_name: extractValue(dataObject.middle_name),
    date_of_birth: dateOfBirth,
    place_of_birth: extractValue(dataObject.place_of_birth),
    age: age,
    sex: extractValue(dataObject.sex),
    residential_address: extractValue(dataObject.residential_address),
    citizenship: extractValue(dataObject.citizenship),
    contact_no: extractValue(dataObject.contact_no),
    religion: extractValue(dataObject.religion),
    course_or_strand: extractValue(dataObject.course_or_strand),
    year_level: extractValue(dataObject.year_level),
  };

  // Log accuracy information if available
  console.log("=== Field Accuracy Report ===");
  Object.entries(dataObject).forEach(([key, field]) => {
    if (
      field &&
      typeof field === "object" &&
      "accuracy" in field &&
      "value" in field
    ) {
      if (field.value !== null) {
        console.log(
          `  ${key}: ${field.value} (accuracy: ${(field.accuracy * 100).toFixed(
            0
          )}%)`
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
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const jwtSecret = process.env.JWT_SECRET;

    if (!webhookUrl) {
      console.error("N8N_WEBHOOK_URL environment variable is not configured");
      return NextResponse.json(
        { error: "ID extraction service not configured" },
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
      console.error("Invalid N8N_WEBHOOK_URL:", webhookUrl);
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

    // Send to N8N webhook with timeout
    let response: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const requestBody = { ocrText };
      console.log("=== N8N Webhook Request ===");
      console.log("URL:", webhookUrl);
      console.log("OCR Text Length:", ocrText.length);
      console.log("OCR Text Preview:", ocrText.substring(0, 200));
      console.log(
        "Request Body:",
        JSON.stringify(requestBody).substring(0, 300)
      );

      response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("=== N8N Webhook Response ===");
      console.log("Status Code:", response.status);
      console.log("Status Text:", response.statusText);
      console.log(
        "Headers:",
        JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)
      );
    } catch (fetchError) {
      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError") {
          console.error("Webhook request timed out after 30 seconds");
          return NextResponse.json(
            { error: "Request timed out. Please try again." },
            { status: 504 }
          );
        }
        console.error("Webhook request failed:", fetchError.message);
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
          `Webhook error response (${statusCode}):`,
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
    let data: IDExtractionResponse;
    try {
      const responseText = await response.text();
      console.log("=== N8N Webhook Response Body ===");
      console.log("Raw Response:", responseText.substring(0, 1000));

      const rawData = JSON.parse(responseText) as
        | N8NWebhookResponse
        | N8NWebhookResponse[];
      console.log("Parsed Raw Data:", JSON.stringify(rawData, null, 2));

      // Transform N8N format to our expected format
      data = transformN8NResponse(rawData);
      console.log("=== Transformed Response Data ===");
      console.log(JSON.stringify(data, null, 2));
    } catch (jsonError) {
      console.error("Failed to parse webhook response:", jsonError);
      const errorMessage =
        jsonError instanceof Error ? jsonError.message : "Unknown error";
      return NextResponse.json(
        { error: `Invalid response from extraction service: ${errorMessage}` },
        { status: 502 }
      );
    }

    // Validate response structure
    if (!data || typeof data !== "object") {
      console.error("Webhook returned invalid data structure:", data);
      return NextResponse.json(
        { error: "Invalid data format from extraction service" },
        { status: 502 }
      );
    }

    // Log extracted fields
    const extractedFields = Object.entries(data).filter(
      ([, value]) => value !== null && value !== undefined && value !== ""
    );
    console.log("=== Final Extracted Fields ===");
    console.log(`Total fields extracted: ${extractedFields.length}`);
    extractedFields.forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    console.log(
      "✅ Successfully extracted and transformed ID data from N8N webhook"
    );
    return NextResponse.json(data);
  } catch (error) {
    // Catch-all error handler
    console.error("Unexpected error in extract-id API:", error);
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
