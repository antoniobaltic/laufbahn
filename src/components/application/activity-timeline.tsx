import type { ComponentType } from "react";
import {
  AlarmClockCheck,
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  Clock3,
  FileText,
  NotebookPen,
  PencilLine,
  UserRoundPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusPill } from "@/components/application/status-pill";
import {
  getDocumentTypeLabel,
  getStatusColors,
  getStatusLabel,
} from "@/lib/utils/applications";
import type { Activity } from "@/types/activity";
import type { ApplicationDocumentType } from "@/types/application-detail";
import type { Application } from "@/types/application";
import type { ApplicationStatus } from "@/lib/utils/constants";
import { formatDateShort, formatDateTime } from "@/lib/utils/dates";

interface ActivityTimelineProps {
  application: Application;
  activities: Activity[];
}

interface TimelineEntry {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status?: ApplicationStatus;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
}

function buildTimeline(application: Application, activities: Activity[]): TimelineEntry[] {
  const createdEntry: TimelineEntry = {
    id: `created-${application.id}`,
    title: "Bewerbung angelegt",
    description: `${application.company_name} wurde als ${getStatusLabel("gemerkt")} gespeichert.`,
    createdAt: application.created_at,
    status: "gemerkt",
    icon: BriefcaseBusiness,
    color: "var(--color-status-gemerkt)",
  };

  const activityEntries = activities.map<TimelineEntry>((activity) => {
    if (activity.activity_type === "status_change") {
      const oldStatus = activity.metadata?.old_status as ApplicationStatus | undefined;
      const newStatus = activity.metadata?.new_status as ApplicationStatus | undefined;

      return {
        id: activity.id,
        title: "Status geändert",
        description:
          oldStatus && newStatus
            ? `Von ${getStatusLabel(oldStatus)} zu ${getStatusLabel(newStatus)}`
            : activity.title,
        createdAt: activity.created_at,
        status: newStatus,
        icon: ArrowRight,
        color: newStatus
          ? getStatusColors(newStatus).color
          : "var(--color-mid-gray)",
      };
    }

    if (activity.activity_type === "note_added") {
      return {
        id: activity.id,
        title: activity.title,
        description:
          typeof activity.metadata?.note_excerpt === "string"
            ? activity.metadata.note_excerpt
            : "Es wurde eine Notiz ergänzt.",
        createdAt: activity.created_at,
        icon: NotebookPen,
        color: "var(--color-accent-blue)",
      };
    }

    if (activity.activity_type === "deadline_set") {
      const deadline = activity.metadata?.deadline;
      const deadlineNote = activity.metadata?.deadline_note;

      return {
        id: activity.id,
        title: activity.title,
        description:
          typeof deadline === "string"
            ? [
                `Frist bis ${formatDateShort(deadline)}`,
                typeof deadlineNote === "string" ? deadlineNote : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : activity.title,
        createdAt: activity.created_at,
        icon: AlarmClockCheck,
        color: "var(--color-accent-orange)",
      };
    }

    if (activity.activity_type === "interview_scheduled") {
      const interviewAt = activity.metadata?.interview_at;
      const interviewFormat = activity.metadata?.interview_format;
      const interviewLocation = activity.metadata?.interview_location;

      return {
        id: activity.id,
        title: activity.title,
        description:
          typeof interviewAt === "string"
            ? [
                formatDateTime(interviewAt),
                typeof interviewFormat === "string" ? interviewFormat : null,
                typeof interviewLocation === "string" ? interviewLocation : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : activity.title,
        createdAt: activity.created_at,
        icon: CalendarClock,
        color: "var(--color-status-gespraech)",
      };
    }

    if (
      activity.activity_type === "contact_added" ||
      activity.activity_type === "contact_updated"
    ) {
      const name = activity.metadata?.contact_name;
      const role = activity.metadata?.contact_role;
      const isUpdated = activity.activity_type === "contact_updated";

      return {
        id: activity.id,
        title: isUpdated ? "Kontakt aktualisiert" : "Kontakt hinzugefügt",
        description:
          typeof name === "string"
            ? role
              ? `${name} · ${role}`
              : name
            : activity.title,
        createdAt: activity.created_at,
        icon: isUpdated ? PencilLine : UserRoundPlus,
        color: isUpdated
          ? "var(--color-accent-blue)"
          : "var(--color-accent-green)",
      };
    }

    if (
      activity.activity_type === "document_uploaded" ||
      activity.activity_type === "document_updated" ||
      activity.activity_type === "document_removed"
    ) {
      const documentTitle = activity.metadata?.document_title;
      const documentType = activity.metadata?.document_type;
      const versionLabel = activity.metadata?.version_label;
      const isUpdated = activity.activity_type === "document_updated";
      const isRemoved = activity.activity_type === "document_removed";

      return {
        id: activity.id,
        title: isRemoved
          ? "Dokument entfernt"
          : isUpdated
            ? "Dokument aktualisiert"
            : "Dokument hinzugefügt",
        description:
          typeof documentTitle === "string"
            ? [
                documentTitle,
                typeof documentType === "string"
                  ? getDocumentTypeLabel(documentType as ApplicationDocumentType)
                  : null,
                typeof versionLabel === "string" ? versionLabel : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : activity.title,
        createdAt: activity.created_at,
        icon: isRemoved ? FileText : isUpdated ? PencilLine : FileText,
        color: isRemoved
          ? "var(--color-mid-gray)"
          : isUpdated
            ? "var(--color-accent-blue)"
            : "var(--color-accent-orange)",
      };
    }

    return {
      id: activity.id,
      title: activity.title,
      description: activity.title,
      createdAt: activity.created_at,
      icon: ArrowRight,
      color: "var(--color-mid-gray)",
    };
  });

  return [createdEntry, ...activityEntries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function ActivityTimeline({
  application,
  activities,
}: ActivityTimelineProps) {
  const timeline = buildTimeline(application, activities);

  return (
    <Card className="rounded-[28px]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Clock3 size={16} className="text-accent-orange" />
          <h2 className="text-lg font-heading font-medium text-dark">Verlauf</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {timeline.map((entry, index) => {
          const lineVisible = index < timeline.length - 1;
          const Icon = entry.icon;

          return (
            <div key={entry.id} className="relative pl-8">
              <span
                className="absolute left-0 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white shadow-card"
                style={{ color: entry.color }}
              >
                <Icon size={14} />
              </span>
              {lineVisible && (
                <span className="absolute left-4 top-11 h-[calc(100%+0.55rem)] w-px bg-border" />
              )}
              <div className="rounded-[22px] border border-border/80 bg-dark-50/72 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-heading font-medium text-dark">
                      {entry.title}
                    </p>
                    <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">
                      {entry.description}
                    </p>
                  </div>
                  {entry.status && <StatusPill status={entry.status} />}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs font-heading text-muted-foreground">
                  <Clock3 size={12} />
                  <span>{formatDateTime(entry.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
