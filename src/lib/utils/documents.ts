import type {
  SourceDocumentEditorMode,
  SourceDocumentSourceKind,
  SourceDocumentType,
} from "@/types/document";

export const SOURCE_DOCUMENT_TYPE_OPTIONS: {
  value: SourceDocumentType;
  label: string;
}[] = [
  { value: "lebenslauf", label: "Lebenslauf" },
  { value: "anschreiben", label: "Anschreiben" },
];

export function getSourceDocumentTypeLabel(type: SourceDocumentType) {
  return type === "lebenslauf" ? "Lebenslauf" : "Anschreiben";
}

export function getSourceDocumentTypePluralLabel(type: SourceDocumentType) {
  return type === "lebenslauf" ? "Lebensläufe" : "Anschreiben";
}

export function getSourceKindLabel(sourceKind: SourceDocumentSourceKind) {
  switch (sourceKind) {
    case "import_docx":
      return "Aus DOCX importiert";
    case "import_pdf":
      return "Aus PDF importiert";
    case "restore":
      return "Aus älterer Version wiederhergestellt";
    case "variant":
      return "Aus einer Basis gestartet";
    default:
      return "Manuell erstellt";
  }
}

export function getEditorModeLabel(editorMode: SourceDocumentEditorMode) {
  return editorMode === "markdown" ? "Markdown-Modus" : "Schreibansicht";
}

export function normalizeMarkdown(value: string) {
  const trimmed = value.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ");
  return trimmed.replace(/\n{3,}/g, "\n\n").trim();
}

export function markdownToPlainText(markdown: string) {
  return normalizeMarkdown(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function buildDocumentPreview(markdown: string, maxLength = 180) {
  const plainText = markdownToPlainText(markdown);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength - 1).trimEnd()}…`;
}

export function normalizeDocumentTags(tags?: string[]) {
  if (!tags?.length) {
    return [];
  }

  return [...new Set(
    tags
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => tag.slice(0, 32))
  )];
}

export function parseDocumentTagsInput(value: string) {
  return normalizeDocumentTags(
    value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
  );
}

export function formatDocumentTagInput(tags: string[]) {
  return tags.join(", ");
}

export function getDocumentTemplate(type: SourceDocumentType) {
  if (type === "anschreiben") {
    return normalizeMarkdown(`
# Anschreiben

## Einstieg

Warum genau diese Rolle und dieses Unternehmen?

## Passung

- Erfahrung oder Projekte, die hier besonders relevant sind
- Stärken, die im Alltag direkt helfen
- Ein Beispiel, das deine Arbeitsweise zeigt

## Abschluss

Ich freue mich auf die Möglichkeit, mich persönlich vorzustellen.
`);
  }

  return normalizeMarkdown(`
# Lebenslauf

## Kurzprofil

Ein bis zwei Sätze zu deinem Schwerpunkt und dem, was du mitbringst.

## Berufserfahrung

### Station

- Rolle, Zeitraum und wichtigste Verantwortung
- Ergebnis oder Wirkung in einem Satz

## Ausbildung

- Abschluss, Institution und Zeitraum

## Kenntnisse

- Tools, Sprachen oder Methoden
`);
}

export function formatDocumentVersionLabel(
  versionNumber: number,
  versionLabel?: string | null
) {
  const base = `Version ${versionNumber}`;
  return versionLabel?.trim() ? `${base} · ${versionLabel.trim()}` : base;
}
