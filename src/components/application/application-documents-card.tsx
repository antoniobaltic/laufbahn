"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  FileText,
  Files,
  Loader2,
  PencilLine,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  createApplicationDocument,
  deleteApplicationDocument,
  updateApplicationDocument,
} from "@/actions/applications";
import {
  linkSourceDocumentToApplication,
  unlinkSourceDocumentFromApplication,
} from "@/actions/documents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { getDocumentTypeLabel } from "@/lib/utils/applications";
import {
  buildDocumentPreview,
  formatDocumentVersionLabel,
  getSourceDocumentTypeLabel,
} from "@/lib/utils/documents";
import type {
  ApplicationDocument,
  ApplicationDocumentType,
  CreateApplicationDocumentInput,
} from "@/types/application-detail";
import type {
  ApplicationSourceDocument,
  DocumentPickerOption,
  SourceDocumentType,
} from "@/types/document";

interface ApplicationDocumentsCardProps {
  applicationId: string;
  initialDocuments: ApplicationDocument[];
  initialLinkedDocuments: ApplicationSourceDocument[];
  documentPickerOptions: DocumentPickerOption[];
}

interface DocumentFormState {
  title: string;
  document_type: ApplicationDocumentType;
  document_url: string;
  version_label: string;
  notes: string;
}

const documentTypeOptions: {
  value: ApplicationDocumentType;
  label: string;
}[] = [
  { value: "lebenslauf", label: "Lebenslauf" },
  { value: "anschreiben", label: "Anschreiben" },
  { value: "portfolio", label: "Portfolio" },
  { value: "arbeitsprobe", label: "Arbeitsprobe" },
  { value: "zeugnis", label: "Zeugnis" },
  { value: "sonstiges", label: "Sonstiges" },
];

const initialFormState: DocumentFormState = {
  title: "",
  document_type: "lebenslauf",
  document_url: "",
  version_label: "",
  notes: "",
};

