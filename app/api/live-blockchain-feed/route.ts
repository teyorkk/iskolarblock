import { NextResponse } from "next/server";
import { getLiveBlockchainFeed } from "@/lib/services/live-blockchain";

export async function GET(): Promise<NextResponse> {
  try {
    const feed = await getLiveBlockchainFeed();
    // Cache for 30 seconds with stale-while-revalidate for better UX
    return NextResponse.json(feed, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Live blockchain feed retrieval failed:", error);
    return NextResponse.json(
      { error: "Failed to load blockchain feed." },
      { status: 500 }
    );
  }
}
