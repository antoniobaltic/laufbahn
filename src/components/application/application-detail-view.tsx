"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  ExternalLink,
  FileText,
  Globe,
  MapPin,
  NotebookPen,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { ActivityTimeline } from "@/components/application/activity-timeline";
import { ApplicationContactsCard } from "@/components/application/application-contacts-card";
import { ApplicationDocumentsCard } from "@/components/application/application-documents-card";
import { ApplicationNotesCard } from "@/components/application/application-notes-card";
import { ApplicationStatusEditor } from "@/components/application/application-status-editor";
import { ApplicationWorkflowCard } from "@/components/application/application-workflow-card";
import { StatusPill } from "@/components/application/status-pill";
import { CompanyLogo } from "@/components/company/company-logo";
import { useReferenceNow } from "@/components/providers/reference-now-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatSalaryRange } from "@/lib/utils/applications";
import {
  formatDate,
  formatDateShort,
  formatDateTime,
  relativeDate,
} from "@/lib/utils/dates";
import { extractDomain } from "@/lib/utils/url";
import type { Activity } from "@/types/activity";
import type { Application } from "@/types/application";
import type {
  ApplicationContact,
  ApplicationDocument,
} from "@/types/application-detail";
import type {
  ApplicationSourceDocument,
  DocumentPickerOption,
} from "@/types/document";

interface ApplicationDetailViewProps {
  application: Application;
  activities: Activity[];
  contacts: ApplicationContact[];
  documents: ApplicationDocument[];
  linkedDocuments: ApplicationSourceDocument[];
  documentPickerOptions: DocumentPickerOption[];
}

type DetailViewId =
  | "ueberblick"
  | "verlauf"
  | "kontakte"
  | "unterlagen"
  | "ausschreibung";

