import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  ExternalLink,
  FileText,
  MapPin,
} from "lucide-react";
import { ActivityTimeline } from "@/components/application/activity-timeline";
import { ApplicationContactsCard } from "@/components/application/application-contacts-card";
import { ApplicationDocumentsCard } from "@/components/application/application-documents-card";
import { ApplicationNotesCard } from "@/components/application/application-notes-card";
import { ApplicationStatusEditor } from "@/components/application/application-status-editor";
import { ApplicationWorkflowCard } from "@/components/application/application-workflow-card";
import { StatusPill } from "@/components/application/status-pill";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CompanyLogo } from "@/components/company/company-logo";
import { cn } from "@/lib/utils/cn";
import {
  formatSalaryRange,
} from "@/lib/utils/applications";
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

interface ApplicationDetailViewProps {
  application: Application;
  activities: Activity[];
  contacts: ApplicationContact[];
  documents: ApplicationDocument[];
}

export function ApplicationDetailView({
  application,
  activities,
  contacts,
  documents,
}: ApplicationDetailViewProps) {
  const domain = application.job_url ? extractDomain(application.job_url) : null;
  const salaryDisplay = formatSalaryRange(
    application.salary_min,
    application.salary_max
  );

  const milestoneRows = [
    { label: "Gemerkt", value: application.date_saved },
    { label: "Beworben", value: application.date_applied },
    { label: "Gespräch", value: application.date_interview },
    { label: "Angebot", value: application.date_offer },
    { label: "Absage", value: application.date_rejected },
  ].filter((item) => item.value);

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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.14fr)_360px]">
        <Card className="section-shell overflow-hidden rounded-[30px]">
          <div className="h-1.5 bg-accent-orange" />
          <CardContent className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-4">
                <div className="flex items-center gap-3">
                  <CompanyLogo
                    companyName={application.company_name}
                    domain={domain}
                    size={52}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-heading text-muted-foreground">
                      {application.company_name}
                    </p>
                    <h1 className="text-2xl font-heading font-semibold text-dark sm:text-[2rem]">
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
              </div>

              <div className="flex flex-col items-start gap-3 text-sm font-heading text-muted-foreground lg:items-end">
                <div className="flex items-center gap-2">
                  <Clock3 size={14} />
                  <span>Zuletzt geändert {relativeDate(application.updated_at)}</span>
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
                    Originale Ausschreibung
                    <ExternalLink size={14} />
                  </Link>
                )}
              </div>
            </div>

            {application.description && (
              <div className="rounded-[24px] border border-border/80 bg-dark-50/72 p-4">
                <p className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
                  Kurzbeschreibung
                </p>
                <p className="text-sm font-body leading-7 text-dark-700">
                  {application.description}
                </p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <OverviewPill
                icon={<Calendar size={14} className="text-accent-orange" />}
                label="Frist"
                value={
                  application.deadline
                    ? formatDateShort(application.deadline)
                    : "Keine Frist"
                }
              />
              <OverviewPill
                icon={<Clock3 size={14} className="text-accent-blue" />}
                label="Nächstes Gespräch"
                value={
                  application.next_interview_at
                    ? formatDateTime(application.next_interview_at)
                    : "Noch offen"
                }
              />
              <OverviewPill
                icon={<FileText size={14} className="text-accent-orange" />}
                label="Unterlagen"
                value={
                  documents.length > 0
                    ? `${documents.length} Datei${documents.length === 1 ? "" : "en"}`
                    : "Noch leer"
                }
              />
            </div>
          </CardContent>
        </Card>

        <ApplicationStatusEditor
          applicationId={application.id}
          currentStatus={application.status}
          companyName={application.company_name}
          roleTitle={application.role_title}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <div className="space-y-6">
          <ActivityTimeline application={application} activities={activities} />
          <ApplicationNotesCard
            applicationId={application.id}
            initialNotes={application.notes}
          />
        </div>

        <div className="space-y-6">
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

          <Card className="rounded-[28px]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-accent-green" />
                <h2 className="text-lg font-heading font-medium text-dark">
                  Überblick
                </h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="Gespeichert" value={formatDate(application.date_saved)} />
              <DetailRow
                label="Zuletzt geändert"
                value={formatDate(application.updated_at)}
              />
              <DetailRow
                label="Bewerbungsfrist"
                value={
                  application.deadline
                    ? formatDateShort(application.deadline)
                    : "Keine Frist hinterlegt"
                }
              />
              <DetailRow
                label="Remote"
                value={application.remote_policy || "Nicht angegeben"}
              />
              <DetailRow
                label="Gehalt"
                value={salaryDisplay || application.salary_note || "Nicht angegeben"}
              />
            </CardContent>
          </Card>

          <Card className="rounded-[28px]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-accent-orange" />
                <h2 className="text-lg font-heading font-medium text-dark">
                  Verlauf der Bewerbung
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

          <ApplicationContactsCard
            applicationId={application.id}
            initialContacts={contacts}
          />
          <ApplicationDocumentsCard
            applicationId={application.id}
            initialDocuments={documents}
          />
        </div>
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

function OverviewPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-border/80 bg-white/80 px-4 py-3 shadow-card">
      <div className="flex items-center gap-2 text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-2xl font-heading font-semibold text-dark">{value}</p>
    </div>
  );
}
