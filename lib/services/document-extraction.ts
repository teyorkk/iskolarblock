/**
 * Document Extraction Service
 * Handles extraction of Certificate of Grades (COG) and Certificate of Registration (COR)
 * Sends OCR text to backend APIs which forward to N8N webhooks for structured data extraction
 */

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
  fileUrl?: string | null;
}

export interface GradeSubject {
  code: string;
  description: string;
  units: number;
  grade: string | number;
}

export interface CORExtractionResponse {
  "Certificate of Registration": boolean;
  school: string | null;
  school_year: string | null;
  semester: string | null;
  course: string | null;
  name: string | null;
  total_units: number | null;
  fileUrl?: string | null;
}

export interface DocumentExtractionError {
  message: string;
  code: string;
  statusCode?: number;
}

/**
 * Send OCR text to backend API for Certificate of Grades extraction
 * Returns structured COG data or throws an error
 */
export async function extractCOGData(
  ocrText: string,
  file?: File,
  userId?: string,
  applicantName?: string
): Promise<COGExtractionResponse | null> {
  // Validate input
  if (!ocrText || typeof ocrText !== "string") {
    console.error("extractCOGData: Invalid OCR text provided");
    throw new Error("Invalid OCR text");
  }

  if (ocrText.trim().length === 0) {
    console.warn("extractCOGData: Empty OCR text provided");
    return null; // Return null for empty text instead of throwing
  }

  try {
    // For large files (>3MB), upload directly to Supabase Storage first
    // This bypasses Vercel's 4.5MB request body limit
    let fileData: string | undefined;
    let fileUrl: string | undefined;
    let fileName: string | undefined;

    if (file && userId) {
      const fileSizeMB = file.size / (1024 * 1024);
      console.log(`📊 COG file size: ${fileSizeMB.toFixed(2)}MB, threshold: 3MB`);
      
      // Upload large files directly to Supabase Storage
      if (fileSizeMB > 3) {
        console.log("📤 File exceeds 3MB, uploading directly to Supabase Storage...");
        try {
          const { uploadFileToSupabase } = await import("@/lib/utils/file-upload");
          const storagePath = await uploadFileToSupabase(file, userId, undefined, "cog");
          fileUrl = storagePath;
          fileName = file.name;
          console.log("✅ Large file uploaded directly to Supabase:", fileUrl);
        } catch (uploadError) {
          console.error("❌ Failed to upload large file to Supabase:", uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : String(uploadError);
          
          // Check if it's an RLS policy error
          if (errorMessage.includes("new row violates row-level security") || 
              errorMessage.includes("RLS") ||
              errorMessage.includes("permission denied")) {
            throw new Error(
              "Upload permission denied. Please check your account permissions or contact support."
            );
          }
          
          // Fall back to base64 for smaller payload (only if file is small enough after all)
          if (fileSizeMB <= 3.5) {
            console.log("⚠️ Falling back to base64 encoding...");
            fileData = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            fileName = file.name;
          } else {
            throw new Error(
              `File too large (${fileSizeMB.toFixed(2)}MB). Please compress the file and try again. Upload error: ${errorMessage}`
            );
          }
        }
      } else {
        // Small files can be sent as base64
        console.log("📝 File is small, using base64 encoding...");
        fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        fileName = file.name;
      }
    }

    let response: Response;
    try {
      response = await fetch("/api/extract/cog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ocrText,
          fileData,
          fileUrl,
          fileName,
          userId,
          applicantName,
        }),
      });
    } catch (fetchError) {
      if (fetchError instanceof Error) {
        console.error("extractCOGData: Network error:", fetchError.message);
        throw new Error(
          "Network error. Please check your internet connection and try again."
        );
      }

      throw new Error(
        "An unknown error occurred while connecting to the server."
      );
    }

    // Handle non-OK responses
    if (!response.ok) {
      const statusCode = response.status;
      let errorData: { error?: string; details?: string } = {};

      try {
        errorData = await response.json();
      } catch {
        console.error("extractCOGData: Could not parse error response");
      }

      const errorMessage = errorData.error || "Failed to extract COG data";

      console.error(
        `extractCOGData: API request failed with status ${statusCode}:`,
        errorMessage
      );

      // Provide specific error messages based on status code
      if (statusCode === 400) {
        throw new Error(
          errorMessage || "Invalid request. Please check the uploaded document."
        );
      } else if (statusCode === 401 || statusCode === 403) {
        throw new Error("Authentication error. Please try again.");
      } else if (statusCode === 404) {
        throw new Error(
          "Extraction service not found. Please contact support."
        );
      } else if (statusCode === 503) {
        throw new Error(
          errorMessage ||
            "Extraction service is temporarily unavailable. Please try again later."
        );
      } else if (statusCode === 504) {
        throw new Error(
          "Request timed out. The document may be too complex to process."
        );
      } else if (statusCode >= 500) {
        throw new Error(
          "Server error occurred. Please try again in a few moments."
        );
      }

      throw new Error(errorMessage);
    }

    // Parse response data
    let data: COGExtractionResponse;
    try {
      data = (await response.json()) as COGExtractionResponse;
    } catch (jsonError) {
      console.error(
        "extractCOGData: Failed to parse response JSON:",
        jsonError
      );
      throw new Error(
        "Invalid response from server. Please try uploading your document again."
      );
    }

    // Validate response structure
    if (!data || typeof data !== "object") {
      console.error("extractCOGData: Invalid data structure received:", data);
      throw new Error("Invalid data format received from server.");
    }

    // Check if we got any useful data
    const hasData = Object.values(data).some(
      (value) => value !== null && value !== undefined && value !== ""
    );

    if (!hasData) {
      console.warn("extractCOGData: No data could be extracted from document");
      return null; // Return null instead of throwing for no data extracted
    }

    console.log("extractCOGData: Successfully extracted COG data");
    return data;
  } catch (error) {
    // Re-throw errors that we've already formatted
    if (error instanceof Error) {
      throw error;
    }

    // Catch-all for unexpected errors
    console.error("extractCOGData: Unexpected error:", error);
    throw new Error(
      "An unexpected error occurred while extracting data from your document."
    );
  }
}

