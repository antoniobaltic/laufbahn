"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileClock,
  GitBranchPlus,
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  restoreSourceDocumentVersion,
  saveSourceDocumentVersion,
} from "@/actions/documents";
import { DocumentCreateDialog } from "@/components/documents/document-create-dialog";
import { DocumentEditor } from "@/components/documents/document-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  formatDocumentTagInput,
  formatDocumentVersionLabel,
  getSourceKindLabel,
  getSourceDocumentTypeLabel,
} from "@/lib/utils/documents";
import { formatDateTime, relativeDate } from "@/lib/utils/dates";
import type { SourceDocumentWorkspace } from "@/types/document";

interface DocumentWorkspaceProps {
  workspace: SourceDocumentWorkspace;
}

export function DocumentWorkspace({ workspace }: DocumentWorkspaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const initialTagInput = formatDocumentTagInput(workspace.document.tags);
  const initialMarkdown = workspace.currentVersion?.markdown_content || "";
  const initialRawMode = workspace.currentVersion?.editor_mode === "markdown";
  const [title, setTitle] = useState(workspace.document.title);
  const [tagInput, setTagInput] = useState(initialTagInput);
  const [changeNote, setChangeNote] = useState("");
  const [versionLabel, setVersionLabel] = useState("");
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [rawMode, setRawMode] = useState(initialRawMode);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [restoreVersionId, setRestoreVersionId] = useState<string | null>(null);

  useEffect(() => {
    setTitle(workspace.document.title);
    setTagInput(initialTagInput);
    setMarkdown(initialMarkdown);
    setVersionLabel("");
    setChangeNote("");
    setRawMode(initialRawMode);
  }, [initialMarkdown, initialRawMode, initialTagInput, workspace]);

  const titleChanged = title.trim() !== workspace.document.title;
  const tagsChanged = tagInput.trim() !== initialTagInput;
  const contentChanged = markdown.trim() !== initialMarkdown.trim();
  const editorModeChanged = rawMode !== initialRawMode;
  const createsVersion = Boolean(
    contentChanged || versionLabel.trim() || changeNote.trim()
  );
  const saveLabel = createsVersion
    ? "Neue Version speichern"
    : editorModeChanged && !titleChanged && !tagsChanged
      ? "Ansicht speichern"
      : "Angaben aktualisieren";
  const documentRoleLabel = workspace.document.parent_document_id
    ? "Variante"
    : workspace.childDocuments.length > 0
      ? "Basisdokument"
      : "Eigenständig";

  const isDirty = useMemo(() => {
    return (
      titleChanged ||
      tagsChanged ||
      contentChanged ||
      editorModeChanged ||
      versionLabel.trim().length > 0 ||
      changeNote.trim().length > 0
    );
  }, [
    changeNote,
    contentChanged,
    editorModeChanged,
    tagsChanged,
    titleChanged,
    versionLabel,
  ]);

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await saveSourceDocumentVersion(workspace.document.id, {
          title,
          tags: tagInput
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean),
          markdown_content: markdown,
          version_label: versionLabel || undefined,
          change_note: changeNote || undefined,
          editor_mode: rawMode ? "markdown" : "guided",
        });

        toast(
          result.createdNewVersion
            ? "Neue Version gespeichert"
            : editorModeChanged && !titleChanged && !tagsChanged
              ? "Ansicht gespeichert"
              : "Dokument aktualisiert",
          "success"
        );
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

  const handleRestore = (versionId: string) => {
    setRestoreVersionId(versionId);

    startTransition(async () => {
      try {
        await restoreSourceDocumentVersion(workspace.document.id, versionId);
        toast("Version wiederhergestellt", "success");
        router.refresh();
      } catch (error) {
        toast(
          error instanceof Error
            ? error.message
            : "Version konnte nicht wiederhergestellt werden.",
          "error"
        );
      } finally {
        setRestoreVersionId(null);
      }
    });
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workspace.document.title
      .toLowerCase()
      .replace(/[^a-z0-9äöüß]+/gi, "-")
      .replace(/^-|-$/g, "") || "dokument"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const variantSeed = workspace.currentVersion
    ? {
        documentId: workspace.document.id,
        title: workspace.document.title,
        documentType: workspace.document.document_type,
        tags: workspace.document.tags,
        currentVersionId: workspace.currentVersion.id,
        currentVersionNumber: workspace.currentVersion.version_number,
        currentVersionLabel: workspace.currentVersion.version_label,
        currentVersionMarkdown: workspace.currentVersion.markdown_content,
      }
    : null;

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-sm font-heading text-muted-foreground">
          <Link
            href="/dokumente"
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/78 px-4 py-2 transition-colors duration-150 hover:bg-white hover:text-dark"
          >
            <ArrowLeft size={14} />
            Zur Übersicht
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
          <Card className="overflow-hidden rounded-[30px]">
            <div className="h-1.5 bg-accent-orange" />
            <CardContent className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="muted">
                    {getSourceDocumentTypeLabel(workspace.document.document_type)}
                  </Badge>
                  <Badge
                    variant={workspace.document.parent_document_id ? "blue" : "muted"}
                  >
                    {documentRoleLabel}
                  </Badge>
                  {workspace.currentVersion && (
                    <Badge variant="green">
                      {formatDocumentVersionLabel(
                        workspace.currentVersion.version_number,
                        workspace.currentVersion.version_label
                      )}
                    </Badge>
                  )}
                  <Badge variant="muted">
                    {workspace.usages.length} Bewerbung
                    {workspace.usages.length === 1 ? "" : "en"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {workspace.lineage.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-xs font-heading text-muted-foreground">
                      {workspace.lineage.map((item) => (
                        <Link
                          key={item.id}
                          href={`/dokumente/${item.id}`}
                          className="rounded-full border border-border/80 bg-white/82 px-3 py-1.5 transition-colors hover:text-dark"
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  )}
                  <h1 className="text-3xl font-heading font-semibold text-dark sm:text-[2.1rem]">
                    {workspace.document.title}
                  </h1>
                  <p className="text-sm font-body leading-relaxed text-dark-500 sm:text-base">
                    Jede gespeicherte Fassung bleibt nachvollziehbar. Verknüpfungen mit
                    Bewerbungen bleiben auf die jeweils verwendete Version fixiert.
                  </p>
                </div>

                {workspace.document.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {workspace.document.tags.map((tag) => (
                      <Badge key={tag} variant="blue">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <InfoTile
                    label="Aktuelle Fassung"
                    value={
                      workspace.currentVersion
                        ? formatDocumentVersionLabel(
                            workspace.currentVersion.version_number,
                            workspace.currentVersion.version_label
                          )
                        : "Noch keine Version"
                    }
                  />
                  <InfoTile
                    label="Entstanden aus"
                    value={
                      workspace.currentVersion
                        ? getSourceKindLabel(workspace.currentVersion.source_kind)
                        : "Noch offen"
                    }
                  />
                  <InfoTile
                    label="Verwendet in"
                    value={`${workspace.usages.length} Bewerbung${
                      workspace.usages.length === 1 ? "" : "en"
                    }`}
                  />
                  <InfoTile
                    label="Struktur"
                    value={
                      workspace.lineage.at(-1)?.title ||
                      (workspace.document.parent_document_id
                        ? "Variante"
                        : workspace.childDocuments.length > 0
                          ? "Basis für Varianten"
                          : "Eigenständiges Dokument")
                    }
                  />
                </div>

                {workspace.currentVersion?.change_note && (
                  <div className="rounded-[22px] border border-border/80 bg-dark-50/62 px-4 py-4">
                    <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                      Aktuelle Notiz
                    </p>
                    <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                      {workspace.currentVersion.change_note}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[30px]">
            <CardHeader className="pb-4">
              <div className="space-y-1">
                <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                  Kurzstatus
                </p>
                <h2 className="text-lg font-heading font-semibold text-dark">
                  Schnellüberblick
                </h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <SummaryRow
                label="Zuletzt geändert"
                value={relativeDate(workspace.document.updated_at)}
              />
              <SummaryRow
                label="Entstanden aus"
                value={
                  workspace.currentVersion
                    ? getSourceKindLabel(workspace.currentVersion.source_kind)
                    : "Noch keine Version"
                }
              />
              <SummaryRow
                label="Varianten"
                value={String(workspace.childDocuments.length)}
              />
              <SummaryRow
                label="Verknüpft"
                value={`${workspace.usages.length} Bewerbung${
                  workspace.usages.length === 1 ? "" : "en"
                }`}
              />

              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={handleDownload}>
                  <Download size={14} />
                  Markdown laden
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setVariantDialogOpen(true)}
                  disabled={!variantSeed}
                >
                  <GitBranchPlus size={14} />
                  Variante anlegen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
          <div className="space-y-6">
            <Card className="rounded-[30px]">
              <CardHeader className="pb-4">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <Input
                    id="document-title"
                    label="Titel"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                  <Input
                    id="document-tags"
                    label="Tags"
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    placeholder="z.B. IT, Backend, SaaS"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <Input
                    id="document-version-label"
                    label="Kurzlabel für die neue Version"
                    value={versionLabel}
                    onChange={(event) => setVersionLabel(event.target.value)}
                    placeholder="z.B. Backend-Fokus"
                  />
                  <Textarea
                    id="document-change-note"
                    label="Was ist neu?"
                    value={changeNote}
                    onChange={(event) => setChangeNote(event.target.value)}
                    placeholder="z.B. neue Projekte ergänzt"
                    rows={3}
                  />
                </div>

                <div className="rounded-[22px] border border-border/80 bg-dark-50/62 px-4 py-4">
                  <p className="text-sm font-body leading-relaxed text-dark-500">
                    Titel und Tags ändern nur die Dokumentkarte. Eine neue Version
                    entsteht erst, wenn du Inhalt oder Versionsnotizen anpasst. Die
                    Schreibansicht merkt sich Laufbahn separat.
                  </p>
                </div>

                <DocumentEditor
                  value={markdown}
                  onChange={setMarkdown}
                  rawMode={rawMode}
                  onRawModeChange={setRawMode}
                />

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setTitle(workspace.document.title);
                      setTagInput(initialTagInput);
                      setMarkdown(initialMarkdown);
                      setVersionLabel("");
                      setChangeNote("");
                      setRawMode(initialRawMode);
                    }}
                    disabled={!isDirty || isPending}
                  >
                    Zurücksetzen
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={!isDirty || isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Speichert...
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        {saveLabel}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[28px]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileClock size={16} className="text-accent-blue" />
                  <h2 className="text-lg font-heading font-medium text-dark">
                    Versionsverlauf
                  </h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspace.versions.map((version) => {
                  const isCurrent = version.id === workspace.currentVersion?.id;

                  return (
                    <div
                      key={version.id}
                      className="rounded-[22px] border border-border/80 bg-white/82 px-4 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-heading font-semibold text-dark">
                              {formatDocumentVersionLabel(
                                version.version_number,
                                version.version_label
                              )}
                            </p>
                            {isCurrent && <Badge variant="green">Aktuell</Badge>}
                          </div>
                          <p className="text-sm font-body leading-relaxed text-dark-500">
                            {version.change_note ||
                              getSourceKindLabel(version.source_kind)}
                          </p>
                          <p className="text-xs font-heading text-muted-foreground">
                            {formatDateTime(version.created_at)}
                          </p>
                        </div>

                        {!isCurrent && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRestore(version.id)}
                            disabled={isPending}
                          >
                            {restoreVersionId === version.id ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Lädt...
                              </>
                            ) : (
                              <>
                                <RotateCcw size={14} />
                                Wiederherstellen
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="rounded-[28px]">
              <CardHeader className="pb-3">
                <h2 className="text-lg font-heading font-medium text-dark">
                  Verwendet in
                </h2>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspace.usages.length > 0 ? (
                  workspace.usages.map((usage) => (
                    <Link
                      key={usage.id}
                      href={`/bewerbung/${usage.application_id}`}
                      prefetch={false}
                      className="block rounded-[22px] border border-border/80 bg-white/82 px-4 py-4 transition-colors hover:bg-white"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-heading font-semibold text-dark">
                          {usage.application?.company_name || "Bewerbung"}
                        </p>
                        <Badge variant="muted">
                          {formatDocumentVersionLabel(
                            usage.version_number_snapshot,
                            usage.version_label_snapshot
                          )}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">
                        {usage.application?.role_title || "Ohne Titel"}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm font-body leading-relaxed text-dark-500">
                    Noch nicht mit einer Bewerbung verknüpft.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[28px]">
              <CardHeader className="pb-3">
                <h2 className="text-lg font-heading font-medium text-dark">
                  Varianten darunter
                </h2>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspace.childDocuments.length > 0 ? (
                  workspace.childDocuments.map((child) => (
                    <Link
                      key={child.document.id}
                      href={`/dokumente/${child.document.id}`}
                      prefetch={false}
                      className="block rounded-[22px] border border-border/80 bg-white/82 px-4 py-4 transition-colors hover:bg-white"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-heading font-semibold text-dark">
                          {child.document.title}
                        </p>
                        {child.currentVersion && (
                          <Badge variant="blue">
                            {formatDocumentVersionLabel(
                              child.currentVersion.version_number,
                              child.currentVersion.version_label
                            )}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">
                        {child.currentVersion?.plain_text.slice(0, 120).trimEnd()}
                        {child.currentVersion &&
                        child.currentVersion.plain_text.length > 120
                          ? "…"
                          : ""}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-border/80 bg-dark-50/62 px-4 py-4">
                    <p className="text-sm font-body leading-relaxed text-dark-500">
                      Noch keine Varianten darunter. Lege eine Variante an, wenn du
                      von dieser Basis für einen anderen Fokus starten möchtest.
                    </p>
                    <div className="mt-4">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setVariantDialogOpen(true)}
                        disabled={!variantSeed}
                      >
                        <GitBranchPlus size={14} />
                        Erste Variante anlegen
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {variantSeed && (
        <DocumentCreateDialog
          open={variantDialogOpen}
          onClose={() => setVariantDialogOpen(false)}
          baseOptions={[variantSeed]}
          variantFrom={variantSeed}
        />
      )}
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[20px] border border-border/80 bg-dark-50/58 px-4 py-3">
      <span className="text-sm font-body text-dark-500">{label}</span>
      <span className="text-sm font-heading text-dark">{value}</span>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-border/80 bg-dark-50/58 px-4 py-4">
      <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-heading text-dark">{value}</p>
    </div>
  );
}
