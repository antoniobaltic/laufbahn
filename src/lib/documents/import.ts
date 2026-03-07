import mammoth from "mammoth";
import { load } from "cheerio";
import { PDFParse } from "pdf-parse";
import TurndownService from "turndown";
import type { ImportDocumentResult } from "@/types/document";
import { markdownToPlainText, normalizeMarkdown } from "@/lib/utils/documents";

const SUPPORTED_EXTENSIONS = ["pdf", "docx"] as const;

type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

async function createTurndownService() {
  const service = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });
  const plugin = (await import("turndown-plugin-gfm")) as {
    gfm: (service: TurndownService) => void;
  };

  service.use(plugin.gfm);
  return service;
}

function getExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension || !SUPPORTED_EXTENSIONS.includes(extension as SupportedExtension)) {
    throw new Error("Bitte importiere eine PDF- oder DOCX-Datei.");
  }

  return extension as SupportedExtension;
}

function sanitizeDocxHtml(html: string) {
  const $ = load(`<div id="document-root">${html}</div>`);
  $("script, style, img, svg, canvas").remove();

  $("#document-root")
    .find("*")
    .each((_, element) => {
      if (element.tagName === "p" || element.tagName === "li") {
        const text = $(element).text().replace(/\s+/g, " ").trim();

        if (!text) {
          $(element).remove();
        }
      }
    });

  return $("#document-root").html() || "";
}

function normalizeImportedDocxMarkdown(markdown: string) {
  return normalizeMarkdown(
    markdown
      .replace(/\\-/g, "-")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\n([^\n#>-][^\n]*)\n(?=[^\n#>-])/g, (match) =>
        match.replace(/\n/g, " ")
      )
  );
}

function isLikelyHeading(line: string) {
  const cleaned = line.trim();

  if (!cleaned) {
    return false;
  }

  if (cleaned.length > 48) {
    return false;
  }

  if (/^[A-ZÄÖÜ0-9][A-ZÄÖÜ0-9 /&(),.-]+$/.test(cleaned)) {
    return true;
  }

  return /^(Kurzprofil|Profil|Berufserfahrung|Erfahrung|Ausbildung|Kenntnisse|Skills|Sprachen|Kontakt|Stärken|Motivation|Warum ich|Warum wir|Benefits|Aufgaben|Anforderungen)$/i.test(
    cleaned
  );
}

function isBulletLine(line: string) {
  return /^[•·▪●◦\-–*]\s+/.test(line.trim());
}

function formatPdfTextAsMarkdown(text: string) {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line, index, items) => line || items[index - 1]);

  const blocks: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }

    blocks.push(paragraph.join(" "));
    paragraph = [];
  };

  lines.forEach((line, index) => {
    const nextLine = lines[index + 1] || "";

    if (!line) {
      flushParagraph();
      return;
    }

    if (isLikelyHeading(line)) {
      flushParagraph();
      blocks.push(`## ${line.replace(/:$/, "")}`);
      return;
    }

    if (isBulletLine(line)) {
      flushParagraph();
      blocks.push(`- ${line.replace(/^[•·▪●◦\-–*]\s+/, "")}`);
      return;
    }

    if (/^[^:]{1,24}:\s+\S+/.test(line)) {
      flushParagraph();
      const [label, ...rest] = line.split(":");
      blocks.push(`- **${label.trim()}:** ${rest.join(":").trim()}`);
      return;
    }

    paragraph.push(line);

    if (
      /[.!?:)]$/.test(line) ||
      !nextLine ||
      isLikelyHeading(nextLine) ||
      isBulletLine(nextLine) ||
      /^[^:]{1,24}:\s+\S+/.test(nextLine)
    ) {
      flushParagraph();
    }
  });

  flushParagraph();

  return normalizeMarkdown(blocks.join("\n\n"));
}

async function importDocx(buffer: Buffer): Promise<ImportDocumentResult> {
  const result = await mammoth.convertToHtml({ buffer });
  const sanitized = sanitizeDocxHtml(result.value);
  const turndownService = await createTurndownService();
  const markdown = normalizeImportedDocxMarkdown(turndownService.turndown(sanitized));

  return {
    markdown,
    plainText: markdownToPlainText(markdown),
    warnings: result.messages.map((message) => message.message),
    sourceKind: "import_docx",
  };
}

async function importPdf(buffer: Buffer): Promise<ImportDocumentResult> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const markdown = formatPdfTextAsMarkdown(
      result.pages.map((page) => page.text).join("\n\n")
    );

    return {
      markdown,
      plainText: markdownToPlainText(markdown),
      warnings: [
        "PDF-Import übernimmt Text, aber keine exakte Gestaltung. Prüfe Überschriften, Abstände und Listen vor dem Speichern.",
      ],
      sourceKind: "import_pdf",
    };
  } finally {
    await parser.destroy();
  }
}

export async function importUploadedDocument(
  fileName: string,
  buffer: Buffer
): Promise<ImportDocumentResult> {
  const extension = getExtension(fileName);

  if (extension === "docx") {
    return importDocx(buffer);
  }

  return importPdf(buffer);
}
