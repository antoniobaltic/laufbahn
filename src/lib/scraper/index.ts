import * as cheerio from "cheerio";

export interface ScrapedJob {
  company_name?: string;
  role_title?: string;
  location?: string;
  salary_note?: string;
  salary_min?: number;
  salary_max?: number;
  description?: string;
  employment_type?: string;
  remote_policy?: string;
  job_url: string;
  domain?: string;
}

export async function scrapeJobPosting(url: string): Promise<ScrapedJob> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract domain
  let domain: string | undefined;
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    // ignore
  }

  // 1. Try JSON-LD structured data (most reliable)
  const result = tryJsonLd($, url, domain);
  if (result.role_title) return result;

  // 2. Try Open Graph + meta tags
  const ogResult = tryOpenGraph($, url, domain);
  if (ogResult.role_title) return ogResult;

  // 3. Generic fallback
  return tryGeneric($, url, domain);
}

function tryJsonLd(
  $: cheerio.CheerioAPI,
  url: string,
  domain?: string
): ScrapedJob {
  const result: ScrapedJob = { job_url: url, domain };

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "");
      const jobs = Array.isArray(data) ? data : [data];

      for (const item of jobs) {
        if (item["@type"] === "JobPosting") {
          result.role_title = item.title || item.name;
          result.company_name =
            item.hiringOrganization?.name || item.hiringOrganization;
          result.location =
            item.jobLocation?.address?.addressLocality ||
            item.jobLocation?.address?.addressRegion ||
            (typeof item.jobLocation === "string" ? item.jobLocation : undefined);
          result.description = cleanText(
            item.description?.substring(0, 500) || ""
          );
          result.employment_type = normalizeEmploymentType(
            item.employmentType
          );

          // Salary
          if (item.baseSalary) {
            const sal = item.baseSalary;
            if (sal.value?.minValue) result.salary_min = sal.value.minValue;
            if (sal.value?.maxValue) result.salary_max = sal.value.maxValue;
            if (sal.value?.value)
              result.salary_note = `${sal.value.value} ${sal.currency || "EUR"}`;
          }

          // Remote
          if (
            item.jobLocationType === "TELECOMMUTE" ||
            item.applicantLocationRequirements?.["@type"] === "Country"
          ) {
            result.remote_policy = "Remote";
          }

          break;
        }
      }
    } catch {
      // invalid JSON, skip
    }
  });

  return result;
}

function tryOpenGraph(
  $: cheerio.CheerioAPI,
  url: string,
  domain?: string
): ScrapedJob {
  const result: ScrapedJob = { job_url: url, domain };

  const ogTitle =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="title"]').attr("content");
  const siteName =
    $('meta[property="og:site_name"]').attr("content");
  const description =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content");

  if (ogTitle) result.role_title = cleanTitle(ogTitle);
  if (siteName) result.company_name = siteName;
  if (description) result.description = cleanText(description.substring(0, 500));

  return result;
}

function tryGeneric(
  $: cheerio.CheerioAPI,
  url: string,
  domain?: string
): ScrapedJob {
  const result: ScrapedJob = { job_url: url, domain };

  // Title: h1, then title tag
  const h1 = $("h1").first().text().trim();
  const titleTag = $("title").text().trim();
  result.role_title = cleanTitle(h1 || titleTag);

  // Description: first substantial paragraph
  const desc = $("p")
    .filter((_, el) => $(el).text().trim().length > 100)
    .first()
    .text()
    .trim();
  if (desc) result.description = cleanText(desc.substring(0, 500));

  return result;
}

// ---- Helpers ----

function cleanTitle(title: string): string {
  // Remove site name suffixes like " | Company" or " - Company"
  return title.replace(/\s*[\|–\-]\s*.{3,50}$/, "").trim();
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // strip HTML
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeEmploymentType(type?: string | string[]): string | undefined {
  if (!type) return undefined;
  const t = (Array.isArray(type) ? type[0] : type).toUpperCase();
  if (t.includes("FULL")) return "Vollzeit";
  if (t.includes("PART")) return "Teilzeit";
  if (t.includes("CONTRACT") || t.includes("FREELANCE")) return "Freelance";
  if (t.includes("INTERN")) return "Praktikum";
  return undefined;
}
