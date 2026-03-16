import { NextResponse } from "next/server";

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url);
    const destination = searchParams.get("destination");

    if (!destination) {
      return NextResponse.json({ error: "Destination missing" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const url =
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+${destination}&key=${apiKey}`;

    const res = await fetch(url);

    const data = await res.json();

    console.log("RESTAURANT RESPONSE:", data);

    const restaurants =
      data?.results?.slice(0, 15).map((r: any) => ({
        name: r.name,
        rating: r.rating ?? 4.0,
      })) || [];

    return NextResponse.json(restaurants);

  } catch (error) {

    console.error("RESTAURANT API ERROR:", error);

    return NextResponse.json([]);

  }
}