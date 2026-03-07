"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, Sparkles } from "lucide-react";
import { createSourceDocument } from "@/actions/documents";
import { DocumentEditor } from "@/components/documents/document-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  formatDocumentTagInput,
  getDocumentTemplate,
  SOURCE_DOCUMENT_TYPE_OPTIONS,
} from "@/lib/utils/documents";
import type { ImportDocumentResult, SourceDocumentType } from "@/types/document";

interface DocumentBaseOption {
  documentId: string;
  title: string;
  documentType: SourceDocumentType;
  tags: string[];
  currentVersionId: string;
  currentVersionMarkdown: string;
}

interface DocumentCreateDialogProps {
  open: boolean;
  onClose: () => void;
  baseOptions: DocumentBaseOption[];
  variantFrom?: DocumentBaseOption | null;
}

const importModeOptions = [
  { value: "manual", label: "Neu schreiben" },
  { value: "import", label: "PDF oder DOCX übernehmen" },
] as const;

export function DocumentCreateDialog({
  open,
  onClose,
  baseOptions,
  variantFrom,
}: DocumentCreateDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<(typeof importModeOptions)[number]["value"]>(
    variantFrom ? "manual" : "manual"
  );
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState<SourceDocumentType>(
    variantFrom?.documentType ?? "lebenslauf"
  );
  const [tagInput, setTagInput] = useState("");
  const [parentDocumentId, setParentDocumentId] = useState<string>(
    variantFrom?.documentId ?? ""
  );
  const [versionLabel, setVersionLabel] = useState("");
  const [changeNote, setChangeNote] = useState("");
  const [markdown, setMarkdown] = useState(
    variantFrom?.currentVersionMarkdown ||
      getDocumentTemplate(variantFrom?.documentType ?? "lebenslauf")
  );
  const [rawMode, setRawMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportDocumentResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredBaseOptions = useMemo(
    () => baseOptions.filter((option) => option.documentType === documentType),
    [baseOptions, documentType]
  );
  const selectedBase =
    filteredBaseOptions.find((option) => option.documentId === parentDocumentId) || null;

  useEffect(() => {
    if (!open) {
      return;
    }

    setMode("manual");
    setTitle(
      variantFrom
        ? `${variantFrom.title} Variante`
        : ""
    );
    setDocumentType(variantFrom?.documentType ?? "lebenslauf");
    setTagInput(formatDocumentTagInput(variantFrom?.tags ?? []));
    setParentDocumentId(variantFrom?.documentId ?? "");
    setVersionLabel("");
    setChangeNote("");
    setMarkdown(
      variantFrom?.currentVersionMarkdown ||
        getDocumentTemplate(variantFrom?.documentType ?? "lebenslauf")
    );
    setRawMode(false);
    setSelectedFile(null);
    setImportResult(null);
    setImportError(null);
  }, [open, variantFrom]);

  useEffect(() => {
    if (variantFrom || importResult) {
      return;
    }

    setMarkdown((current) => {
      const currentTrimmed = current.trim();
      const lebenslaufTemplate = getDocumentTemplate("lebenslauf");
      const anschreibenTemplate = getDocumentTemplate("anschreiben");

      if (
        currentTrimmed === lebenslaufTemplate ||
        currentTrimmed === anschreibenTemplate
      ) {
        return getDocumentTemplate(documentType);
      }

      return current;
    });
  }, [documentType, importResult, variantFrom]);

  const handleImport = async () => {
    if (!selectedFile) {
      setImportError("Bitte wähle eine PDF- oder DOCX-Datei aus.");
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/documents/import", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as ImportDocumentResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Import fehlgeschlagen.");
      }

      setImportResult(data);
      setMarkdown(data.markdown);
      setMode("import");
      setRawMode(false);
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "Die Datei konnte nicht umgewandelt werden."
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleCreate = () => {
    startTransition(async () => {
      try {
        const sourceKind =
          importResult?.sourceKind || (selectedBase ? "variant" : "manual");
        const created = await createSourceDocument({
          title,
          document_type: documentType,
          tags: tagInput
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean),
          parent_document_id: parentDocumentId || undefined,
          markdown_content: markdown,
          version_label: versionLabel || undefined,
          change_note: changeNote || undefined,
          editor_mode: rawMode ? "markdown" : "guided",
          source_kind: sourceKind,
          source_version_id: selectedBase?.currentVersionId,
        });

        toast("Dokument gespeichert", "success");
        onClose();
        router.push(`/dokumente/${created.document.id}`);
        router.refresh();
      } catch (error) {
        toast(
          error instanceof Error
            ? error.message
            : "Dokument konnte nicht gespeichert werden.",
          "error"
        );
      }
    });
  };

  const canCreate = title.trim().length > 0 && markdown.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} className="w-[min(calc(100%-1.25rem),72rem)]">
      <DialogHeader onClose={onClose}>
        {variantFrom ? "Variante anlegen" : "Dokument anlegen"}
      </DialogHeader>
      <DialogContent className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="space-y-5">
            <div className="rounded-[24px] border border-border/80 bg-white/82 p-4 shadow-card">
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                Einstieg
              </p>
              <div className="mt-3 grid gap-4">
                <div className="flex flex-wrap gap-2">
                  {importModeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMode(option.value)}
                      className={
                        option.value === mode
                          ? "rounded-full bg-dark px-4 py-2 text-sm font-heading text-light"
                          : "rounded-full border border-border/80 bg-white px-4 py-2 text-sm font-heading text-dark-500"
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <Input
                  id="document-create-title"
                  label="Titel *"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="z.B. IT-Lebenslauf oder Anschreiben Marketing"
                />

                <Select
                  id="document-create-type"
                  label="Typ"
                  value={documentType}
                  onChange={(event) =>
                    setDocumentType(event.target.value as SourceDocumentType)
                  }
                  options={SOURCE_DOCUMENT_TYPE_OPTIONS}
                />

                <Input
                  id="document-create-tags"
                  label="Tags"
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="z.B. IT, Backend, SaaS"
                />

                <Select
                  id="document-create-base"
                  label="Basis"
                  value={parentDocumentId}
                  onChange={(event) => setParentDocumentId(event.target.value)}
                  options={[
                    { value: "", label: "Eigenständiges Dokument" },
                    ...filteredBaseOptions.map((option) => ({
                      value: option.documentId,
                      label: option.title,
                    })),
                  ]}
                />

                {selectedBase && (
                  <div className="rounded-[22px] border border-border/80 bg-dark-50/72 px-4 py-4">
                    <div className="flex items-center gap-2 text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                      <Sparkles size={13} className="text-accent-orange" />
                      Basis erkannt
                    </div>
                    <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                      Diese Version kann direkt als Ausgangspunkt übernommen werden.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedBase.tags.map((tag) => (
                        <Badge key={tag} variant="muted">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setMarkdown(selectedBase.currentVersionMarkdown)}
                      >
                        Inhalt der Basis übernehmen
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-border/80 bg-white/82 p-4 shadow-card">
              <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                Version
              </p>
              <div className="mt-3 grid gap-4">
                <Input
                  id="document-create-version-label"
                  label="Kurzlabel"
                  value={versionLabel}
                  onChange={(event) => setVersionLabel(event.target.value)}
                  placeholder="z.B. Backend-Fokus oder März 2026"
                />
                <Textarea
                  id="document-create-change-note"
                  label="Was ist neu?"
                  value={changeNote}
                  onChange={(event) => setChangeNote(event.target.value)}
                  placeholder="z.B. Projekterfahrung stärker hervorgehoben"
                  rows={4}
                />
              </div>
            </div>

            {mode === "import" && (
              <div className="rounded-[24px] border border-border/80 bg-white/82 p-4 shadow-card">
                <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                  Import
                </p>
                <div className="mt-3 space-y-4">
                  <label className="flex cursor-pointer items-center justify-center rounded-[22px] border border-dashed border-border/80 bg-dark-50/65 px-4 py-8 text-center">
                    <input
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={(event) => {
                        setSelectedFile(event.target.files?.[0] || null);
                        setImportError(null);
                      }}
                    />
                    <span className="space-y-2">
                      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-accent-orange shadow-card">
                        <FileUp size={18} />
                      </span>
                      <span className="block text-sm font-heading text-dark">
                        PDF oder DOCX wählen
                      </span>
                      <span className="block text-sm font-body leading-relaxed text-dark-500">
                        Laufbahn speichert nur Markdown, nicht die Originaldatei.
                      </span>
                    </span>
                  </label>

                  {selectedFile && (
                    <div className="rounded-[18px] border border-border/80 bg-white px-4 py-3 text-sm font-body text-dark-500">
                      {selectedFile.name}
                    </div>
                  )}

                  {importError && (
                    <p className="text-sm font-heading text-orange-600">{importError}</p>
                  )}

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleImport}
                    disabled={!selectedFile || isImporting}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Wird umgewandelt...
                      </>
                    ) : (
                      "In Markdown umwandeln"
                    )}
                  </Button>

                  {importResult?.warnings?.length ? (
                    <div className="rounded-[22px] border border-orange-200 bg-orange-50/75 px-4 py-4">
                      <p className="text-sm font-heading text-orange-700">
                        Bitte kurz prüfen
                      </p>
                      <ul className="mt-2 space-y-2 text-sm font-body leading-relaxed text-orange-700">
                        {importResult.warnings.map((warning) => (
                          <li key={warning}>- {warning}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <DocumentEditor
            value={markdown}
            onChange={setMarkdown}
            rawMode={rawMode}
            onRawModeChange={setRawMode}
            compact={false}
          />
        </div>
      </DialogContent>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
          Abbrechen
        </Button>
        <Button type="button" onClick={handleCreate} disabled={!canCreate || isPending}>
          {isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Speichert...
            </>
          ) : variantFrom ? (
            "Variante anlegen"
          ) : (
            "Dokument speichern"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
