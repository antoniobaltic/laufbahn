import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

const JOB_BOARD_DOMAINS = [
  "karriere.at",
  "linkedin.com",
  "stepstone.de",
  "stepstone.at",
  "xing.com",
  "indeed.com",
  "indeed.de",
  "jobs.ch",
  "jobrapido.com",
  "monster.de",
  "kununu.com",
];

const SOCIAL_DOMAINS = [
  "linkedin.com",
  "facebook.com",
  "instagram.com",
  "x.com",
  "twitter.com",
  "youtube.com",
  "tiktok.com",
];

const REDIRECT_STATUS_CODES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 5;

const REQUIREMENT_HEADINGS = [
  "anforder",
  "qualifikation",
  "qualifications",
  "profil",
  "skills",
  "requirements",
  "what you bring",
  "must have",
  "das bringst du mit",
  "was du mitbringst",
  "ihr profil",
  "dein profil",
  "voraussetzung",
];

const BENEFIT_HEADINGS = [
  "benefits",
  "wir bieten",
  "unser angebot",
  "was wir bieten",
  "what we offer",
  "perks",
  "vorteile",
  "zusatzleistungen",
  "goodies",
  "additional information",
  "das erwartet dich",
  "das erwartet sie",
  "deine vorteile",
];

const CONTACT_HEADINGS = [
  "ansprechpartner",
  "ansprechperson",
  "kontakt",
  "contact",
  "recruit",
  "hr kontakt",
  "hr ansprechpartner",
  "bewerbung an",
  "für rückfragen",
  "fragen zur bewerbung",
];

interface ParsedContent {
  description?: string;
  requirements: string[];
  benefits: string[];
  recruiter?: RecruiterInfo;
}

interface RecruiterInfo {
  recruiter_name?: string;
  recruiter_role?: string;
  recruiter_email?: string;
  recruiter_phone?: string;
}

export interface ScrapedJob {
  company_name?: string;
  role_title?: string;
  location?: string;
  salary_note?: string;
  salary_min?: number;
  salary_max?: number;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  employment_type?: string;
  remote_policy?: string;
  company_website_url?: string;
  company_logo_url?: string;
  recruiter_name?: string;
  recruiter_role?: string;
  recruiter_email?: string;
  recruiter_phone?: string;
  job_url?: string;
  domain?: string;
}

type ScraperBodyInput = {
  text: string;
  companyWebsiteUrl?: string;
  jobUrl?: string;
};

type DescriptionSection = {
  heading?: string;
  paragraphs: string[];
  items: string[];
};

export async function scrapeJobPosting(url: string): Promise<ScrapedJob> {
  const { response, finalUrl } = await fetchScrapeTarget(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  const domain = getHostname(finalUrl);

  const result: ScrapedJob = {
    job_url: finalUrl,
    domain: domain ?? undefined,
  };

  mergeScrapedJob(result, tryJsonLd($, finalUrl, domain));
  mergeScrapedJob(result, trySiteSpecific($, finalUrl, domain), true);
  mergeScrapedJob(result, tryOpenGraph($, finalUrl, domain));
  mergeScrapedJob(result, tryGeneric($, finalUrl, domain));

  if (!result.company_logo_url && !isKnownBoardDomain(domain)) {
    result.company_logo_url =
      normalizeUrl(
        $('meta[property="og:image"]').attr("content") ||
          $('meta[name="twitter:image"]').attr("content"),
        finalUrl
      ) || undefined;
  }

  if (!result.company_website_url && !isKnownBoardDomain(domain)) {
    result.company_website_url = finalUrl;
  }

  return normalizeScrapedJob(result);
}

async function fetchScrapeTarget(url: string) {
  let currentUrl = url;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    await assertSafeExternalUrl(currentUrl);

    const response = await fetch(currentUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });

    if (REDIRECT_STATUS_CODES.has(response.status)) {
      const location = response.headers.get("location");

      if (!location) {
        throw new Error("Weiterleitung ohne Ziel.");
      }

      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    return {
      response,
      finalUrl: response.url || currentUrl,
    };
  }

  throw new Error("Zu viele Weiterleitungen.");
}

async function assertSafeExternalUrl(value: string) {
  const parsed = new URL(value);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Nur http- und https-Links sind erlaubt.");
  }

  const hostname = parsed.hostname.toLowerCase();

  if (isBlockedHostname(hostname)) {
    throw new Error("Lokale oder interne Adressen sind nicht erlaubt.");
  }

  const addresses = await lookup(hostname, {
    all: true,
    verbatim: true,
  });

  if (addresses.length === 0) {
    throw new Error("Die Zieladresse konnte nicht aufgelöst werden.");
  }

  if (addresses.some((entry) => isPrivateIpAddress(entry.address))) {
    throw new Error("Lokale oder interne Adressen sind nicht erlaubt.");
  }
}

function isBlockedHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  );
}

function isPrivateIpAddress(address: string) {
  const family = isIP(address);

  if (family === 4) {
    return isPrivateIpv4Address(address);
  }

  if (family === 6) {
    return isPrivateIpv6Address(address);
  }

  return false;
}

