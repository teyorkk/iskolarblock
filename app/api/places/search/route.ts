import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();

    if (!query) {
      return NextResponse.json({ places: [] });
    }

    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
    nominatimUrl.searchParams.set("format", "json");
    nominatimUrl.searchParams.set("limit", "5");
    nominatimUrl.searchParams.set("addressdetails", "1");
    nominatimUrl.searchParams.set("accept-language", "en");
    nominatimUrl.searchParams.set("countrycodes", "ph");
    nominatimUrl.searchParams.set("q", query);

    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        "User-Agent": "IskolarBlock/1.0 (contact@iskolarblock.local)",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch location suggestions");
    }

    const data = (await response.json()) as Array<{
      display_name: string;
      type?: string;
      address?: {
        city?: string;
        town?: string;
        municipality?: string;
        village?: string;
        hamlet?: string;
        suburb?: string;
        county?: string;
        state?: string;
        region?: string;
        province?: string;
      };
    }>;

    const places = data.map((item) => {
      const address = item.address ?? {};
      const cityComponent =
        address.city ||
        address.town ||
        address.municipality ||
        address.village ||
        address.hamlet ||
        address.suburb ||
        address.county;
      const provinceComponent =
        address.province || address.state || address.region;

      const formattedName = [cityComponent, provinceComponent]
        .filter(Boolean)
        .join(", ")
        .trim();

      return {
        name: formattedName || item.display_name,
        displayName: item.display_name,
        type: item.type ?? "place",
      };
    });

    // Cache places results for 1 hour
    return NextResponse.json(
      { places },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error("Places search error:", error);
    return NextResponse.json(
      { error: "Unable to fetch location suggestions right now." },
      { status: 500 }
    );
  }
}
