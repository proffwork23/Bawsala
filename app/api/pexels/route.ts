import { NextResponse } from "next/server";
import { createClient } from "pexels";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("keyword");

    if (!keyword) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
    }

    const apiKey = process.env.PEXELS_API_KEY;
    
    // Fallback image if no API key is provided during development
    if (!apiKey) {
      console.warn("PEXELS_API_KEY is not set. Using fallback image.");
      return NextResponse.json({ 
        url: "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
      });
    }

    const client = createClient(apiKey);
    const result = await client.photos.search({ query: keyword, per_page: 1, orientation: "landscape" });

    // Handle the case where the result is an ErrorResponse or Photos
    if ('error' in result) {
      throw new Error(result.error);
    }

    if (result.photos && result.photos.length > 0) {
      // Use large orientation for hero image
      return NextResponse.json({ url: result.photos[0].src.large2x });
    } else {
      // Fallback if no photo found
      return NextResponse.json({ 
        url: "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
      });
    }
  } catch (error: any) {
    console.error("Error fetching Pexels image:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
