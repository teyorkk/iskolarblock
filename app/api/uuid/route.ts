import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const uuid = randomUUID();
    return NextResponse.json({ uuid });
  } catch (error) {
    console.error("UUID generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate UUID" },
      { status: 500 }
    );
  }
}
