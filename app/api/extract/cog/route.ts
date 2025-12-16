import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { validateJwtSecret } from "@/lib/utils/jwt-validation";

// Configure body size limit for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export interface COGExtractionResponse {
  "Certificate of Grades": boolean;
  school: string | null;
  school_year: string | null;
  semester: string | null;
  course: string | null;
  name: string | null;
  gwa: number | null;
  total_units: number | null;
  subjects: GradeSubject[] | null;
}

export interface GradeSubject {
  code: string;
  description: string;
  units: number;
  grade: string | number;
}

// N8N response format with value and accuracy
interface N8NFieldResponse {
  value: string | number | null;
  accuracy: number;
}

interface N8NWebhookResponse {
  "Certificate of Grades": boolean;
  school: N8NFieldResponse;
  school_year: N8NFieldResponse;
  semester: N8NFieldResponse;
  course: N8NFieldResponse;
  name: N8NFieldResponse;
  total_gwa: N8NFieldResponse;
  total_units: N8NFieldResponse;
  subjects: N8NFieldResponse; // Array of subjects
}

interface RequestBody {
  ocrText: string;
  fileData?: string; // Base64 file data
  fileName?: string;
  userId?: string;
  applicantName?: string | null;
}

/**
 * Transform N8N response format to our expected format
 * N8N returns: { field: { value: "X", accuracy: 0.9 } }
 * We need: { field: "X" }
 */
