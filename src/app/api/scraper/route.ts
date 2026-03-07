import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseJobInput, scrapeJobPosting } from "@/lib/scraper";

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let url: string | undefined;
  let text: string | undefined;
  let companyWebsiteUrl: string | undefined;
  let jobUrl: string | undefined;

  try {
    const body = await request.json();
    url = typeof body.url === "string" ? body.url.trim() : undefined;
    text = typeof body.text === "string" ? body.text.trim() : undefined;
    companyWebsiteUrl =
      typeof body.companyWebsiteUrl === "string"
        ? body.companyWebsiteUrl.trim()
        : undefined;
    jobUrl =
      typeof body.jobUrl === "string" ? body.jobUrl.trim() : undefined;

    if (url) {
      new URL(url);
    }

    if (companyWebsiteUrl) {
      new URL(companyWebsiteUrl);
    }

    if (jobUrl) {
      new URL(jobUrl);
    }

    if (!url && !text) {
      throw new Error("No import source");
    }
  } catch {
    return NextResponse.json(
      { error: "Bitte gib einen Link oder einen Text aus der Ausschreibung ein." },
      { status: 400 }
    );
  }

  try {
    const data = url
      ? await scrapeJobPosting(url)
      : parseJobInput({
          text: text!,
          companyWebsiteUrl,
          jobUrl,
        });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Scraper error:", error);
    return NextResponse.json(
      { error: "Diese Ausschreibung konnte nicht zuverlässig gelesen werden." },
      { status: 422 }
    );
  }
}