export function ApplicationDocumentsCard({
  applicationId,
  initialDocuments,
  initialLinkedDocuments,
  documentPickerOptions,
}: ApplicationDocumentsCardProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [linkedDocuments, setLinkedDocuments] = useState(initialLinkedDocuments);
  const [pickerSelections, setPickerSelections] = useState<{
    lebenslauf: string;
    anschreiben: string;
  }>({
    lebenslauf:
      initialLinkedDocuments.find((document) => document.document_type === "lebenslauf")
        ?.source_document_id || "",
    anschreiben:
      initialLinkedDocuments.find((document) => document.document_type === "anschreiben")
        ?.source_document_id || "",
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState(initialFormState);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const isMountedRef = useRef(true);

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  useEffect(() => {
    setLinkedDocuments(initialLinkedDocuments);
    setPickerSelections({
      lebenslauf:
        initialLinkedDocuments.find((document) => document.document_type === "lebenslauf")
          ?.source_document_id || "",
      anschreiben:
        initialLinkedDocuments.find((document) => document.document_type === "anschreiben")
          ?.source_document_id || "",
    });
  }, [initialLinkedDocuments]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const pickerOptionsByType = useMemo(
    () => ({
      lebenslauf: documentPickerOptions.filter(
        (option) => option.documentType === "lebenslauf"
      ),
      anschreiben: documentPickerOptions.filter(
        (option) => option.documentType === "anschreiben"
      ),
    }),
    [documentPickerOptions]
  );

  const linkedLebenslauf =
    linkedDocuments.find((document) => document.document_type === "lebenslauf") || null;
  const linkedAnschreiben =
    linkedDocuments.find((document) => document.document_type === "anschreiben") || null;

  const documentChecklist = useMemo(() => {
    const hasLegacyType = (type: ApplicationDocumentType) =>
      documents.some((document) => document.document_type === type);

    return [
      {
        label: "Lebenslauf",
        complete: Boolean(linkedLebenslauf) || hasLegacyType("lebenslauf"),
      },
      {
        label: "Anschreiben",
        complete: Boolean(linkedAnschreiben) || hasLegacyType("anschreiben"),
      },
      {
        label: "Portfolio / Arbeitsprobe",
        complete: hasLegacyType("portfolio") || hasLegacyType("arbeitsprobe"),
      },
    ];
  }, [documents, linkedAnschreiben, linkedLebenslauf]);

  const completedChecklistItems = documentChecklist.filter(
    (item) => item.complete
  ).length;

  const latestEntry = useMemo(() => {
    const legacyEntries = documents.map((document) => ({
      label: document.title,
      hint: document.version_label || "Als Link hinterlegt",
      createdAt: document.created_at,
    }));
    const fixedEntries = linkedDocuments.map((document) => ({
      label: document.title_snapshot,
      hint: formatDocumentVersionLabel(
        document.version_number_snapshot,
        document.version_label_snapshot
      ),
      createdAt: document.linked_at,
    }));

    return [...legacyEntries, ...fixedEntries].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    )[0] || null;
  }, [documents, linkedDocuments]);

  const handleCreate = () => {
    const payload = toPayload(form);

    startTransition(async () => {
      try {
        const created = await createApplicationDocument(applicationId, payload);
        setDocuments((prev) => [created, ...prev]);
        setForm(initialFormState);
        setIsFormOpen(false);
        toast("Link gespeichert", "success");
        router.refresh();
      } catch {
        toast("Link konnte nicht gespeichert werden", "error");
      }
    });
  };

  const handleUpdate = () => {
    if (!editingId) {
      return;
    }

    const payload = toPayload(editingForm);

    startTransition(async () => {
      try {
        const updated = await updateApplicationDocument(
          editingId,
          applicationId,
          payload
        );
        setDocuments((prev) =>
          prev.map((document) =>
            document.id === updated.id ? updated : document
          )
        );
        setEditingId(null);
        setEditingForm(initialFormState);
        toast("Link aktualisiert", "success");
        router.refresh();
      } catch {
        toast("Link konnte nicht aktualisiert werden", "error");
      }
    });
  };

  const handleDelete = (documentId: string) => {
    const deletedDocument =
      documents.find((document) => document.id === documentId) || null;
    const wasEditing = editingId === documentId;

    if (!deletedDocument) {
      return;
    }

    setDocuments((prev) => prev.filter((document) => document.id !== documentId));

    if (wasEditing) {
      setEditingId(null);
      setEditingForm(initialFormState);
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        await deleteApplicationDocument(documentId, applicationId);
        if (isMountedRef.current) {
          router.refresh();
        }
      } catch {
        if (isMountedRef.current) {
          setDocuments((prev) => [deletedDocument, ...prev]);
          if (wasEditing) {
            setEditingId(documentId);
            setEditingForm(toFormState(deletedDocument));
          }
          toast("Link konnte nicht entfernt werden", "error");
        }
      }
    }, 5200);

    toast({
      message: "Link entfernt",
      variant: "success",
      duration: 5200,
      action: {
        label: "Rückgängig",
        onClick: () => {
          clearTimeout(timeoutId);
          if (isMountedRef.current) {
            setDocuments((prev) => [deletedDocument, ...prev]);
            if (wasEditing) {
              setEditingId(documentId);
              setEditingForm(toFormState(deletedDocument));
            }
            toast("Link wiederhergestellt", "success");
          }
        },
      },
    });
  };

  const handleLinkDocument = (documentType: SourceDocumentType) => {
    const selectedDocumentId = pickerSelections[documentType];
    const option = documentPickerOptions.find(
      (item) =>
        item.documentId === selectedDocumentId && item.documentType === documentType
    );

    if (!option) {
      toast("Bitte wähle zuerst ein Dokument aus.", "error");
      return;
    }

    startTransition(async () => {
      try {
        const linked = await linkSourceDocumentToApplication({
          application_id: applicationId,
          source_document_id: option.documentId,
          source_document_version_id: option.currentVersionId,
        });

        setLinkedDocuments((prev) => [
          ...prev.filter((document) => document.document_type !== documentType),
          linked,
        ]);
        toast(
          documentType === "lebenslauf"
            ? "Lebenslauf verknüpft"
            : "Anschreiben verknüpft",
          "success"
        );
        router.refresh();
      } catch {
        toast("Dokument konnte nicht verknüpft werden", "error");
      }
    });
  };

  const handleUnlinkDocument = (documentType: SourceDocumentType) => {
    const linkedDocument =
      linkedDocuments.find((document) => document.document_type === documentType) ||
      null;

    if (!linkedDocument) {
      return;
    }

    setLinkedDocuments((prev) =>
      prev.filter((document) => document.document_type !== documentType)
    );

    const timeoutId = window.setTimeout(async () => {
      try {
        await unlinkSourceDocumentFromApplication(applicationId, documentType);
        if (isMountedRef.current) {
          router.refresh();
        }
      } catch {
        if (isMountedRef.current) {
          setLinkedDocuments((prev) => [linkedDocument, ...prev]);
          toast("Verknüpfung konnte nicht entfernt werden", "error");
        }
      }
    }, 5200);

    toast({
      message:
        documentType === "lebenslauf"
          ? "Lebenslauf entfernt"
          : "Anschreiben entfernt",
      variant: "success",
      duration: 5200,
      action: {
        label: "Rückgängig",
        onClick: () => {
          clearTimeout(timeoutId);
          if (isMountedRef.current) {
            setLinkedDocuments((prev) => [linkedDocument, ...prev]);
            toast("Verknüpfung wiederhergestellt", "success");
          }
        },
      },
    });
  };

  const openEdit = (document: ApplicationDocument) => {
    setIsFormOpen(false);
    setEditingId(document.id);
    setEditingForm(toFormState(document));
  };

  return (
    <Card className="rounded-[28px]">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Files size={16} className="text-accent-orange" />
              <h2 className="text-lg font-heading font-medium text-dark">
                Unterlagen
              </h2>
            </div>
            <p className="text-sm font-body leading-relaxed text-dark-500">
              Verknüpfe feste Versionen aus Dokumente und halte zusätzliche Links
              wie Portfolio, Zeugnisse oder Arbeitsproben daneben bereit.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingId(null);
              setEditingForm(initialFormState);
              setIsFormOpen((value) => !value);
            }}
          >
            <Plus size={14} />
            Zusätzlichen Link anlegen
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryTile
            icon={<Sparkles size={14} className="text-accent-orange" />}
            label="Basis-Set"
            value={`${completedChecklistItems}/3 bereit`}
            hint={
              completedChecklistItems === documentChecklist.length
                ? "Die wichtigsten Unterlagen sind an dieser Bewerbung bereits dran."
                : "Ergänze fehlende Kernunterlagen oder fixe Versionen aus Dokumente."
            }
          />
          <SummaryTile
            icon={<FileText size={14} className="text-accent-blue" />}
            label="Fix verknüpft"
            value={`${linkedDocuments.length}/2`}
            hint="Lebenslauf und Anschreiben bleiben hier auf die gewählte Version fixiert."
          />
          <SummaryTile
            icon={<Files size={14} className="text-accent-green" />}
            label="Zuletzt ergänzt"
            value={latestEntry?.label || "Noch nichts"}
            hint={latestEntry?.hint || "Verknüpfe zuerst eine feste Version oder einen Link."}
          />
        </div>

        <div className="rounded-[22px] border border-border/80 bg-dark-50/72 p-4">
          <div className="flex items-center gap-2 text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
            <Sparkles size={13} className="text-accent-orange" />
            Basis-Set
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {documentChecklist.map((item) => (
              <Badge
                key={item.label}
                variant={item.complete ? "green" : "muted"}
                className={!item.complete ? "text-muted-foreground" : undefined}
              >
                {item.label}
              </Badge>
            ))}
          </div>
        </div>

        <section className="space-y-3 rounded-[24px] border border-border/80 bg-white/76 p-4 sm:p-5">
          <div className="space-y-1">
            <h3 className="text-sm font-heading font-semibold text-dark">
              Lebenslauf & Anschreiben aus Dokumente
            </h3>
            <p className="text-sm font-body leading-relaxed text-dark-500">
              Sobald du hier verknüpfst, bleibt diese Bewerbung auf genau diese
              Fassung festgelegt. Spätere Änderungen am Dokument überschreiben die
              Bewerbung nicht still.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <LibraryLinkCard
              documentType="lebenslauf"
              linkedDocument={linkedLebenslauf}
              options={pickerOptionsByType.lebenslauf}
              selectedDocumentId={pickerSelections.lebenslauf}
              onSelect={(value) =>
                setPickerSelections((prev) => ({ ...prev, lebenslauf: value }))
              }
              onLink={() => handleLinkDocument("lebenslauf")}
              onUnlink={() => handleUnlinkDocument("lebenslauf")}
              isPending={isPending}
            />
            <LibraryLinkCard
              documentType="anschreiben"
              linkedDocument={linkedAnschreiben}
              options={pickerOptionsByType.anschreiben}
              selectedDocumentId={pickerSelections.anschreiben}
              onSelect={(value) =>
                setPickerSelections((prev) => ({ ...prev, anschreiben: value }))
              }
              onLink={() => handleLinkDocument("anschreiben")}
              onUnlink={() => handleUnlinkDocument("anschreiben")}
              isPending={isPending}
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-heading font-semibold text-dark">
              Weitere Links & Unterlagen
            </h3>
            <p className="text-sm font-body leading-relaxed text-dark-500">
              Für Portfolio, Zeugnisse, Arbeitsproben oder einzelne Freigabelinks.
            </p>
          </div>

          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((document) => {
                const isEditing = editingId === document.id;

                return (
                  <div
                    key={document.id}
                    className="surface-muted rounded-[24px] p-4 transition-all duration-200 hover:shadow-card"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="truncate text-sm font-heading font-semibold text-dark">
                              {document.title}
                            </h4>
                            <Badge variant="muted">
                              {getDocumentTypeLabel(document.document_type)}
                            </Badge>
                            {document.version_label && (
                              <Badge variant="blue">{document.version_label}</Badge>
                            )}
                          </div>
                          <a
                            href={document.document_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-heading text-accent-orange transition-colors hover:text-orange-600"
                          >
                            Öffnen
                            <ExternalLink size={12} />
                          </a>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(document)}
                            disabled={isPending}
                          >
                            <PencilLine size={14} />
                            Bearbeiten
                          </Button>
                          <button
                            type="button"
                            onClick={() => handleDelete(document.id)}
                            disabled={isPending}
                            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {document.notes && (
                        <p className="text-sm font-body leading-relaxed text-dark-500">
                          {document.notes}
                        </p>
                      )}

                      {isEditing && (
                        <div className="rounded-[22px] border border-border/70 bg-white/86 p-4 shadow-card">
                          <DocumentFormFields
                            form={editingForm}
                            setForm={setEditingForm}
                            idPrefix={`document-edit-${document.id}`}
                          />

                          <div className="mt-4 flex flex-wrap justify-end gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setEditingId(null);
                                setEditingForm(initialFormState);
                              }}
                            >
                              Abbrechen
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleUpdate}
                              disabled={
                                !editingForm.title.trim() ||
                                !editingForm.document_url.trim() ||
                                isPending
                              }
                            >
                              {isPending ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" />
                                  Speichert...
                                </>
                              ) : (
                                "Link aktualisieren"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-dark-50/70 p-5">
              <p className="text-sm font-body leading-relaxed text-dark-500">
                Noch keine zusätzlichen Links hinterlegt. Das ist völlig okay, wenn
                du Lebenslauf und Anschreiben bereits oben aus Dokumente verknüpft
                hast.
              </p>
              {!isFormOpen && (
                <div className="mt-4">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsFormOpen(true)}
                  >
                    <Plus size={14} />
                    Ersten Link anlegen
                  </Button>
                </div>
              )}
            </div>
          )}

          {isFormOpen && (
            <div className="surface-muted rounded-[24px] p-4 sm:p-5">
              <p className="mb-4 text-sm font-body leading-relaxed text-dark-500">
                Nutze diese Fläche für zusätzliche Unterlagen, die nicht als feste
                Markdown-Version in Dokumente liegen.
              </p>
              <DocumentFormFields
                form={form}
                setForm={setForm}
                idPrefix="document-create"
              />

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setForm(initialFormState);
                    setIsFormOpen(false);
                  }}
                >
                  Abbrechen
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreate}
                  disabled={!form.title.trim() || !form.document_url.trim() || isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Speichert...
                    </>
                  ) : (
                    "Link speichern"
                  )}
                </Button>
              </div>
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

