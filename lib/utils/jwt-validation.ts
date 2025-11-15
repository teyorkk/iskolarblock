/**
 * Validates JWT secret to ensure it meets security requirements
 * @param jwtSecret - The JWT secret to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validateJwtSecret(jwtSecret: string | undefined): {
  isValid: boolean;
  error?: string;
} {
  // Check if secret exists
  if (!jwtSecret) {
    return {
      isValid: false,
      error: "JWT_SECRET environment variable is not configured",
    };
  }

  // Check if secret is a string
  if (typeof jwtSecret !== "string") {
    return {
      isValid: false,
      error: "JWT_SECRET must be a string",
    };
  }

  // Check minimum length (at least 32 characters for security)
  const MIN_LENGTH = 32;
  if (jwtSecret.length < MIN_LENGTH) {
    return {
      isValid: false,
      error: `JWT_SECRET must be at least ${MIN_LENGTH} characters long for security. Current length: ${jwtSecret.length}`,
    };
  }

  // Check for common weak/default values
  const weakSecrets = [
    "secret",
    "password",
    "12345678",
    "changeme",
    "default",
    "jwt_secret",
    "your-secret-key",
    "my-secret-key",
  ];

  const lowerSecret = jwtSecret.toLowerCase();
  if (weakSecrets.some((weak) => lowerSecret.includes(weak))) {
    return {
      isValid: false,
      error:
        "JWT_SECRET contains weak or default values. Please use a strong, randomly generated secret.",
    };
  }

  // Check for sufficient entropy (at least some variety in characters)
  const uniqueChars = new Set(jwtSecret).size;
  if (uniqueChars < 10 && jwtSecret.length < 64) {
    return {
      isValid: false,
      error:
        "JWT_SECRET has insufficient entropy. Please use a more complex, randomly generated secret.",
    };
  }

  return { isValid: true };
}

/**
 * Validates and returns JWT secret, throwing an error if invalid
 * @param jwtSecret - The JWT secret to validate
 * @returns The validated JWT secret
 * @throws Error if validation fails
 */
export function getValidatedJwtSecret(jwtSecret: string | undefined): string {
  const validation = validateJwtSecret(jwtSecret);
  if (!validation.isValid) {
    console.error("JWT_SECRET validation failed:", validation.error);
    throw new Error(validation.error || "Invalid JWT secret");
  }
  return jwtSecret as string;
}