function isPrivateIpv4Address(address: string) {
  const [a = 0, b = 0] = address.split(".").map((part) => Number(part));

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIpv6Address(address: string) {
  const normalized = address.toLowerCase();

  if (normalized === "::" || normalized === "::1") {
    return true;
  }

  if (normalized.startsWith("::ffff:")) {
    return isPrivateIpv4Address(normalized.slice(7));
  }

  return (
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}

export function parseJobInput({
  text,
  companyWebsiteUrl,
  jobUrl,
}: ScraperBodyInput): ScrapedJob {
  const trimmedText = text.trim();
  const normalizedJobUrl = normalizeUrl(jobUrl);
  const normalizedCompanyWebsiteUrl = normalizeUrl(companyWebsiteUrl);
  const domain = getHostname(normalizedJobUrl);

  const content = looksLikeHtml(trimmedText)
    ? parseHtmlDescription(trimmedText)
    : parsePlainTextDescription(trimmedText);

  const extractedUrls = extractUrlsFromText(trimmedText);
  const inferredWebsite =
    normalizedCompanyWebsiteUrl ||
    inferCompanyWebsiteUrl(extractedUrls, trimmedText) ||
    undefined;

  const titleParts = extractTitlePartsFromText(trimmedText);
  const salaryFromText = extractSalaryFromText(trimmedText);
  const recruiterFromText = content.recruiter ?? extractRecruiterFromText(trimmedText);

  return normalizeScrapedJob({
    job_url: normalizedJobUrl,
    domain: domain ?? undefined,
    company_name: titleParts.company_name,
    role_title: titleParts.role_title,
    location: titleParts.location,
    salary_note: salaryFromText.salary_note,
    salary_min: salaryFromText.salary_min,
    salary_max: salaryFromText.salary_max,
    description: content.description,
    requirements: content.requirements,
    benefits: content.benefits,
    employment_type: extractEmploymentTypeFromText(trimmedText),
    remote_policy: inferRemotePolicy(trimmedText),
    company_website_url: inferredWebsite,
    ...recruiterFromText,
  });
}

function tryJsonLd(
  $: cheerio.CheerioAPI,
  url: string,
  domain?: string | null
): ScrapedJob {
  const result: ScrapedJob = { job_url: url, domain: domain ?? undefined };

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).html();
    if (!raw) return;

    const data = parseJson(raw);
    if (!data) return;

    const job = collectJobPostingNodes(data)[0];
    if (!job) return;

    const hiringOrganization =
      typeof job.hiringOrganization === "object" && job.hiringOrganization
        ? (job.hiringOrganization as Record<string, unknown>)
        : undefined;
    const titleParts = extractTitleParts(String(job.title || job.name || ""));
    const parsedDescription = parseDescriptionValue(job.description);
    const salaryFromText = extractSalaryFromText(parsedDescription.description || "");
    const salaryFromSchema = parseBaseSalary(job.baseSalary, salaryFromText.salary_note);

    mergeScrapedJob(result, {
      role_title: titleParts.role_title || asString(job.title) || asString(job.name),
      company_name:
        asString(hiringOrganization?.name) ||
        asString(job.hiringOrganization) ||
        titleParts.company_name,
      location: extractLocation(job),
      description: parsedDescription.description,
      requirements: parsedDescription.requirements,
      benefits: parsedDescription.benefits,
      employment_type: normalizeEmploymentType(job.employmentType),
      remote_policy:
        inferRemotePolicy(parsedDescription.description || "") ||
        normalizeRemotePolicy(job.jobLocationType, job.applicantLocationRequirements),
      company_logo_url: normalizeUrl(asString(hiringOrganization?.logo), url),
      company_website_url: pickPreferredCompanyWebsite(
        normalizeToArray(hiringOrganization?.sameAs).filter(
          (entry): entry is string => typeof entry === "string"
        ),
        domain
      ),
      recruiter_name: parsedDescription.recruiter?.recruiter_name,
      recruiter_role: parsedDescription.recruiter?.recruiter_role,
      recruiter_email: parsedDescription.recruiter?.recruiter_email,
      recruiter_phone: parsedDescription.recruiter?.recruiter_phone,
      salary_note: salaryFromText.salary_note || salaryFromSchema.salary_note,
      salary_min: salaryFromSchema.salary_min,
      salary_max: salaryFromSchema.salary_max,
    });
  });

  return result;
}