function LibraryLinkCard({
  documentType,
  linkedDocument,
  options,
  selectedDocumentId,
  onSelect,
  onLink,
  onUnlink,
  isPending,
}: {
  documentType: SourceDocumentType;
  linkedDocument: ApplicationSourceDocument | null;
  options: DocumentPickerOption[];
  selectedDocumentId: string;
  onSelect: (value: string) => void;
  onLink: () => void;
  onUnlink: () => void;
  isPending: boolean;
}) {
  const selectedOption =
    options.find((option) => option.documentId === selectedDocumentId) || null;
  const hasCurrentOptions = options.length > 0;

  return (
    <div className="rounded-[24px] border border-border/80 bg-dark-50/58 p-4">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-heading font-semibold text-dark">
              {getSourceDocumentTypeLabel(documentType)}
            </h4>
            {linkedDocument ? (
              <Badge variant="green">Fixiert</Badge>
            ) : (
              <Badge variant="muted">Noch offen</Badge>
            )}
          </div>
          <p className="text-sm font-body leading-relaxed text-dark-500">
            {linkedDocument
              ? "Diese Bewerbung bleibt auf die unten gezeigte Version festgelegt."
              : "Wähle ein Dokument aus deiner Bibliothek. Beim Verknüpfen wird ein fixer Schnappschuss gespeichert."}
          </p>
        </div>

        {linkedDocument ? (
          <div className="rounded-[22px] border border-border/80 bg-white/86 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-heading font-semibold text-dark">
                {linkedDocument.title_snapshot}
              </p>
              <Badge variant="blue">
                {formatDocumentVersionLabel(
                  linkedDocument.version_number_snapshot,
                  linkedDocument.version_label_snapshot
                )}
              </Badge>
            </div>
            <p className="mt-3 text-sm font-body leading-relaxed text-dark-500">
              {buildDocumentPreview(linkedDocument.markdown_snapshot, 160)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/dokumente/${linkedDocument.source_document_id}`}
                prefetch={false}
                className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-white/88 px-3 py-1.5 text-xs font-heading text-dark-500 transition-colors hover:text-dark"
              >
                In Dokumente öffnen
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        ) : null}

        {hasCurrentOptions ? (
          <>
            <Select
              id={`application-source-document-${documentType}`}
              label={linkedDocument ? "Andere aktuelle Fassung wählen" : "Dokument wählen"}
              value={selectedDocumentId}
              onChange={(event) => onSelect(event.target.value)}
              options={[
                { value: "", label: "Bitte wählen" },
                ...options.map((option) => ({
                  value: option.documentId,
                  label: option.title,
                })),
              ]}
            />

            {selectedOption && (
              <div className="rounded-[22px] border border-border/80 bg-white/86 px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="green">
                    {formatDocumentVersionLabel(
                      selectedOption.currentVersionNumber,
                      selectedOption.currentVersionLabel
                    )}
                  </Badge>
                  <Badge variant="muted">
                    {selectedOption.usageCount} Verwendung
                    {selectedOption.usageCount === 1 ? "" : "en"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-body leading-relaxed text-dark-500">
                  {selectedOption.preview}
                </p>
                {selectedOption.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedOption.tags.map((tag) => (
                      <Badge key={tag} variant="muted">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              {linkedDocument && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onUnlink}
                  disabled={isPending}
                >
                  Verknüpfung lösen
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={onLink}
                disabled={!selectedDocumentId || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Speichert...
                  </>
                ) : linkedDocument ? (
                  "Auf aktuelle Fassung wechseln"
                ) : (
                  "Fix verknüpfen"
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="rounded-[22px] border border-dashed border-border/80 bg-white/78 px-4 py-4">
            <p className="text-sm font-body leading-relaxed text-dark-500">
              In Dokumente ist noch kein {getSourceDocumentTypeLabel(documentType).toLowerCase()} hinterlegt.
            </p>
            <div className="mt-4">
              <Link
                href="/dokumente"
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-xl bg-accent-orange px-4 py-2 text-sm font-heading text-white shadow-card transition-colors hover:bg-orange-500"
              >
                Zu Dokumente
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentFormFields({
  form,
  setForm,
  idPrefix,
}: {
  form: DocumentFormState;
  setForm: Dispatch<SetStateAction<DocumentFormState>>;
  idPrefix: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        id={`${idPrefix}-title`}
        label="Titel *"
        value={form.title}
        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        placeholder="z.B. Portfolio 2026"
      />
      <Select
        id={`${idPrefix}-type`}
        label="Typ"
        options={documentTypeOptions}
        value={form.document_type}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            document_type: e.target.value as ApplicationDocumentType,
          }))
        }
      />
      <div className="sm:col-span-2">
        <Input
          id={`${idPrefix}-url`}
          label="Dokument-Link *"
          type="url"
          value={form.document_url}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, document_url: e.target.value }))
          }
          placeholder="https://..."
        />
      </div>
      <Input
        id={`${idPrefix}-version`}
        label="Version"
        value={form.version_label}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, version_label: e.target.value }))
        }
        placeholder="z.B. V3 / März 2026"
      />
      <div className="sm:col-span-2">
        <Textarea
          id={`${idPrefix}-notes`}
          label="Notizen"
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Was ist an dieser Version anders oder wann wurde sie zuletzt genutzt?"
          rows={4}
        />
      </div>
    </div>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[22px] border border-border/80 bg-white/82 px-4 py-3 shadow-card">
      <div className="flex items-center gap-2 text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-heading font-semibold text-dark">{value}</p>
      <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">{hint}</p>
    </div>
  );
}

function toPayload(form: DocumentFormState): CreateApplicationDocumentInput {
  return {
    title: form.title.trim(),
    document_type: form.document_type,
    document_url: form.document_url.trim(),
    version_label: form.version_label.trim() || undefined,
    notes: form.notes.trim() || undefined,
  };
}

function toFormState(document: ApplicationDocument): DocumentFormState {
  return {
    title: document.title,
    document_type: document.document_type,
    document_url: document.document_url,
    version_label: document.version_label || "",
    notes: document.notes || "",
  };
}