/**
 * Send OCR text to backend API for Certificate of Registration extraction
 * Returns structured COR data or throws an error
 */
export async function extractCORData(
  ocrText: string,
  file?: File,
  userId?: string,
  applicantName?: string
): Promise<CORExtractionResponse | null> {
  // Validate input
  if (!ocrText || typeof ocrText !== "string") {
    console.error("extractCORData: Invalid OCR text provided");
    throw new Error("Invalid OCR text");
  }

  if (ocrText.trim().length === 0) {
    console.warn("extractCORData: Empty OCR text provided");
    return null; // Return null for empty text instead of throwing
  }

  try {
    // For large files (>3MB), upload directly to Supabase Storage first
    // This bypasses Vercel's 4.5MB request body limit
    let fileData: string | undefined;
    let fileUrl: string | undefined;
    let fileName: string | undefined;

    if (file && userId) {
      const fileSizeMB = file.size / (1024 * 1024);
      console.log(`📊 COR file size: ${fileSizeMB.toFixed(2)}MB, threshold: 3MB`);
      
      // Upload large files directly to Supabase Storage
      if (fileSizeMB > 3) {
        console.log("📤 File exceeds 3MB, uploading directly to Supabase Storage...");
        try {
          const { uploadFileToSupabase } = await import("@/lib/utils/file-upload");
          const storagePath = await uploadFileToSupabase(file, userId, undefined, "cor");
          fileUrl = storagePath;
          fileName = file.name;
          console.log("✅ Large file uploaded directly to Supabase:", fileUrl);
        } catch (uploadError) {
          console.error("❌ Failed to upload large file to Supabase:", uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : String(uploadError);
          
          // Check if it's an RLS policy error
          if (errorMessage.includes("new row violates row-level security") || 
              errorMessage.includes("RLS") ||
              errorMessage.includes("permission denied")) {
            throw new Error(
              "Upload permission denied. Please check your account permissions or contact support."
            );
          }
          
          // Fall back to base64 for smaller payload (only if file is small enough after all)
          if (fileSizeMB <= 3.5) {
            console.log("⚠️ Falling back to base64 encoding...");
            fileData = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            fileName = file.name;
          } else {
            throw new Error(
              `File too large (${fileSizeMB.toFixed(2)}MB). Please compress the file and try again. Upload error: ${errorMessage}`
            );
          }
        }
      } else {
        // Small files can be sent as base64
        console.log("📝 File is small, using base64 encoding...");
        fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        fileName = file.name;
      }
    }

    // Call our API route which handles JWT signing and webhook communication.
    // Timeout temporarily disabled to avoid premature failures.
    let response: Response;
    try {
      response = await fetch("/api/extract/cor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ocrText,
          fileData,
          fileUrl,
          fileName,
          userId,
          applicantName,
        }),
      });
    } catch (fetchError) {
      if (fetchError instanceof Error) {
        console.error("extractCORData: Network error:", fetchError.message);
        throw new Error(
          "Network error. Please check your internet connection and try again."
        );
      }

      throw new Error(
        "An unknown error occurred while connecting to the server."
      );
    }

    // Handle non-OK responses
    if (!response.ok) {
      const statusCode = response.status;
      let errorData: { error?: string; details?: string } = {};

      try {
        errorData = await response.json();
      } catch {
        console.error("extractCORData: Could not parse error response");
      }

      const errorMessage = errorData.error || "Failed to extract COR data";

      console.error(
        `extractCORData: API request failed with status ${statusCode}:`,
        errorMessage
      );

      // Provide specific error messages based on status code
      if (statusCode === 400) {
        throw new Error(
          errorMessage || "Invalid request. Please check the uploaded document."
        );
      } else if (statusCode === 401 || statusCode === 403) {
        throw new Error("Authentication error. Please try again.");
      } else if (statusCode === 404) {
        throw new Error(
          "Extraction service not found. Please contact support."
        );
      } else if (statusCode === 503) {
        throw new Error(
          errorMessage ||
            "Extraction service is temporarily unavailable. Please try again later."
        );
      } else if (statusCode === 504) {
        throw new Error(
          "Request timed out. The document may be too complex to process."
        );
      } else if (statusCode >= 500) {
        throw new Error(
          "Server error occurred. Please try again in a few moments."
        );
      }

      throw new Error(errorMessage);
    }

    // Parse response data
    let data: CORExtractionResponse;
    try {
      data = (await response.json()) as CORExtractionResponse;
    } catch (jsonError) {
      console.error(
        "extractCORData: Failed to parse response JSON:",
        jsonError
      );
      throw new Error(
        "Invalid response from server. Please try uploading your document again."
      );
    }

    // Validate response structure
    if (!data || typeof data !== "object") {
      console.error("extractCORData: Invalid data structure received:", data);
      throw new Error("Invalid data format received from server.");
    }

    // Check if we got any useful data
    const hasData = Object.values(data).some(
      (value) => value !== null && value !== undefined && value !== ""
    );

    if (!hasData) {
      console.warn("extractCORData: No data could be extracted from document");
      return null; // Return null instead of throwing for no data extracted
    }

    console.log("extractCORData: Successfully extracted COR data");
    return data;
  } catch (error) {
    // Re-throw errors that we've already formatted
    if (error instanceof Error) {
      throw error;
    }

    // Catch-all for unexpected errors
    console.error("extractCORData: Unexpected error:", error);
    throw new Error(
      "An unexpected error occurred while extracting data from your document."
    );
  }
}