function trySiteSpecific(
  $: cheerio.CheerioAPI,
  url: string,
  domain?: string | null
): ScrapedJob {
  if (!domain) {
    return {};
  }

  if (domain.endsWith("linkedin.com")) {
    const description = parseDescriptionValue(
      $(".show-more-less-html__markup").first().html() ||
        $(".show-more-less-html__markup").first().text()
    );

    const criteria = new Map<string, string>();
    $(".description__job-criteria-item").each((_, el) => {
      const label = normalizeHeading(
        $(el).find(".description__job-criteria-subheader").text()
      );
      const value = cleanText(
        $(el).find(".description__job-criteria-text").text()
      );

      if (label && value) {
        criteria.set(label, value);
      }
    });

    return {
      role_title: cleanText($("h1").first().text()),
      company_name: cleanText($(".topcard__org-name-link").first().text()),
      location:
        cleanText($(".topcard__flavor--bullet").first().text()) || undefined,
      description: description.description,
      requirements: description.requirements,
      benefits: description.benefits,
      company_logo_url:
        normalizeUrl(
          $(".artdeco-entity-image").first().attr("data-delayed-url") ||
            $(".artdeco-entity-image").first().attr("src"),
          url
        ) || undefined,
      employment_type:
        criteria.get("beschäftigungsverhältnis") ||
        criteria.get("employment type"),
      recruiter_name: description.recruiter?.recruiter_name,
      recruiter_role: description.recruiter?.recruiter_role,
      recruiter_email: description.recruiter?.recruiter_email,
      recruiter_phone: description.recruiter?.recruiter_phone,
      remote_policy:
        inferRemotePolicy(description.description || "") ||
        inferRemotePolicy(cleanText($.html())),
    };
  }

  return {};
}

function tryOpenGraph(
  $: cheerio.CheerioAPI,
  url: string,
  domain?: string | null
): ScrapedJob {
  const result: ScrapedJob = { job_url: url, domain: domain ?? undefined };
  const ogTitle =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="title"]').attr("content") ||
    $("title").text();
  const description =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content");
  const titleParts = extractTitleParts(ogTitle || "");

  mergeScrapedJob(result, {
    role_title: titleParts.role_title,
    company_name: titleParts.company_name,
    location: titleParts.location,
    description: description ? cleanText(description) : undefined,
    company_logo_url:
      !isKnownBoardDomain(domain) &&
      normalizeUrl($('meta[property="og:image"]').attr("content"), url)
        ? normalizeUrl($('meta[property="og:image"]').attr("content"), url)
        : undefined,
  });

  if (!result.company_name && !isKnownBoardDomain(domain)) {
    const siteName = $('meta[property="og:site_name"]').attr("content");
    result.company_name = siteName ? cleanText(siteName) : undefined;
  }

  return result;
}

function tryGeneric(
  $: cheerio.CheerioAPI,
  url: string,
  domain?: string | null
): ScrapedJob {
  const h1 = $("h1").first().text().trim();
  const titleTag = $("title").text().trim();
  const titleParts = extractTitleParts(h1 || titleTag);

  const descriptionHtml =
    $("article").first().html() ||
    $("main").find("section").slice(0, 4).toArray().map((el) => $.html(el)).join("\n") ||
    $("main").html();
  const parsedDescription = parseDescriptionValue(descriptionHtml);
  const salaryFromText = extractSalaryFromText(parsedDescription.description || "");
  const recruiterFromText =
    parsedDescription.recruiter ||
    extractRecruiterFromText(parsedDescription.description || "");

  return {
    job_url: url,
    domain: domain ?? undefined,
    role_title: titleParts.role_title || cleanTitle(h1 || titleTag),
    company_name: titleParts.company_name,
    location: titleParts.location,
    description: parsedDescription.description,
    requirements: parsedDescription.requirements,
    benefits: parsedDescription.benefits,
    salary_note: salaryFromText.salary_note,
    salary_min: salaryFromText.salary_min,
    salary_max: salaryFromText.salary_max,
    remote_policy: inferRemotePolicy(parsedDescription.description || ""),
    recruiter_name: recruiterFromText.recruiter_name,
    recruiter_role: recruiterFromText.recruiter_role,
    recruiter_email: recruiterFromText.recruiter_email,
    recruiter_phone: recruiterFromText.recruiter_phone,
  };
}

function parseDescriptionValue(value: unknown): ParsedContent {
  const text = typeof value === "string" ? value : "";
  if (!text.trim()) {
    return { description: undefined, requirements: [], benefits: [] };
  }

  return looksLikeHtml(text)
    ? parseHtmlDescription(text)
    : parsePlainTextDescription(text);
}

function parseHtmlDescription(html: string): ParsedContent {
  const $ = cheerio.load(`<div id="scrape-root">${html}</div>`);
  const root = $("#scrape-root");
  const sections: DescriptionSection[] = [];
  let current: DescriptionSection = { paragraphs: [], items: [] };

  const pushCurrent = () => {
    if (current.heading || current.paragraphs.length || current.items.length) {
      sections.push({
        heading: current.heading,
        paragraphs: dedupeStrings(current.paragraphs),
        items: dedupeStrings(current.items),
      });
    }
    current = { paragraphs: [], items: [] };
  };

  const visitNodes = (nodes: cheerio.Cheerio<AnyNode>) => {
    nodes.each((_, node) => {
      if (node.type === "text") {
        const text = cleanText($(node).text());
        if (text) {
          current.paragraphs.push(text);
        }
        return;
      }

      if (node.type !== "tag") {
        return;
      }

      const tagName = node.tagName.toLowerCase();
      const element = $(node);

      if (/^h[1-6]$/.test(tagName)) {
        pushCurrent();
        current.heading = cleanText(element.text());
        return;
      }

      if (tagName === "ul" || tagName === "ol") {
        element.children("li").each((__, item) => {
          const text = cleanText($(item).text());
          if (text) {
            current.items.push(text);
          }
        });
        return;
      }

      const childTags = element
        .children()
        .toArray()
        .map((child) => (child.type === "tag" ? child.tagName.toLowerCase() : ""));
      const hasStructuredChildren = childTags.some((childTag) =>
        ["h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "p", "section", "article", "div"].includes(
          childTag
        )
      );

      if (hasStructuredChildren) {
        visitNodes(element.contents());
        return;
      }

      const text = cleanText(element.text());
      if (text) {
        current.paragraphs.push(text);
      }
    });
  };

  visitNodes(root.contents());
  pushCurrent();

  return buildParsedContentFromSections(sections);
}

