import { NextResponse } from "next/server";
import { getLiveBlockchainFeed } from "@/lib/services/live-blockchain";

export async function GET(): Promise<NextResponse> {
  try {
    const feed = await getLiveBlockchainFeed();
    return NextResponse.json(feed);
  } catch (error) {
    console.error("Live blockchain feed retrieval failed:", error);
    return NextResponse.json(
      { error: "Failed to load blockchain feed." },
      { status: 500 }
    );
  }
}
