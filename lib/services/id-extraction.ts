/**
 * ID Extraction Service
 * Sends OCR text to backend API which forwards to N8N webhook for structured data extraction
 */

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

export interface IDExtractionError {
  message: string;
  code: string;
  statusCode?: number;
}

/**
 * Send OCR text to backend API for extraction
 * Returns structured personal information data or throws an error
 */
export async function extractIDData(
  ocrText: string
): Promise<IDExtractionResponse | null> {
  // Validate input
  if (!ocrText || typeof ocrText !== "string") {
    console.error("extractIDData: Invalid OCR text provided");
    throw new Error("Invalid OCR text");
  }

  if (ocrText.trim().length === 0) {
    console.warn("extractIDData: Empty OCR text provided");
    return null; // Return null for empty text instead of throwing
  }

  try {
    // Call our API route which handles JWT signing and webhook communication
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 second timeout (slightly longer than server)

    let response: Response;
    try {
      response = await fetch("/api/extract-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ocrText }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError") {
          console.error("extractIDData: Request timed out");
          throw new Error(
            "Request timed out. The extraction service is taking too long to respond."
          );
        }

        console.error("extractIDData: Network error:", fetchError.message);
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
        console.error("extractIDData: Could not parse error response");
      }

      const errorMessage = errorData.error || "Failed to extract ID data";

      console.error(
        `extractIDData: API request failed with status ${statusCode}:`,
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
    let data: IDExtractionResponse;
    try {
      data = (await response.json()) as IDExtractionResponse;
    } catch (jsonError) {
      console.error("extractIDData: Failed to parse response JSON:", jsonError);
      throw new Error(
        "Invalid response from server. Please try uploading your document again."
      );
    }

    // Validate response structure
    if (!data || typeof data !== "object") {
      console.error("extractIDData: Invalid data structure received:", data);
      throw new Error("Invalid data format received from server.");
    }

    // Check if we got any useful data
    const hasData = Object.values(data).some(
      (value) => value !== null && value !== undefined && value !== ""
    );

    if (!hasData) {
      console.warn("extractIDData: No data could be extracted from document");
      return null; // Return null instead of throwing for no data extracted
    }

    console.log("extractIDData: Successfully extracted ID data");
    return data;
  } catch (error) {
    // Re-throw errors that we've already formatted
    if (error instanceof Error) {
      throw error;
    }

    // Catch-all for unexpected errors
    console.error("extractIDData: Unexpected error:", error);
    throw new Error(
      "An unexpected error occurred while extracting data from your document."
    );
  }
}

/**
 * Parse residential address from webhook response
 * Splits address into components (house number, purok, barangay, municipality)
 */
export interface ParsedAddress {
  houseNumber: string;
  purok: string;
  barangay: string;
  municipality: string;
}

export function parseResidentialAddress(
  address: string | null
): ParsedAddress | null {
  // Validate input
  if (!address || typeof address !== "string") {
    console.warn("parseResidentialAddress: Invalid address provided");
    return null;
  }

  const trimmedAddress = address.trim();

  if (trimmedAddress.length === 0) {
    console.warn("parseResidentialAddress: Empty address provided");
    return null;
  }

  try {
    // Common patterns for Philippine addresses:
    // "House# Purok, Barangay, Municipality"
    // "123 Purok 1, Brgy. Lawa, San Miguel"
    // "Purok 1, Brgy. Lawa, San Miguel, Bulacan"

    const parts = trimmedAddress
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (parts.length === 0) {
      console.warn(
        "parseResidentialAddress: Could not split address into parts"
      );
      return null;
    }

    if (parts.length === 1) {
      // Single part address - put it all in municipality
      console.info(
        "parseResidentialAddress: Single-part address, using as municipality"
      );
      return {
        houseNumber: "",
        purok: "",
        barangay: "",
        municipality: parts[0],
      };
    }

    if (parts.length === 2) {
      // Two parts - likely purok/street and municipality
      console.info(
        "parseResidentialAddress: Two-part address, splitting into purok and municipality"
      );
      return {
        houseNumber: "",
        purok: parts[0],
        barangay: "",
        municipality: parts[1],
      };
    }

    // Three or more parts - attempt full parsing
    let houseNumber = "";
    let purok = "";
    let barangay = "";
    let municipality = "";

    // First part usually contains house number and purok
    const firstPart = parts[0];

    // Try to extract house number (digits optionally followed by a letter)
    const houseMatch = firstPart.match(/^(\d+[A-Za-z]?)\s+(.+)$/);
    if (houseMatch) {
      houseNumber = houseMatch[1].trim();
      purok = houseMatch[2].trim();
    } else {
      // No house number found, treat entire first part as purok
      purok = firstPart;
    }

    // Second part is usually barangay
    if (parts[1]) {
      barangay = parts[1];
      // Remove common barangay prefixes
      barangay = barangay.replace(/^(Brgy\.?|Barangay|Bgry\.?)\s+/i, "").trim();
    }

    // Third part (and beyond) is municipality
    // If there are more than 3 parts, join the remaining parts
    if (parts.length === 3) {
      municipality = parts[2];
    } else if (parts.length > 3) {
      // Join remaining parts (e.g., "San Miguel, Bulacan")
      municipality = parts.slice(2).join(", ");
    }

    const parsedAddress = {
      houseNumber: houseNumber || "",
      purok: purok || "",
      barangay: barangay || "",
      municipality: municipality || trimmedAddress,
    };

    console.log("parseResidentialAddress: Successfully parsed address", {
      original: trimmedAddress,
      parsed: parsedAddress,
    });

    return parsedAddress;
  } catch (error) {
    console.error(
      "parseResidentialAddress: Failed to parse address:",
      error,
      "Address:",
      trimmedAddress
    );

    // Return fallback - put entire address in municipality
    return {
      houseNumber: "",
      purok: "",
      barangay: "",
      municipality: trimmedAddress,
    };
  }
}