function parsePlainTextDescription(text: string): ParsedContent {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const sections: DescriptionSection[] = [];
  let current: DescriptionSection = { paragraphs: [], items: [] };

  const pushCurrent = () => {
    if (current.heading || current.paragraphs.length || current.items.length) {
      sections.push({
        heading: current.heading,
        paragraphs: dedupeStrings(current.paragraphs),
        items: dedupeStrings(current.items),
      });
    }
    current = { paragraphs: [], items: [] };
  };

  for (const line of lines) {
    if (looksLikeSectionHeading(line)) {
      pushCurrent();
      current.heading = line.replace(/[:\-]+$/, "").trim();
      continue;
    }

    const item = line.replace(/^[•*-]\s*/, "").trim();
    if (/^[•*-]\s*/.test(line)) {
      current.items.push(item);
      continue;
    }

    current.paragraphs.push(line);
  }

  pushCurrent();

  return buildParsedContentFromSections(sections);
}

function buildParsedContentFromSections(sections: DescriptionSection[]): ParsedContent {
  const requirements = dedupeStrings(
    sections.flatMap((section) =>
      matchesHeading(section.heading, REQUIREMENT_HEADINGS)
        ? section.items.length > 0
          ? section.items
          : section.paragraphs
        : []
    )
  );
  const benefits = dedupeStrings(
    sections.flatMap((section) =>
      matchesHeading(section.heading, BENEFIT_HEADINGS)
        ? section.items.length > 0
          ? section.items
          : section.paragraphs
        : []
    )
  );
  const recruiter =
    sections
      .filter((section) => matchesHeading(section.heading, CONTACT_HEADINGS))
      .map(extractRecruiterFromSection)
      .find((value) => value.recruiter_name || value.recruiter_email || value.recruiter_phone) ||
    undefined;

  const description = dedupeStrings(
    sections.flatMap((section) => {
      const lines = [
        section.heading,
        ...section.paragraphs,
        ...section.items.map((item) => `• ${item}`),
      ].filter(Boolean) as string[];
      return lines;
    })
  ).join("\n");

  return {
    description: description || undefined,
    requirements,
    benefits,
    recruiter,
  };
}

function extractRecruiterFromSection(section: DescriptionSection): RecruiterInfo {
  const content = [...section.paragraphs, ...section.items];
  const recruiter_role = section.heading?.replace(/[:\-]+$/, "").trim();
  const recruiter_email = extractEmail(content.join(" "));
  const recruiter_phone = extractPhone(content.join(" "));
  const recruiter_name =
    content.find((line) => isLikelyPersonName(line)) ||
    extractRecruiterFromText(content.join("\n")).recruiter_name;

  return {
    recruiter_name,
    recruiter_role,
    recruiter_email: recruiter_email || undefined,
    recruiter_phone: recruiter_phone || undefined,
  };
}

function extractRecruiterFromText(text: string): RecruiterInfo {
  const recruiterMatch =
    /(?:^|[\n\r])\s*((?:ansprechpartner(?:in)?|ansprechperson|kontakt(?:person)?|recruiter(?:in)?|hr(?:-| )?(?:kontakt|ansprechpartner(?:in)?)))\s*:?\s*([^\n]+)/i.exec(
      text
    );

  if (!recruiterMatch) {
    return {};
  }

  const recruiter_email = extractEmail(text);
  const recruiter_phone = extractPhone(text);
  const recruiter_name = extractLikelyPersonName(recruiterMatch[2]);

  return {
    recruiter_name,
    recruiter_role: recruiterMatch[1]?.replace(/[:\-]+$/, "").trim() || undefined,
    recruiter_email: recruiter_email || undefined,
    recruiter_phone: recruiter_phone || undefined,
  };
}

