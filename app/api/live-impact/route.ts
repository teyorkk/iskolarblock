import { NextResponse } from "next/server";
import { getLiveImpactAggregates } from "@/lib/services/live-impact";

export async function GET(): Promise<NextResponse> {
  try {
    const data = await getLiveImpactAggregates();
    // Cache for 30 seconds with stale-while-revalidate
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Live impact aggregation failed:", error);
    return NextResponse.json(
      { error: "Failed to load live impact data." },
      { status: 500 }
    );
  }
}
