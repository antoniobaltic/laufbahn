import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scrapeJobPosting } from "@/lib/scraper";

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let url: string;
  try {
    const body = await request.json();
    url = body.url;
    if (!url || typeof url !== "string") throw new Error("No URL");
    new URL(url); // validate
  } catch {
    return NextResponse.json({ error: "Ungueltige URL" }, { status: 400 });
  }

  try {
    const data = await scrapeJobPosting(url);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Scraper error:", error);
    return NextResponse.json(
      { error: "Diese Seite konnte nicht gelesen werden." },
      { status: 422 }
    );
  }
}