function parseBaseSalary(
  baseSalary: unknown,
  existingSalaryNote?: string
): Pick<ScrapedJob, "salary_note" | "salary_min" | "salary_max"> {
  if (!baseSalary || typeof baseSalary !== "object") {
    return {};
  }

  const raw = baseSalary as Record<string, unknown>;
  const currency = asString(raw.currency) || "EUR";
  const value =
    typeof raw.value === "object" && raw.value
      ? (raw.value as Record<string, unknown>)
      : raw;
  const unitText = normalizeSalaryUnit(asString(value.unitText) || asString(value.unitCode));
  const exactValue = toNumber(value.value);
  const minValue = toNumber(value.minValue);
  const maxValue = toNumber(value.maxValue);

  if (unitText === "YEAR") {
    if (minValue || maxValue) {
      return {
        salary_min: minValue || undefined,
        salary_max: maxValue || undefined,
        salary_note:
          existingSalaryNote ||
          formatSalaryNote({
            min: minValue,
            max: maxValue,
            currency,
            unit: unitText,
          }),
      };
    }

    if (exactValue) {
      return {
        salary_min: exactValue,
        salary_note:
          existingSalaryNote ||
          formatSalaryNote({
            exact: exactValue,
            currency,
            unit: unitText,
          }),
      };
    }
  }

  return {
    salary_note:
      existingSalaryNote ||
      formatSalaryNote({
        exact: exactValue,
        min: minValue,
        max: maxValue,
        currency,
        unit: unitText,
      }),
  };
}

function extractLocation(job: Record<string, unknown>): string | undefined {
  const rawLocations = normalizeToArray(job.jobLocation);
  const locations = rawLocations
    .flatMap((entry) => {
      if (typeof entry === "string") {
        return [cleanText(entry)];
      }

      if (entry && typeof entry === "object") {
        const locationEntry = entry as Record<string, unknown>;
        const address =
          typeof locationEntry.address === "object" && locationEntry.address
            ? (locationEntry.address as Record<string, unknown>)
            : locationEntry;
        const locality = asString(address?.addressLocality);
        const region = asString(address?.addressRegion);
        const country = asString(address?.addressCountry);
        return [
          [locality, region, country]
            .filter(Boolean)
            .join(", ")
            .trim(),
        ];
      }

      return [];
    })
    .filter(Boolean);

  return dedupeStrings(locations).join(" / ") || undefined;
}

function normalizeEmploymentType(type?: unknown): string | undefined {
  const values = normalizeToArray(type)
    .map((entry) => {
      const normalized = cleanText(String(entry)).toUpperCase();
      if (normalized.includes("FULL")) return "Vollzeit";
      if (normalized.includes("PART")) return "Teilzeit";
      if (normalized.includes("CONTRACT") || normalized.includes("FREELANCE")) {
        return "Freelance";
      }
      if (normalized.includes("INTERN")) return "Praktikum";
      if (normalized.includes("WORKING_STUDENT") || normalized.includes("WERKSTUDENT")) {
        return "Werkstudent";
      }
      if (normalized.includes("TEMP")) return "Befristet";
      return cleanText(String(entry));
    })
    .filter(Boolean);

  return dedupeStrings(values).join(" / ") || undefined;
}

function normalizeRemotePolicy(
  jobLocationType?: unknown,
  applicantLocationRequirements?: unknown
) {
  const locationType = asString(jobLocationType)?.toUpperCase();
  if (locationType?.includes("TELECOMMUTE")) {
    return "Remote";
  }

  const applicantLocations = normalizeToArray(applicantLocationRequirements);
  if (
    applicantLocations.some(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        (entry as Record<string, unknown>)["@type"] === "Country"
    )
  ) {
    return "Remote";
  }

  return undefined;
}

function inferRemotePolicy(text?: string) {
  const normalized = text?.toLowerCase() || "";
  if (!normalized) return undefined;
  if (normalized.includes("hybrid")) return "Hybrid";
  if (normalized.includes("home-office") || normalized.includes("home office")) {
    return "Hybrid";
  }
  if (
    normalized.includes("fully remote") ||
    normalized.includes("full remote") ||
    normalized.includes("100% remote") ||
    normalized.includes("voll remote") ||
    normalized.includes("remote-first")
  ) {
    return "Remote";
  }
  return undefined;
}