export function ApplicationDetailView({
  application,
  activities,
  contacts,
  documents,
  linkedDocuments,
  documentPickerOptions,
}: ApplicationDetailViewProps) {
  const [activeView, setActiveView] = useState<DetailViewId>("ueberblick");
  const referenceNow = useReferenceNow();
  const domain = extractDomain(
    application.company_website_url || application.job_url || ""
  );
  const salaryDisplay =
    formatSalaryRange(application.salary_min, application.salary_max) ||
    application.salary_note;
  const documentCount = documents.length + linkedDocuments.length;
  const hasJobPosting =
    Boolean(application.description) ||
    Boolean(application.requirements?.length) ||
    Boolean(application.benefits?.length);
  const primaryContact = contacts.find((contact) => contact.is_primary) ?? null;
  const latestActivity = useMemo(
    () =>
      [...activities].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ).at(-1) ?? null,
    [activities]
  );

  const milestoneRows = [
    { label: "Gemerkt", value: application.date_saved },
    { label: "Beworben", value: application.date_applied },
    { label: "Gespräch", value: application.date_interview },
    { label: "Angebot", value: application.date_offer },
    { label: "Absage", value: application.date_rejected },
  ].filter((item) => item.value);

  const detailViews = [
    {
      id: "ueberblick",
      label: "Überblick",
      visible: true,
    },
    {
      id: "verlauf",
      label: `Verlauf${activities.length > 0 ? ` · ${activities.length + 1}` : ""}`,
      visible: true,
    },
    {
      id: "kontakte",
      label: `Kontakte${contacts.length > 0 ? ` · ${contacts.length}` : ""}`,
      visible: true,
    },
    {
      id: "unterlagen",
      label: `Unterlagen${documentCount > 0 ? ` · ${documentCount}` : ""}`,
      visible: true,
    },
    {
      id: "ausschreibung",
      label: "Ausschreibung",
      visible: hasJobPosting,
    },
  ].filter((view) => view.visible) as Array<{
    id: DetailViewId;
    label: string;
  }>;

  const focusModules = [
    {
      id: "verlauf" as const,
      icon: <Clock3 size={15} className="text-accent-orange" />,
      title: "Verlauf",
      value: `${activities.length + 1} Eintrag${
        activities.length + 1 === 1 ? "" : "e"
      }`,
      hint: latestActivity
        ? `${latestActivity.title} · ${relativeDate(latestActivity.created_at, referenceNow)}`
        : "Jede Veränderung bleibt hier nachvollziehbar.",
    },
    {
      id: "kontakte" as const,
      icon: <Users size={15} className="text-accent-green" />,
      title: "Kontakte",
      value:
        contacts.length > 0
          ? `${contacts.length} Person${contacts.length === 1 ? "" : "en"}`
          : "Noch leer",
      hint:
        primaryContact?.full_name ||
        "Lege Ansprechpartner erst dann an, wenn du sie wirklich brauchst.",
    },
    {
      id: "unterlagen" as const,
      icon: <FileText size={15} className="text-accent-blue" />,
      title: "Unterlagen",
      value: documentCount > 0 ? `${documentCount} bereit` : "Noch leer",
      hint:
        linkedDocuments.length > 0
          ? `${linkedDocuments.length} feste Fassung${
              linkedDocuments.length === 1 ? "" : "en"
            } verknüpft`
          : "Lebenslauf und Anschreiben lassen sich hier fest verknüpfen.",
    },
    hasJobPosting
      ? {
          id: "ausschreibung" as const,
          icon: <Workflow size={15} className="text-accent-orange" />,
          title: "Ausschreibung",
          value: "Vorhanden",
          hint: "Anforderungen, Benefits und der Text der Stelle bleiben griffbereit.",
        }
      : {
          id: "ueberblick" as const,
          icon: <NotebookPen size={15} className="text-accent-blue" />,
          title: "Notizen",
          value: application.notes?.trim() ? "Vorhanden" : "Noch offen",
          hint: application.notes?.trim()
            ? "Deine Einschätzung liegt direkt in dieser Bewerbung."
            : "Halte hier fest, was für dich wichtig ist.",
        },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm font-heading text-muted-foreground">
        <Link
          href="/bewerbung"
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/78 px-4 py-2 transition-colors duration-150 hover:bg-white hover:text-dark"
        >
          <ArrowLeft size={14} />
          Zur Liste
        </Link>
        <Link
          href="/board"
          className="inline-flex items-center rounded-full border border-border/80 bg-white/78 px-4 py-2 transition-colors duration-150 hover:bg-white hover:text-dark"
        >
          Zur Übersicht
        </Link>
      </div>

      <section className="surface-stage rounded-[34px] px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] xl:items-stretch">
          <div className="space-y-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-4">
                <div className="flex items-center gap-3">
                  <CompanyLogo
                    companyName={application.company_name}
                    logoUrl={application.company_logo_url}
                    domain={domain}
                    size={56}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-heading text-muted-foreground">
                      {application.company_name}
                    </p>
                    <h1 className="text-3xl font-heading font-semibold leading-[1.02] text-dark sm:text-[2.4rem]">
                      {application.role_title}
                    </h1>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={application.status} className="text-sm" />
                  {application.location && (
                    <Badge variant="muted">
                      <MapPin size={10} className="mr-1" />
                      {application.location}
                    </Badge>
                  )}
                  {application.employment_type && (
                    <Badge variant="blue">{application.employment_type}</Badge>
                  )}
                  {application.remote_policy && (
                    <Badge variant="default">{application.remote_policy}</Badge>
                  )}
                  {salaryDisplay && <Badge variant="green">{salaryDisplay}</Badge>}
                </div>

                <p className="max-w-2xl text-sm font-body leading-relaxed text-dark-500 sm:text-base">
                  {application.notes?.trim()
                    ? application.notes
                    : "Hier zählt zuerst der Stand und der nächste Schritt. Alles Weitere bleibt ordentlich dahinter sortiert."}
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 text-sm font-heading text-muted-foreground lg:items-end">
                <div className="eyebrow-badge">
                  <Clock3 size={12} />
                  Zuletzt geändert {relativeDate(application.updated_at, referenceNow)}
                </div>
                {application.job_url && (
                  <Link
                    href={application.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-white/78 px-4 py-2 text-xs font-heading font-medium text-dark transition-all duration-200",
                      "hover:-translate-y-0.5 hover:bg-white hover:shadow-card-hover"
                    )}
                  >
                    Stellenanzeige öffnen
                    <ExternalLink size={14} />
                  </Link>
                )}
                {application.company_website_url &&
                  application.company_website_url !== application.job_url && (
                    <Link
                      href={application.company_website_url}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-white/78 px-4 py-2 text-xs font-heading font-medium text-dark transition-all duration-200",
                        "hover:-translate-y-0.5 hover:bg-white hover:shadow-card-hover"
                      )}
                    >
                      Unternehmensseite
                      <Globe size={14} />
                    </Link>
                  )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <HeroSignal
                icon={<Calendar size={14} className="text-accent-orange" />}
                label="Frist"
                value={
                  application.deadline
                    ? formatDateShort(application.deadline)
                    : "Keine Frist"
                }
                hint={
                  application.deadline
                    ? relativeDate(application.deadline, referenceNow)
                    : "Nur eintragen, wenn wirklich relevant."
                }
              />
              <HeroSignal
                icon={<Clock3 size={14} className="text-accent-blue" />}
                label="Nächstes Gespräch"
                value={
                  application.next_interview_at
                    ? formatDateTime(application.next_interview_at)
                    : "Noch offen"
                }
                hint={
                  application.next_interview_at
                    ? "Vorbereitung liegt direkt daneben."
                    : "Sobald ein Termin feststeht, taucht er hier auf."
                }
              />
              <HeroSignal
                icon={<Users size={14} className="text-accent-green" />}
                label="Primärer Kontakt"
                value={primaryContact?.full_name || "Noch keiner"}
                hint={primaryContact?.role_title || "Optional, aber schnell erreichbar."}
              />
              <HeroSignal
                icon={<FileText size={14} className="text-accent-orange" />}
                label="Unterlagen"
                value={
                  documentCount > 0
                    ? `${documentCount} Eintrag${documentCount === 1 ? "" : "e"}`
                    : "Noch leer"
                }
                hint={
                  linkedDocuments.length > 0
                    ? `${linkedDocuments.length} feste Fassung${
                        linkedDocuments.length === 1 ? "" : "en"
                      }`
                    : "Unterlagen lassen sich hier fest verknüpfen."
                }
              />
            </div>
          </div>

          <div className="stage-visual rounded-[30px] p-5 text-white">
            <div className="relative z-10 flex h-full flex-col justify-between gap-6">
              <div>
                <p className="text-[11px] font-heading uppercase tracking-[0.14em] text-white/62">
                  Fokus heute
                </p>
                <p className="mt-3 text-2xl font-heading font-semibold leading-tight text-white">
                  {application.next_interview_at
                    ? "Das nächste Gespräch ist sichtbar und gut vorbereitet."
                    : application.deadline
                      ? "Die Frist ist sichtbar. Alles Weitere darf dahinter ruhiger werden."
                      : "Stand und nächste Schritte sind jetzt sauber getrennt."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="marketing-floating-card rounded-[24px] px-4 py-4">
                  <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-white/62">
                    Letzte Bewegung
                  </p>
                  <p className="mt-2 text-sm font-heading font-semibold text-white">
                    {latestActivity?.title || "Noch keine Aktivität"}
                  </p>
                  <p className="mt-2 text-sm font-body leading-relaxed text-white/72">
                    {latestActivity
                      ? `${relativeDate(latestActivity.created_at, referenceNow)}`
                      : "Sobald etwas passiert, taucht es hier auf."}
                  </p>
                </div>
                <div className="marketing-floating-card rounded-[24px] px-4 py-4">
                  <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-white/62">
                    Orientierung
                  </p>
                  <p className="mt-2 text-sm font-heading font-semibold text-white">
                    Öffne nur den Bereich, den du gerade brauchst.
                  </p>
                  <p className="mt-2 text-sm font-body leading-relaxed text-white/72">
                    Verlauf, Kontakte, Unterlagen und Ausschreibung liegen bewusst hinter eigenen Ansichten.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-x-auto pb-1">
        <div className="segmented-control min-w-max">
          {detailViews.map((view) => (
            <button
              key={view.id}
              type="button"
              data-active={activeView === view.id}
              onClick={() => setActiveView(view.id)}
              className="segmented-pill"
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {activeView === "ueberblick" ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {focusModules.map((module) => (
                  <button
                    key={module.title}
                    type="button"
                    onClick={() => setActiveView(module.id)}
                    className="metric-cloud interactive-lift rounded-[26px] p-5 text-left"
                  >
                    <div className="flex items-center gap-2 text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                      {module.icon}
                      {module.title}
                    </div>
                    <p className="mt-3 text-xl font-heading font-semibold text-dark">
                      {module.value}
                    </p>
                    <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">
                      {module.hint}
                    </p>
                  </button>
                ))}
              </div>

              <ApplicationNotesCard
                applicationId={application.id}
                initialNotes={application.notes}
              />

              <ActivityTimeline application={application} activities={activities} />
            </>
          ) : null}

          {activeView === "verlauf" ? (
            <ActivityTimeline application={application} activities={activities} />
          ) : null}

          {activeView === "kontakte" ? (
            <ApplicationContactsCard
              applicationId={application.id}
              initialContacts={contacts}
            />
          ) : null}

          {activeView === "unterlagen" ? (
            <ApplicationDocumentsCard
              applicationId={application.id}
              initialDocuments={documents}
              initialLinkedDocuments={linkedDocuments}
              documentPickerOptions={documentPickerOptions}
            />
          ) : null}

          {activeView === "ausschreibung" ? (
            hasJobPosting ? (
              <JobPostingCard application={application} />
            ) : (
              <Card className="rounded-[30px]">
                <CardContent className="px-5 py-5 sm:px-6 sm:py-6">
                  <p className="text-sm font-body leading-relaxed text-dark-500">
                    Zu dieser Bewerbung liegt noch kein Text aus der Stellenanzeige vor.
                  </p>
                </CardContent>
              </Card>
            )
          ) : null}
        </div>

        <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <ApplicationStatusEditor
            applicationId={application.id}
            currentStatus={application.status}
            currentPositionInColumn={application.position_in_column}
            dateSaved={application.date_saved}
            dateApplied={application.date_applied}
            dateInterview={application.date_interview}
            dateOffer={application.date_offer}
            dateRejected={application.date_rejected}
            companyName={application.company_name}
            roleTitle={application.role_title}
          />

          <ApplicationWorkflowCard
            key={application.updated_at}
            applicationId={application.id}
            currentStatus={application.status}
            deadline={application.deadline}
            deadlineNote={application.deadline_note}
            nextInterviewAt={application.next_interview_at}
            interviewFormat={application.interview_format}
            interviewLocation={application.interview_location}
            interviewPrep={application.interview_prep}
          />

          <Card className="surface-rail rounded-[30px]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent-orange" />
                <h2 className="text-lg font-heading font-medium text-dark">
                  Kurzüberblick
                </h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                label="Gespeichert"
                value={formatDate(application.date_saved)}
              />
              <DetailRow
                label="Zuletzt geändert"
                value={formatDate(application.updated_at)}
              />
              <DetailRow
                label="Arbeitsort"
                value={application.remote_policy || "Nicht angegeben"}
              />
              <DetailRow
                label="Gehalt"
                value={salaryDisplay || application.salary_note || "Nicht angegeben"}
              />
            </CardContent>
          </Card>

          <Card className="surface-rail rounded-[30px]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-accent-orange" />
                <h2 className="text-lg font-heading font-medium text-dark">
                  Wichtige Zeitpunkte
                </h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {milestoneRows.length > 0 ? (
                milestoneRows.map((milestone) => (
                  <DetailRow
                    key={milestone.label}
                    label={milestone.label}
                    value={formatDate(milestone.value!)}
                  />
                ))
              ) : (
                <p className="text-sm font-body text-muted-foreground">
                  Sobald sich der Stand ändert, erscheinen die wichtigsten Zeitpunkte hier automatisch.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HeroSignal({
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
    <div className="metric-cloud rounded-[24px] px-4 py-4">
      <div className="flex items-center gap-2 text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-lg font-heading font-semibold text-dark">{value}</p>
      <p className="mt-2 text-sm font-body leading-relaxed text-dark-500">{hint}</p>
    </div>
  );
}

function JobPostingCard({ application }: { application: Application }) {
  if (
    !application.description &&
    (!application.requirements || application.requirements.length === 0) &&
    (!application.benefits || application.benefits.length === 0)
  ) {
    return null;
  }

  return (
    <Card className="rounded-[30px]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-accent-orange" />
          <h2 className="text-xl font-heading font-medium text-dark">
            Aus der Ausschreibung
          </h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {application.requirements && application.requirements.length > 0 && (
          <JobSection label="Anforderungen" items={application.requirements} />
        )}

        {application.benefits && application.benefits.length > 0 && (
          <JobSection label="Benefits" items={application.benefits} />
        )}

        {application.description && (
          <div className="space-y-2">
            <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
              Vollständiger Ausschreibungstext
            </p>
            <div className="rounded-[24px] border border-border/70 bg-dark-50/60 p-4 text-sm font-body leading-7 whitespace-pre-line text-dark-700">
              {application.description}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function JobSection({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <div className="grid gap-2">
        {items.map((item) => (
          <div
            key={`${label}-${item}`}
            className="rounded-[18px] border border-border/70 bg-white/80 px-4 py-3 text-sm font-body leading-relaxed text-dark-700"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs font-heading uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm font-heading text-dark">{value}</span>
    </div>
  );
}
