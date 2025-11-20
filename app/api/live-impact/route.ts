import { NextResponse } from "next/server";
import { getLiveImpactAggregates } from "@/lib/services/live-impact";

export async function GET(): Promise<NextResponse> {
  try {
    const data = await getLiveImpactAggregates();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Live impact aggregation failed:", error);
    return NextResponse.json(
      { error: "Failed to load live impact data." },
      { status: 500 }
    );
  }
}
