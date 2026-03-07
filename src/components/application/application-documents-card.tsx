"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { getDocumentTypeLabel } from "@/lib/utils/applications";
import type {
  ApplicationDocument,
  ApplicationDocumentType,
  CreateApplicationDocumentInput,
} from "@/types/application-detail";

interface ApplicationDocumentsCardProps {
  applicationId: string;
  initialDocuments: ApplicationDocument[];
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
}: ApplicationDocumentsCardProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [isFormOpen, setIsFormOpen] = useState(initialDocuments.length === 0);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState(initialFormState);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  const documentChecklist = useMemo(() => {
    const hasType = (type: ApplicationDocumentType) =>
      documents.some((document) => document.document_type === type);

    return [
      { label: "Lebenslauf", complete: hasType("lebenslauf") },
      { label: "Anschreiben", complete: hasType("anschreiben") },
      {
        label: "Portfolio / Arbeitsprobe",
        complete: hasType("portfolio") || hasType("arbeitsprobe"),
      },
    ];
  }, [documents]);

  const completedChecklistItems = documentChecklist.filter(
    (item) => item.complete
  ).length;

  const latestDocument = documents[0] ?? null;

  const handleCreate = () => {
    const payload = toPayload(form);

    startTransition(async () => {
      try {
        const created = await createApplicationDocument(applicationId, payload);
        setDocuments((prev) => [created, ...prev]);
        setForm(initialFormState);
        setIsFormOpen(false);
        toast("Dokument gespeichert", "success");
        router.refresh();
      } catch {
        toast("Dokument konnte nicht gespeichert werden", "error");
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
        toast("Dokument aktualisiert", "success");
        router.refresh();
      } catch {
        toast("Dokument konnte nicht aktualisiert werden", "error");
      }
    });
  };

  const handleDelete = (documentId: string) => {
    startTransition(async () => {
      try {
        await deleteApplicationDocument(documentId, applicationId);
        setDocuments((prev) =>
          prev.filter((document) => document.id !== documentId)
        );

        if (editingId === documentId) {
          setEditingId(null);
          setEditingForm(initialFormState);
        }

        toast("Dokument entfernt", "success");
        router.refresh();
      } catch {
        toast("Dokument konnte nicht entfernt werden", "error");
      }
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
                Dokumente
              </h2>
            </div>
            <p className="text-sm font-body leading-relaxed text-dark-500">
              Halte Versionen, Links und das Bewerbungs-Set an einem Ort bereit.
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
            Dokument
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryTile
            icon={<Sparkles size={14} className="text-accent-orange" />}
            label="Dokumenten-Set"
            value={`${completedChecklistItems}/3 bereit`}
            hint={
              completedChecklistItems === documentChecklist.length
                ? "Die wichtigsten Unterlagen sind hinterlegt."
                : "Ergänze die fehlenden Kernunterlagen für schnellere Bewerbungen."
            }
          />
          <SummaryTile
            icon={<FileText size={14} className="text-accent-blue" />}
            label="Zuletzt ergänzt"
            value={latestDocument?.title || "Noch kein Dokument"}
            hint={
              latestDocument?.version_label ||
              "Drive-, Notion-, PDF- oder Figma-Links funktionieren gut."
            }
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
                          <h3 className="truncate text-sm font-heading font-semibold text-dark">
                            {document.title}
                          </h3>
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
                              "Dokument aktualisieren"
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
          <div className="rounded-[22px] border border-dashed border-border bg-dark-50/70 p-5">
            <p className="text-sm font-body leading-relaxed text-dark-500">
              Noch keine Dokumente hinterlegt. Speichere Lebenslauf, Portfolio
              oder Referenzen direkt an der Bewerbung.
            </p>
          </div>
        )}

        {isFormOpen && (
          <div className="surface-muted rounded-[24px] p-4 sm:p-5">
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
                  "Dokument speichern"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