function extractSalaryFromText(
  text: string
): Pick<ScrapedJob, "salary_note" | "salary_min" | "salary_max"> {
  const normalized = text.replace(/\u00a0/g, " ");
  const sentenceMatch = normalized.match(
    /((?:mindest|mindestens|brutto|jahresgehalt|gehalt|vergütung|entgelt|salary|compensation|pay range|pay)\b[^\n]{0,160}(?:eur|€)[^\n]{0,120})/i
  );

  const rawSalaryNote = sentenceMatch ? cleanText(sentenceMatch[1]) : undefined;
  const hasMonthlyHint = /monat|vollzeitbasis/i.test(rawSalaryNote || "");
  const hasYearlyHint = /jahr|jährlich/i.test(rawSalaryNote || "");
  const sentenceMatchIndex = sentenceMatch?.index ?? 0;
  const salaryContext = sentenceMatch
    ? normalized.slice(
        Math.max(0, sentenceMatchIndex - 24),
        sentenceMatchIndex + sentenceMatch[1].length
      )
    : rawSalaryNote || "";
  const hasMinimumHint = /mindest|mindestens|\bab\b/i.test(salaryContext);
  const amounts = [
    ...(rawSalaryNote || "").matchAll(
      /(?:€|EUR)\s*([\d.]+(?:,\d{1,2}|,-)?)|([\d.]+(?:,\d{1,2}|,-)?)\s*(?:€|EUR)/gi
    ),
  ]
    .map((match) => parseGermanNumber(match[1] || match[2]))
    .filter((value): value is number => typeof value === "number");
  const unit = hasMonthlyHint ? "MONTH" : hasYearlyHint ? "YEAR" : undefined;

  const noteFromAmounts = (() => {
    if (amounts.length >= 2 && unit) {
      return formatSalaryNote({
        min: amounts[0],
        max: amounts[1],
        currency: "EUR",
        unit,
      });
    }

    if (amounts.length === 1 && unit) {
      const prefix = hasMinimumHint ? "ab " : "";
      return `${prefix}${formatCurrency(amounts[0], "EUR")}${
        unit === "MONTH" ? " / Monat" : " / Jahr"
      }`;
    }

    return undefined;
  })();

  if (amounts.length >= 2 && hasYearlyHint) {
    return {
      salary_note: noteFromAmounts || rawSalaryNote,
      salary_min: amounts[0],
      salary_max: amounts[1],
    };
  }

  if (amounts.length === 1 && hasYearlyHint) {
    return {
      salary_note: noteFromAmounts || rawSalaryNote,
      salary_min: amounts[0],
    };
  }

  if (amounts.length >= 2 && !hasMonthlyHint && !hasYearlyHint) {
    const [min, max] = amounts.slice(0, 2);
    if (max >= 10000) {
      return {
        salary_note: noteFromAmounts || rawSalaryNote,
        salary_min: min,
        salary_max: max,
      };
    }
  }

  return {
    salary_note: noteFromAmounts || rawSalaryNote,
  };
}