function transformN8NResponse(
  n8nData: N8NWebhookResponse | N8NWebhookResponse[]
): COGExtractionResponse {
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

  const dataRecord = dataObject as unknown as Record<string, unknown>;

  const getFieldValue = (
    ...keys: string[]
  ): N8NFieldResponse | string | number | null => {
    for (const key of keys) {
      if (key in dataRecord) {
        return dataRecord[key] as N8NFieldResponse | string | number | null;
      }
    }
    return null;
  };

  const transformed: COGExtractionResponse = {
    "Certificate of Grades": dataObject["Certificate of Grades"] ?? true,
    school: extractValue(getFieldValue("school", "School")) as string | null,
    school_year: extractValue(getFieldValue("school_year", "schoolYear")) as
      | string
      | null,
    semester: extractValue(getFieldValue("semester", "Semester")) as
      | string
      | null,
    course: extractValue(getFieldValue("course", "Course")) as string | null,
    name: extractValue(getFieldValue("name", "Name")) as string | null,
    gwa: extractValue(getFieldValue("total_gwa", "totalGwa", "GWA")) as
      | number
      | null,
    total_units: extractValue(getFieldValue("total_units", "totalUnits")) as
      | number
      | null,
    subjects: extractValue(getFieldValue("subjects", "Subjects")) as
      | GradeSubject[]
      | null,
  };

  // Log accuracy information if available
  console.log("=== COG Field Accuracy Report ===");
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

    const { ocrText, fileData, fileName, userId, applicantName } = body;

    // Upload file to Supabase storage if provided
    let fileUrl: string | null = null;
    if (fileData && fileName && userId) {
      try {
        const supabase = getSupabaseServerClient();

        // Convert base64 to buffer
        const base64Data = fileData.split(",")[1] || fileData;
        const buffer = Buffer.from(base64Data, "base64");

        // Generate unique file path
        const timestamp = Date.now();
        const filePath = `${userId}/cog/${timestamp}-${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, buffer, {
            contentType: fileName.endsWith(".pdf")
              ? "application/pdf"
              : "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          console.error("COG file upload error:", uploadError);
        } else {
          fileUrl = uploadData.path;
          console.log("✅ COG file uploaded to storage:", fileUrl);
        }
      } catch (storageError) {
        console.error("COG storage error:", storageError);
        // Continue with OCR even if storage fails
      }
    }

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
    const webhookUrl = process.env.N8N_WEBHOOK_URL2; // COG uses N8N_WEBHOOK_URL2
    const jwtSecret = process.env.JWT_SECRET;

    if (!webhookUrl) {
      console.error("N8N_WEBHOOK_URL2 environment variable is not configured");
      return NextResponse.json(
        { error: "COG extraction service not configured" },
        { status: 503 }
      );
    }

    // Validate JWT secret with security requirements
    const jwtValidation = validateJwtSecret(jwtSecret);
    if (!jwtValidation.isValid) {
      console.error("JWT_SECRET validation failed:", jwtValidation.error);
      return NextResponse.json(
        {
          error: jwtValidation.error || "Authentication service not configured",
        },
        { status: 503 }
      );
    }

    // Validate webhook URL format
    try {
      new URL(webhookUrl);
    } catch {
      console.error("Invalid N8N_WEBHOOK_URL2:", webhookUrl);
      return NextResponse.json(
        { error: "Invalid webhook URL configuration" },
        { status: 500 }
      );
    }

    // Create JWT token with OCR text payload
    let token: string;
    try {
      const payload = {
        name: applicantName || "",
        ocrText,
      };
      token = sign(payload, jwtSecret as string, {
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
      console.log("=== N8N COG Webhook Request ===");
      console.log("URL:", webhookUrl);
      console.log("OCR Text Length:", ocrText.length);
      console.log("OCR Text Preview:", ocrText.substring(0, 200));

      response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("=== N8N COG Webhook Response ===");
      console.log("Status Code:", response.status);
      console.log("Status Text:", response.statusText);
    } catch (fetchError) {
      if (fetchError instanceof Error) {
        console.error("COG webhook request failed:", fetchError.message);
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

      try {
        const errorData = await response.text();
        console.error(
          `COG Webhook error response (${statusCode}):`,
          errorData.substring(0, 500)
        );
      } catch {
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
    let data: COGExtractionResponse;
    try {
      const responseText = await response.text();
      console.log("=== N8N COG Webhook Response Body ===");
      console.log("Raw Response:", responseText.substring(0, 1000));

      const rawData = JSON.parse(responseText) as
        | N8NWebhookResponse
        | N8NWebhookResponse[];
      console.log("Parsed Raw Data:", JSON.stringify(rawData, null, 2));

      // Check if the uploaded file is actually a Certificate of Grades
      const dataObject = Array.isArray(rawData) ? rawData[0] : rawData;
      if (
        dataObject &&
        "Certificate of Grades" in dataObject &&
        dataObject["Certificate of Grades"] === false
      ) {
        console.error(
          "Invalid file type: Uploaded file is not a valid Certificate of Grades document"
        );
        return NextResponse.json(
          {
            error:
              "Invalid file type: Uploaded file is not a valid Certificate of Grades document",
          },
          { status: 400 }
        );
      }

      // Handle name mismatch error similar to COR
      if (
        dataObject &&
        "Match name" in dataObject &&
        dataObject["Match name"] === false
      ) {
        console.error(
          "Name mismatch: The name on the COG does not match the application form."
        );
        return NextResponse.json(
          {
            error:
              "Name mismatch: The name on your Certificate of Grades does not match the name entered in the application form. Please upload the correct COG.",
          },
          { status: 400 }
        );
      }

      // Transform N8N format to our expected format
      data = transformN8NResponse(rawData);
      console.log("=== Transformed COG Response Data ===");
      console.log(JSON.stringify(data, null, 2));
    } catch (jsonError) {
      console.error("Failed to parse COG webhook response:", jsonError);
      const errorMessage =
        jsonError instanceof Error ? jsonError.message : "Unknown error";
      return NextResponse.json(
        { error: `Invalid response from extraction service: ${errorMessage}` },
        { status: 502 }
      );
    }

    // Validate response structure
    if (!data || typeof data !== "object") {
      console.error("COG Webhook returned invalid data structure:", data);
      return NextResponse.json(
        { error: "Invalid data format from extraction service" },
        { status: 502 }
      );
    }

    console.log(
      "✅ Successfully extracted and transformed COG data from N8N webhook"
    );
    return NextResponse.json({
      ...data,
      fileUrl,
    });
  } catch (error) {
    // Catch-all error handler
    console.error("Unexpected error in extract-cog API:", error);
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
