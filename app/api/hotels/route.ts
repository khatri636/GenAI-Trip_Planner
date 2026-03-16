import { NextResponse } from "next/server";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination");

  try {

    // Get coordinates
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${destination}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const geoData = await geoRes.json();

    console.log("GEOCODE:", geoData);

    const location = geoData.results[0].geometry.location;

    const lat = location.lat;
    const lng = location.lng;

    // Search nearby hotels
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=lodging&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const data = await res.json();

    console.log("HOTEL DATA:", data);

    const hotels = data.results.slice(0,5).map((h:any)=>({
      name: h.name,
      rating: h.rating
    }));

    return NextResponse.json(hotels);

  } catch (error) {

    console.error(error);

    return NextResponse.json([]);

  }

}