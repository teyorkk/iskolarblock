/**
 * Validates critical environment variables at application startup
 * This should be called early in the application lifecycle
 */
import { validateJwtSecret } from "./jwt-validation";

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates all critical environment variables
 * @returns Validation result with any errors found
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const errors: string[] = [];

  // Validate JWT Secret
  const jwtSecret = process.env.JWT_SECRET;
  const jwtValidation = validateJwtSecret(jwtSecret);
  if (!jwtValidation.isValid) {
    errors.push(`JWT_SECRET: ${jwtValidation.error}`);
  }

  // Validate Supabase variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL is not configured");
  }

  if (!supabaseAnonKey) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured");
  }

  // Validate N8N webhook URLs (optional, but log if missing)
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  const n8nWebhookUrl2 = process.env.N8N_WEBHOOK_URL2;
  const n8nWebhookUrl3 = process.env.N8N_WEBHOOK_URL3;

  // These are optional but should be present for full functionality
  if (!n8nWebhookUrl) {
    console.warn(
      "N8N_WEBHOOK_URL is not configured - ID extraction will not work"
    );
  }
  if (!n8nWebhookUrl2) {
    console.warn(
      "N8N_WEBHOOK_URL2 is not configured - COG extraction will not work"
    );
  }
  if (!n8nWebhookUrl3) {
    console.warn(
      "N8N_WEBHOOK_URL3 is not configured - COR extraction will not work"
    );
  }

  // Validate Polygon Amoy private key (optional for blockchain logging)
  const polygonAmoyPrivateKey = process.env.POLYGON_AMOY_PRIVATE_KEY;
  if (polygonAmoyPrivateKey) {
    // Validate format: must start with 0x and be 66 characters (0x + 64 hex chars)
    if (!polygonAmoyPrivateKey.startsWith("0x")) {
      errors.push("POLYGON_AMOY_PRIVATE_KEY must start with '0x'");
    } else if (polygonAmoyPrivateKey.length !== 66) {
      errors.push(
        "POLYGON_AMOY_PRIVATE_KEY must be 66 characters (0x + 64 hex characters)"
      );
    } else {
      // Validate hex characters
      const hexPattern = /^0x[0-9a-fA-F]{64}$/;
      if (!hexPattern.test(polygonAmoyPrivateKey)) {
        errors.push("POLYGON_AMOY_PRIVATE_KEY contains invalid hex characters");
      }
    }
  } else {
    console.warn(
      "POLYGON_AMOY_PRIVATE_KEY is not configured - blockchain logging will not work"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates environment variables and throws if invalid
 * Use this in critical paths where the app cannot function without proper env vars
 */
export function requireValidEnvironment(): void {
  const validation = validateEnvironmentVariables();
  if (!validation.isValid) {
    const errorMessage = `Environment validation failed:\n${validation.errors.join(
      "\n"
    )}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}