function formatSalaryNote({
  exact,
  min,
  max,
  currency,
  unit,
}: {
  exact?: number | null;
  min?: number | null;
  max?: number | null;
  currency: string;
  unit?: string;
}) {
  const unitLabel =
    unit === "MONTH" ? " / Monat" : unit === "YEAR" ? " / Jahr" : "";

  if (min && max) {
    return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}${unitLabel}`;
  }

  if (min) {
    return `ab ${formatCurrency(min, currency)}${unitLabel}`;
  }

  if (exact) {
    return `${formatCurrency(exact, currency)}${unitLabel}`;
  }

  return undefined;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function extractTitleParts(rawTitle: string): {
  role_title?: string;
  company_name?: string;
  location?: string;
} {
  const title = cleanText(rawTitle);
  if (!title) {
    return {};
  }

  const withoutSite = cleanTitle(title);
  const directPatterns = [
    { regex: /^(.+?)\s+bei\s+(.+?)(?:\s+in\s+(.+))?$/i, roleIndex: 1, companyIndex: 2, locationIndex: 3 },
    { regex: /^(.+?)\s+sucht\s+(.+?)(?:\s+in\s+(.+))?$/i, roleIndex: 2, companyIndex: 1, locationIndex: 3 },
    { regex: /^(.+?)\s+at\s+(.+?)(?:\s+in\s+(.+))?$/i, roleIndex: 1, companyIndex: 2, locationIndex: 3 },
  ];

  for (const pattern of directPatterns) {
    const match = pattern.regex.exec(withoutSite);
    if (!match) continue;
    return {
      role_title: cleanText(match[pattern.roleIndex] || ""),
      company_name: cleanText(match[pattern.companyIndex] || ""),
      location: cleanText(match[pattern.locationIndex] || ""),
    };
  }

  return { role_title: withoutSite };
}

function extractTitlePartsFromText(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const firstLine = lines[0] || "";
  const secondLine = lines[1] || "";
  const thirdLine = lines[2] || "";
  const titleFromFirstLine = extractTitleParts(firstLine);

  if (titleFromFirstLine.company_name || titleFromFirstLine.location) {
    return titleFromFirstLine;
  }

  const inferredCompany =
    /^(unternehmen|firma|arbeitgeber)\s*:/i.test(secondLine)
      ? cleanText(secondLine.split(":").slice(1).join(":"))
      : secondLine &&
          secondLine.length < 120 &&
          !looksLikeSectionHeading(secondLine) &&
          !/^(standort|ort|location)\s*:/i.test(secondLine)
        ? cleanText(secondLine)
        : undefined;

  const inferredLocation =
    /^(standort|ort|location)\s*:/i.test(secondLine)
      ? cleanText(secondLine.split(":").slice(1).join(":"))
      : /^(standort|ort|location)\s*:/i.test(thirdLine)
        ? cleanText(thirdLine.split(":").slice(1).join(":"))
        : inferredCompany && looksLikeLocationLine(thirdLine)
          ? cleanText(thirdLine)
        : undefined;

  return {
    role_title:
      titleFromFirstLine.role_title ||
      (firstLine && firstLine.length < 120 && !looksLikeSectionHeading(firstLine)
        ? cleanText(firstLine)
        : undefined),
    company_name: inferredCompany,
    location: inferredLocation,
  };
}

function extractEmploymentTypeFromText(text: string) {
  const normalized = text.toLowerCase();
  const matches = [
    normalized.includes("vollzeit") ? "Vollzeit" : null,
    normalized.includes("teilzeit") ? "Teilzeit" : null,
    normalized.includes("werkstudent") ? "Werkstudent" : null,
    normalized.includes("praktikum") ? "Praktikum" : null,
    normalized.includes("freelance") || normalized.includes("freiberuf")
      ? "Freelance"
      : null,
  ].filter(Boolean) as string[];

  return dedupeStrings(matches).join(" / ") || undefined;
}

function collectJobPostingNodes(value: unknown): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];

  const visit = (entry: unknown) => {
    if (!entry) return;

    if (Array.isArray(entry)) {
      entry.forEach(visit);
      return;
    }

    if (typeof entry !== "object") {
      return;
    }

    const candidate = entry as Record<string, unknown>;
    const typeValue = normalizeToArray(candidate["@type"]).map((item) =>
      cleanText(String(item))
    );
    if (typeValue.includes("JobPosting")) {
      results.push(candidate);
    }

    Object.values(candidate).forEach((child) => {
      if (typeof child === "object" && child) {
        visit(child);
      }
    });
  };

  visit(value);
  return results;
}

function normalizeScrapedJob(result: ScrapedJob): ScrapedJob {
  const companyWebsiteUrl = normalizeUrl(result.company_website_url);
  const domain =
    result.domain ||
    getHostname(result.job_url) ||
    getHostname(companyWebsiteUrl);

  const description = result.description
    ? result.description
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join("\n")
    : undefined;

  return {
    ...result,
    company_name: normalizeOptionalText(result.company_name),
    role_title: normalizeOptionalText(result.role_title),
    location: normalizeOptionalText(result.location),
    salary_note: normalizeOptionalText(result.salary_note),
    description,
    requirements: dedupeStrings(result.requirements ?? []),
    benefits: dedupeStrings(result.benefits ?? []),
    employment_type: normalizeOptionalText(result.employment_type),
    remote_policy: normalizeOptionalText(result.remote_policy),
    company_website_url: companyWebsiteUrl,
    company_logo_url: normalizeUrl(result.company_logo_url, result.job_url || companyWebsiteUrl),
    recruiter_name: normalizeOptionalText(result.recruiter_name),
    recruiter_role: normalizeOptionalText(result.recruiter_role),
    recruiter_email: normalizeOptionalText(result.recruiter_email),
    recruiter_phone: normalizeOptionalText(result.recruiter_phone),
    job_url: normalizeUrl(result.job_url),
    domain: domain ?? undefined,
  };
}

function mergeScrapedJob(
  target: ScrapedJob,
  source: ScrapedJob,
  overwrite = false
) {
  const mutableTarget = target as Record<string, unknown>;

  for (const [key, value] of Object.entries(source) as Array<
    [keyof ScrapedJob, ScrapedJob[keyof ScrapedJob]]
  >) {
    if (
      value == null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      continue;
    }

    const current = target[key];
    const currentIsEmpty =
      current == null ||
      current === "" ||
      (Array.isArray(current) && current.length === 0);

    if (overwrite || currentIsEmpty) {
      mutableTarget[key] = value;
    }
  }
}

function cleanTitle(title: string): string {
  return cleanText(title).replace(/\s*[\|–\-]\s*.{3,60}$/, "").trim();
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeOptionalText(value?: string | null) {
  const cleaned = value ? value.trim() : "";
  return cleaned || undefined;
}

function normalizeUrl(value?: string | null, baseUrl?: string | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    if (trimmed.startsWith("//")) {
      return `https:${trimmed}`;
    }

    if (/^https?:\/\//i.test(trimmed)) {
      return new URL(trimmed).toString();
    }

    if (trimmed.startsWith("/")) {
      if (!baseUrl) return undefined;
      return new URL(trimmed, baseUrl).toString();
    }

    if (/^[\w.-]+\.[A-Za-z]{2,}/.test(trimmed)) {
      return new URL(`https://${trimmed}`).toString();
    }

    return undefined;
  } catch {
    return undefined;
  }
}

function parseJson(raw: string) {
  try {
    return JSON.parse(raw.trim());
  } catch {
    return null;
  }
}

function normalizeToArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function asString(value: unknown) {
  return typeof value === "string" ? cleanText(value) : undefined;
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function normalizeSalaryUnit(unit?: string) {
  const normalized = unit?.toUpperCase();
  if (!normalized) return undefined;
  if (normalized.includes("YEAR")) return "YEAR";
  if (normalized.includes("MONTH")) return "MONTH";
  if (normalized.includes("HOUR")) return "HOUR";
  return normalized;
}

function dedupeStrings(values: Array<string | undefined | null>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function normalizeHeading(value?: string) {
  return cleanText(value || "")
    .toLowerCase()
    .replace(/[:\-]+$/g, "")
    .trim();
}

function matchesHeading(heading: string | undefined, patterns: string[]) {
  if (!heading) return false;
  const normalized = normalizeHeading(heading);
  return patterns.some((pattern) => normalized.includes(pattern));
}

function looksLikeHtml(text: string) {
  return /<[^>]+>/.test(text);
}

function looksLikeSectionHeading(line: string) {
  const normalized = normalizeHeading(line);
  const inlineValue = line.includes(":") ? line.split(":").slice(1).join(":").trim() : "";

  if (inlineValue && (extractLikelyPersonName(inlineValue) || /\d/.test(inlineValue))) {
    return false;
  }

  return (
    matchesHeading(normalized, REQUIREMENT_HEADINGS) ||
    matchesHeading(normalized, BENEFIT_HEADINGS) ||
    matchesHeading(normalized, CONTACT_HEADINGS) ||
    /^(aufgaben|schwerpunkte|verantwortung|beschreibung|about|über uns|unternehmen)$/i.test(
      normalized
    )
  );
}

function looksLikeLocationLine(line: string) {
  const normalized = cleanText(line);
  if (!normalized || normalized.length > 80) {
    return false;
  }

  if (
    looksLikeSectionHeading(normalized) ||
    /^(vollzeit|teilzeit|werkstudent|praktikum|freelance|hybrid|remote|vor ort)$/i.test(
      normalized
    ) ||
    /(ansprechpartner|kontakt|telefon|e-mail|email|gehalt|bruttoentgelt|mindestgehalt)/i.test(
      normalized
    ) ||
    /https?:\/\//i.test(normalized) ||
    normalized.includes("@")
  ) {
    return false;
  }

  return /^[\p{L}\p{N}][\p{L}\p{N}\s,./()\-]{1,79}$/u.test(normalized);
}

function extractUrlsFromText(text: string) {
  return [
    ...new Set(
      [...text.matchAll(/https?:\/\/[^\s)<>"]+/gi)].map((match) => match[0])
    ),
  ];
}

function inferCompanyWebsiteUrl(urls: string[], text: string) {
  const preferredFromUrls = urls
    .map((value) => normalizeUrl(value))
    .find((value) => value && !isKnownBoardOrSocialDomain(getHostname(value)));
  if (preferredFromUrls) {
    return preferredFromUrls;
  }

  const email = extractEmail(text);
  if (!email) return undefined;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || isKnownBoardOrSocialDomain(domain)) {
    return undefined;
  }

  return normalizeUrl(domain);
}

function pickPreferredCompanyWebsite(
  urls: string[],
  sourceDomain?: string | null
) {
  for (const candidate of urls) {
    const normalized = normalizeUrl(candidate);
    const hostname = getHostname(normalized);
    if (!normalized || !hostname) {
      continue;
    }

    if (isKnownBoardOrSocialDomain(hostname)) {
      continue;
    }

    if (sourceDomain && hostname === sourceDomain && isKnownBoardDomain(sourceDomain)) {
      continue;
    }

    return normalized;
  }

  return undefined;
}

function getHostname(value?: string | null) {
  if (!value) return null;
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function isKnownBoardDomain(domain?: string | null) {
  if (!domain) return false;
  return JOB_BOARD_DOMAINS.some(
    (candidate) => domain === candidate || domain.endsWith(`.${candidate}`)
  );
}

function isKnownBoardOrSocialDomain(domain?: string | null) {
  if (!domain) return false;
  return (
    isKnownBoardDomain(domain) ||
    SOCIAL_DOMAINS.some(
      (candidate) => domain === candidate || domain.endsWith(`.${candidate}`)
    )
  );
}

function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
}

function extractPhone(text: string) {
  const match = text.match(/(?:\+?\d[\d\s()/.-]{6,}\d)/);
  return match?.[0]?.replace(/\s+/g, " ").trim();
}

function isLikelyPersonName(value: string) {
  return Boolean(extractLikelyPersonName(value));
}

function extractLikelyPersonName(value: string) {
  const withoutLabels = value
    .replace(
      /^(ansprechpartner(?:in)?|ansprechperson|kontakt(?:person)?|recruiter(?:in)?|hr)\s*:?\s*/i,
      ""
    )
    .replace(/^(tel|telefon|phone|e-mail|email)\s*:?\s*/i, "")
    .replace(/\b(?:www\.|https?:\/\/).*/i, "")
    .trim();

  if (!withoutLabels || /\d/.test(withoutLabels) || /@/.test(withoutLabels)) {
    return undefined;
  }

  const match = withoutLabels.match(
    /([A-ZÄÖÜ][A-Za-zÄÖÜäöüß.'-]+(?:\s+[A-ZÄÖÜ][A-Za-zÄÖÜäöüß.'-]+){1,4}(?:,\s?(?:BA|MA|MBA|MSc|BSc|Dr\.?|Mag\.?))?)/
  );

  return match?.[1]?.trim();
}

function parseGermanNumber(value: string) {
  const normalized = value
    .replace(/\./g, "")
    .replace(/,-/g, "")
    .replace(/,$/g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}
