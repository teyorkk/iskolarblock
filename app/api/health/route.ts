import { NextResponse } from "next/server";
import { validateEnvironmentVariables } from "@/lib/utils/env-validation";

/**
 * Health check endpoint that validates environment configuration
 * This can be used to verify that all required environment variables are properly configured
 * 
 * GET /api/health
 */
export async function GET() {
  try {
    const validation = validateEnvironmentVariables();

    if (!validation.isValid) {
      return NextResponse.json(
        {
          status: "unhealthy",
          errors: validation.errors,
          message: "Environment validation failed. Please check your environment variables.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "healthy",
      message: "All environment variables are properly configured",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        status: "error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

