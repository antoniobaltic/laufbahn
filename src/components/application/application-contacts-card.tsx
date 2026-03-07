"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Loader2,
  Mail,
  PencilLine,
  Phone,
  Plus,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  createApplicationContact,
  deleteApplicationContact,
  updateApplicationContact,
} from "@/actions/applications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type {
  ApplicationContact,
  CreateApplicationContactInput,
} from "@/types/application-detail";

interface ApplicationContactsCardProps {
  applicationId: string;
  initialContacts: ApplicationContact[];
}

interface ContactFormState {
  full_name: string;
  role_title: string;
  email: string;
  phone: string;
  linkedin_url: string;
  notes: string;
  is_primary: boolean;
}

const initialFormState: ContactFormState = {
  full_name: "",
  role_title: "",
  email: "",
  phone: "",
  linkedin_url: "",
  notes: "",
  is_primary: false,
};

export function ApplicationContactsCard({
  applicationId,
  initialContacts,
}: ApplicationContactsCardProps) {
  const [contacts, setContacts] = useState(sortContacts(initialContacts));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState(initialFormState);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setContacts(sortContacts(initialContacts));
  }, [initialContacts]);

  const primaryContact = contacts.find((contact) => contact.is_primary) ?? null;

  const syncUpdatedContact = (updated: ApplicationContact) => {
    setContacts((prev) =>
      sortContacts(
        prev.map((contact) => {
          if (contact.id === updated.id) {
            return updated;
          }

          if (updated.is_primary && contact.is_primary) {
            return { ...contact, is_primary: false };
          }

          return contact;
        })
      )
    );
  };

  const handleCreate = () => {
    const payload = toPayload(form);

    startTransition(async () => {
      try {
        const created = await createApplicationContact(applicationId, payload);
        setContacts((prev) =>
          sortContacts(
            created.is_primary
              ? prev
                  .map((contact) => ({ ...contact, is_primary: false }))
                  .concat(created)
              : prev.concat(created)
          )
        );
        setForm(initialFormState);
        setIsFormOpen(false);
        toast("Kontakt gespeichert", "success");
        router.refresh();
      } catch {
        toast("Kontakt konnte nicht gespeichert werden", "error");
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
        const updated = await updateApplicationContact(
          editingId,
          applicationId,
          payload
        );
        syncUpdatedContact(updated);
        setEditingId(null);
        setEditingForm(initialFormState);
        toast("Kontakt aktualisiert", "success");
        router.refresh();
      } catch {
        toast("Kontakt konnte nicht aktualisiert werden", "error");
      }
    });
  };

  const handleMarkPrimary = (contact: ApplicationContact) => {
    if (contact.is_primary) {
      return;
    }

    startTransition(async () => {
      try {
        const updated = await updateApplicationContact(contact.id, applicationId, {
          full_name: contact.full_name,
          role_title: contact.role_title || undefined,
          email: contact.email || undefined,
          phone: contact.phone || undefined,
          linkedin_url: contact.linkedin_url || undefined,
          notes: contact.notes || undefined,
          is_primary: true,
        });
        syncUpdatedContact(updated);
        toast("Primärer Kontakt gesetzt", "success");
        router.refresh();
      } catch {
        toast("Primärer Kontakt konnte nicht gesetzt werden", "error");
      }
    });
  };

  const handleDelete = (contactId: string) => {
    startTransition(async () => {
      try {
        await deleteApplicationContact(contactId, applicationId);
        setContacts((prev) => prev.filter((contact) => contact.id !== contactId));

        if (editingId === contactId) {
          setEditingId(null);
          setEditingForm(initialFormState);
        }

        toast("Kontakt entfernt", "success");
        router.refresh();
      } catch {
        toast("Kontakt konnte nicht entfernt werden", "error");
      }
    });
  };

  const openEdit = (contact: ApplicationContact) => {
    setIsFormOpen(false);
    setEditingId(contact.id);
    setEditingForm(toFormState(contact));
  };

  return (
    <Card className="rounded-[28px]">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UserRound size={16} className="text-accent-green" />
              <h2 className="text-lg font-heading font-medium text-dark">
                Kontakte
              </h2>
            </div>
            <p className="text-sm font-body leading-relaxed text-dark-500">
              Halte Ansprechpartner, Mailwege und Kontext in derselben Bewerbung
              zusammen.
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
            Kontakt hinzufügen
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryTile
              icon={<Star size={14} className="text-accent-orange" />}
              label="Primärer Kontakt"
              value={primaryContact?.full_name || "Noch nicht festgelegt"}
              hint={
                primaryContact?.role_title ||
                "Markiere die wichtigste Person für schnellere Follow-ups."
              }
            />
            <SummaryTile
              icon={<UserRound size={14} className="text-accent-green" />}
              label="Kontaktstand"
              value={`${contacts.length} ${contacts.length === 1 ? "Person" : "Personen"}`}
              hint="Mail, Telefon und Profil-Links bleiben direkt erreichbar."
            />
          </div>
        )}

        {contacts.length > 0 ? (
          <div className="space-y-3">
            {contacts.map((contact) => {
              const isEditing = editingId === contact.id;

              return (
                <div
                  key={contact.id}
                  className="surface-muted rounded-[24px] p-4 transition-all duration-200 hover:shadow-card"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-heading font-semibold text-dark">
                            {contact.full_name}
                          </h3>
                          {contact.is_primary && (
                            <Badge variant="green">Primär</Badge>
                          )}
                        </div>
                        {contact.role_title && (
                          <p className="mt-1 text-sm font-body text-dark-500">
                            {contact.role_title}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {!contact.is_primary && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleMarkPrimary(contact)}
                            disabled={isPending}
                          >
                            <Star size={14} />
                            Primär
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(contact)}
                          disabled={isPending}
                        >
                          <PencilLine size={14} />
                          Bearbeiten
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDelete(contact.id)}
                          disabled={isPending}
                          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-white/90 px-3 py-1.5 text-xs font-heading text-dark-500 transition-colors hover:text-dark"
                        >
                          <Mail size={12} />
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-white/90 px-3 py-1.5 text-xs font-heading text-dark-500 transition-colors hover:text-dark"
                        >
                          <Phone size={12} />
                          {contact.phone}
                        </a>
                      )}
                      {contact.linkedin_url && (
                        <a
                          href={contact.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-white/90 px-3 py-1.5 text-xs font-heading text-dark-500 transition-colors hover:text-dark"
                        >
                          <Globe size={12} />
                          Profil
                        </a>
                      )}
                    </div>

                    {contact.notes && (
                      <p className="text-sm font-body leading-relaxed text-dark-500">
                        {contact.notes}
                      </p>
                    )}

                    {isEditing && (
                      <div className="rounded-[22px] border border-border/70 bg-white/86 p-4 shadow-card">
                        <ContactFormFields
                          form={editingForm}
                          setForm={setEditingForm}
                          idPrefix={`contact-edit-${contact.id}`}
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
                            disabled={!editingForm.full_name.trim() || isPending}
                          >
                            {isPending ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Speichert...
                              </>
                            ) : (
                              "Kontakt aktualisieren"
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
              Noch keine Kontakte hinterlegt. Starte mit der Person, mit der du
              zuletzt geschrieben oder gesprochen hast.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-heading text-muted-foreground">
              <span className="rounded-full border border-border/80 bg-white/82 px-3 py-1.5">
                Recruiter
              </span>
              <span className="rounded-full border border-border/80 bg-white/82 px-3 py-1.5">
                Hiring Manager
              </span>
              <span className="rounded-full border border-border/80 bg-white/82 px-3 py-1.5">
                Interviewpartner
              </span>
            </div>
            {!isFormOpen && (
              <div className="mt-4">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsFormOpen(true)}
                >
                  <Plus size={14} />
                  Ersten Kontakt anlegen
                </Button>
              </div>
            )}
          </div>
        )}

        {isFormOpen && (
          <div className="surface-muted rounded-[24px] p-4 sm:p-5">
            <p className="mb-4 text-sm font-body leading-relaxed text-dark-500">
              Ein Name reicht für den Start. Mail, Telefon und Notizen kannst du
              später ergänzen.
            </p>
            <ContactFormFields
              form={form}
              setForm={setForm}
              idPrefix="contact-create"
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
                disabled={!form.full_name.trim() || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Speichert...
                  </>
                ) : (
                  "Kontakt speichern"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContactFormFields({
  form,
  setForm,
  idPrefix,
}: {
  form: ContactFormState;
  setForm: Dispatch<SetStateAction<ContactFormState>>;
  idPrefix: string;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id={`${idPrefix}-name`}
          label="Name *"
          value={form.full_name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, full_name: e.target.value }))
          }
          placeholder="z.B. Lisa Bauer"
        />
        <Input
          id={`${idPrefix}-role`}
          label="Rolle"
          value={form.role_title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, role_title: e.target.value }))
          }
          placeholder="z.B. Recruiting Lead"
        />
        <Input
          id={`${idPrefix}-email`}
          label="E-Mail"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="name@firma.de"
        />
        <Input
          id={`${idPrefix}-phone`}
          label="Telefon"
          value={form.phone}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, phone: e.target.value }))
          }
          placeholder="+43 ..."
        />
        <div className="sm:col-span-2">
          <Input
            id={`${idPrefix}-linkedin`}
            label="LinkedIn / Profil-Link"
            value={form.linkedin_url}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, linkedin_url: e.target.value }))
            }
            placeholder="https://linkedin.com/in/..."
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            id={`${idPrefix}-notes`}
            label="Notizen"
            value={form.notes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Was ist wichtig an dieser Person oder dem letzten Austausch?"
            rows={4}
          />
        </div>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm font-heading text-dark">
        <input
          type="checkbox"
          checked={form.is_primary}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, is_primary: e.target.checked }))
          }
          className="h-4 w-4 rounded border border-border text-accent-orange focus:ring-accent-orange"
        />
        Als primären Kontakt markieren
      </label>
    </>
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

function toPayload(form: ContactFormState): CreateApplicationContactInput {
  return {
    full_name: form.full_name.trim(),
    role_title: form.role_title.trim() || undefined,
    email: form.email.trim() || undefined,
    phone: form.phone.trim() || undefined,
    linkedin_url: form.linkedin_url.trim() || undefined,
    notes: form.notes.trim() || undefined,
    is_primary: form.is_primary,
  };
}

function toFormState(contact: ApplicationContact): ContactFormState {
  return {
    full_name: contact.full_name,
    role_title: contact.role_title || "",
    email: contact.email || "",
    phone: contact.phone || "",
    linkedin_url: contact.linkedin_url || "",
    notes: contact.notes || "",
    is_primary: contact.is_primary,
  };
}

function sortContacts(contacts: ApplicationContact[]) {
  return [...contacts].sort((a, b) => {
    if (a.is_primary === b.is_primary) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }

    return a.is_primary ? -1 : 1;
  });
}
