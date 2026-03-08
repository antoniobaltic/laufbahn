"use client";

import type { ReactNode } from "react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlarmClockCheck,
  CalendarClock,
  Loader2,
  Sparkles,
  SquarePen,
} from "lucide-react";
import {
  updateApplicationDeadline,
  updateApplicationInterview,
} from "@/actions/applications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { ApplicationStatus } from "@/lib/utils/constants";
import {
  formatDateInputValue,
  formatDateShort,
  formatDateTime,
  formatDateTimeInputValue,
  getCalendarDayDifference,
  relativeDate,
  toTimestamp,
} from "@/lib/utils/dates";
import type { Application } from "@/types/application";

interface ApplicationWorkflowCardProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
  deadline: Application["deadline"];
  deadlineNote: Application["deadline_note"];
  nextInterviewAt: Application["next_interview_at"];
  interviewFormat: Application["interview_format"];
  interviewLocation: Application["interview_location"];
  interviewPrep: Application["interview_prep"];
}

const interviewFormatOptions = [
  { value: "Videocall", label: "Videocall" },
  { value: "Vor Ort", label: "Vor Ort" },
  { value: "Telefon", label: "Telefon" },
  { value: "Case Study", label: "Case Study" },
  { value: "Panel", label: "Panel" },
];

export function ApplicationWorkflowCard({
  applicationId,
  currentStatus,
  deadline,
  deadlineNote,
  nextInterviewAt,
  interviewFormat,
  interviewLocation,
  interviewPrep,
}: ApplicationWorkflowCardProps) {
  const [referenceNow] = useState(() => new Date());
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [deadlineDraft, setDeadlineDraft] = useState(
    deadline ? formatDateInputValue(deadline) : ""
  );
  const [deadlineNoteDraft, setDeadlineNoteDraft] = useState(deadlineNote || "");
  const [isEditingInterview, setIsEditingInterview] = useState(false);
  const [interviewAtDraft, setInterviewAtDraft] = useState(
    nextInterviewAt ? formatDateTimeInputValue(nextInterviewAt) : ""
  );
  const [interviewFormatDraft, setInterviewFormatDraft] = useState(
    interviewFormat || ""
  );
  const [interviewLocationDraft, setInterviewLocationDraft] = useState(
    interviewLocation || ""
  );
  const [interviewPrepDraft, setInterviewPrepDraft] = useState(
    interviewPrep || ""
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const deadlineDirty =
    deadlineDraft !== (deadline ? formatDateInputValue(deadline) : "") ||
    deadlineNoteDraft.trim() !== (deadlineNote || "").trim();

  const interviewDirty =
    interviewAtDraft !==
      (nextInterviewAt ? formatDateTimeInputValue(nextInterviewAt) : "") ||
    interviewFormatDraft !== (interviewFormat || "") ||
    interviewLocationDraft.trim() !== (interviewLocation || "").trim() ||
    interviewPrepDraft.trim() !== (interviewPrep || "").trim();

  const deadlineState = useMemo(
    () => getDeadlineState(deadline, referenceNow),
    [deadline, referenceNow]
  );
  const interviewState = useMemo(
    () => getInterviewState(nextInterviewAt, referenceNow),
    [nextInterviewAt, referenceNow]
  );
  const showInterviewStatusHint =
    Boolean(nextInterviewAt) &&
    !["im_gespraech", "angebot", "abgelehnt", "ghosted"].includes(currentStatus);
  const nextTrigger = useMemo(
    () => getNextTrigger(deadline, nextInterviewAt, referenceNow),
    [deadline, nextInterviewAt, referenceNow]
  );

  const handleDeadlineSave = () => {
    startTransition(async () => {
      try {
        await updateApplicationDeadline(applicationId, {
          deadline: deadlineDraft || null,
          deadline_note: deadlineNoteDraft,
        });
        toast("Frist gespeichert", "success");
        setIsEditingDeadline(false);
        router.refresh();
      } catch {
        toast("Frist konnte nicht gespeichert werden", "error");
      }
    });
  };

  const handleInterviewSave = () => {
    startTransition(async () => {
      try {
        await updateApplicationInterview(applicationId, {
          next_interview_at: interviewAtDraft || null,
          interview_format: interviewFormatDraft || undefined,
          interview_location: interviewLocationDraft || undefined,
          interview_prep: interviewPrepDraft || undefined,
        });
        toast("Gespräch gespeichert", "success");
        setIsEditingInterview(false);
        router.refresh();
      } catch {
        toast("Gespräch konnte nicht gespeichert werden", "error");
      }
    });
  };

  return (
    <Card className="surface-rail rounded-[30px]">
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CalendarClock size={16} className="text-status-gespraech" />
            <h2 className="text-xl font-heading font-medium text-dark">
              Nächster Schritt
            </h2>
          </div>
          <p className="text-sm font-body leading-relaxed text-dark-500">
            Fristen, Gespräche und Vorbereitung liegen bewusst kompakt zusammen.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryTile
            icon={<AlarmClockCheck size={14} className="text-accent-orange" />}
            label="Als Nächstes wichtig"
            value={nextTrigger.value}
            hint={nextTrigger.hint}
            badge={
              nextTrigger.variant ? (
                <Badge variant={nextTrigger.variant}>{nextTrigger.badge}</Badge>
              ) : null
            }
          />
          <SummaryTile
            icon={<Sparkles size={14} className="text-accent-blue" />}
            label="Vorbereitung"
            value={
              nextInterviewAt
                ? interviewPrep?.trim()
                  ? "Vorbereitung steht"
                  : "Vorbereitung fehlt"
                : "Noch kein Termin"
            }
            hint={
              nextInterviewAt
                ? interviewPrep?.trim()
                  ? "Fragen, Beispiele und To-dos sind schon notiert."
                  : "Lege die wichtigsten Punkte vor dem Gespräch fest."
                : "Sobald ein Gespräch ansteht, taucht es hier automatisch auf."
            }
            badge={
              nextInterviewAt ? (
                <Badge
                  variant={interviewPrep?.trim() ? "green" : "orange"}
                >
                  {interviewPrep?.trim() ? "Bereit" : "Fehlt"}
                </Badge>
              ) : null
            }
          />
        </div>

        <div className="rounded-[24px] border border-border/80 bg-dark-50/72 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlarmClockCheck size={15} className="text-accent-orange" />
                <h3 className="text-sm font-heading font-semibold text-dark">
                  Frist
                </h3>
              </div>
              <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">
                Trage ein, bis wann du reagieren oder Unterlagen fertig haben musst.
              </p>
            </div>
            {!isEditingDeadline && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingDeadline(true)}
              >
                <SquarePen size={14} />
                Bearbeiten
              </Button>
            )}
          </div>

          {isEditingDeadline ? (
            <div className="mt-4 space-y-4 rounded-[20px] border border-border/70 bg-white/86 p-4 shadow-card">
              <Input
                label="Frist"
                type="date"
                value={deadlineDraft}
                onChange={(e) => setDeadlineDraft(e.target.value)}
              />
              <Textarea
                label="Hinweis zur Frist"
                value={deadlineNoteDraft}
                onChange={(e) => setDeadlineNoteDraft(e.target.value)}
                rows={4}
                placeholder="Was muss bis dahin fertig sein? Welche Unterlagen fehlen noch?"
              />
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setDeadlineDraft(deadline ? formatDateInputValue(deadline) : "");
                    setDeadlineNoteDraft(deadlineNote || "");
                    setIsEditingDeadline(false);
                  }}
                >
                  Abbrechen
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDeadlineSave}
                  disabled={!deadlineDirty || isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Speichert...
                    </>
                  ) : (
                    "Frist speichern"
                  )}
                </Button>
              </div>
            </div>
          ) : deadline ? (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={deadlineState.variant}>
                  {deadlineState.badge}
                </Badge>
                <Badge variant="muted">{formatDateShort(deadline)}</Badge>
                <Badge variant="default">{relativeDate(deadline)}</Badge>
              </div>
              {deadlineNote ? (
                <p className="text-sm font-body leading-relaxed text-dark-500">
                  {deadlineNote}
                </p>
              ) : (
                <p className="text-sm font-body text-muted-foreground">
                  Kein zusätzlicher Hinweis zur Frist hinterlegt.
                </p>
              )}
            </div>
          ) : (
            <EmptyWorkflowState
              body="Noch keine Frist hinterlegt. Sobald du eine Deadline kennst, erscheint sie hier direkt im Überblick."
              actionLabel="Frist ergänzen"
              onAction={() => setIsEditingDeadline(true)}
            />
          )}
        </div>

        <div className="rounded-[24px] border border-border/80 bg-dark-50/72 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarClock size={15} className="text-status-gespraech" />
                <h3 className="text-sm font-heading font-semibold text-dark">
                  Nächstes Gespräch
                </h3>
              </div>
              <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">
                Termin, Format und Vorbereitung bleiben direkt bei der Bewerbung.
              </p>
            </div>
            {!isEditingInterview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingInterview(true)}
              >
                <SquarePen size={14} />
                Bearbeiten
              </Button>
            )}
          </div>

          {isEditingInterview ? (
            <div className="mt-4 space-y-4 rounded-[20px] border border-border/70 bg-white/86 p-4 shadow-card">
              <Input
                label="Gesprächstermin"
                type="datetime-local"
                value={interviewAtDraft}
                onChange={(e) => setInterviewAtDraft(e.target.value)}
              />
              <Select
                label="Format"
                options={interviewFormatOptions}
                placeholder="Wählen..."
                value={interviewFormatDraft}
                onChange={(e) => setInterviewFormatDraft(e.target.value)}
              />
              <Input
                label="Ort oder Link"
                value={interviewLocationDraft}
                onChange={(e) => setInterviewLocationDraft(e.target.value)}
                placeholder="z.B. Google Meet, Musterstraße 1, Office Berlin"
              />
              <Textarea
                label="Prep-Notizen"
                value={interviewPrepDraft}
                onChange={(e) => setInterviewPrepDraft(e.target.value)}
                rows={5}
                placeholder="Welche Stories, Fragen, Cases oder Unterlagen willst du vorbereiten?"
              />
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setInterviewAtDraft(
                      nextInterviewAt ? formatDateTimeInputValue(nextInterviewAt) : ""
                    );
                    setInterviewFormatDraft(interviewFormat || "");
                    setInterviewLocationDraft(interviewLocation || "");
                    setInterviewPrepDraft(interviewPrep || "");
                    setIsEditingInterview(false);
                  }}
                >
                  Abbrechen
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleInterviewSave}
                  disabled={!interviewDirty || isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Speichert...
                    </>
                  ) : (
                    "Gespräch speichern"
                  )}
                </Button>
              </div>
            </div>
          ) : nextInterviewAt ? (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={interviewState.variant}>{interviewState.badge}</Badge>
                <Badge variant="blue">{formatDateTime(nextInterviewAt)}</Badge>
                {interviewFormat && <Badge variant="muted">{interviewFormat}</Badge>}
              </div>
              {interviewLocation && (
                <p className="text-sm font-body leading-relaxed text-dark-500">
                  {interviewLocation}
                </p>
              )}
              {interviewPrep ? (
                <p className="text-sm font-body leading-relaxed text-dark-500">
                  {interviewPrep}
                </p>
              ) : (
                <p className="text-sm font-body text-muted-foreground">
                  Noch keine Vorbereitung notiert.
                </p>
              )}
              {showInterviewStatusHint && (
                <div className="rounded-[18px] border border-orange-200/70 bg-orange-50/70 px-3 py-2 text-xs font-heading text-orange-600">
                  Gespräch geplant, aber der Stand ist noch nicht auf „Im Gespräch“ gesetzt.
                </div>
              )}
            </div>
          ) : (
            <EmptyWorkflowState
              body="Noch kein Gespräch geplant. Sobald ein Termin feststeht, erscheint er hier mit allen wichtigen Details."
              actionLabel="Gespräch planen"
              onAction={() => setIsEditingInterview(true)}
            />
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-heading text-muted-foreground">
          <Sparkles size={12} className="text-accent-orange" />
          Diese Angaben helfen dir, Erinnerungen und Prioritäten automatisch sauber zu halten.
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  hint,
  badge,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  badge?: ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-border/80 bg-white/82 px-4 py-3 shadow-card">
      <div className="flex items-center gap-2 text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className="text-sm font-heading font-semibold text-dark">{value}</p>
        {badge}
      </div>
      <p className="mt-1 text-sm font-body leading-relaxed text-dark-500">{hint}</p>
    </div>
  );
}

function EmptyWorkflowState({
  body,
  actionLabel,
  onAction,
}: {
  body: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="mt-4 rounded-[20px] border border-dashed border-border bg-white/82 p-4">
      <p className="text-sm font-body leading-relaxed text-dark-500">{body}</p>
      <div className="mt-4">
        <Button type="button" size="sm" onClick={onAction}>
          <SquarePen size={14} />
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

function getDeadlineState(deadline: string | null, now: Date) {
  if (!deadline) {
    return { badge: "Noch offen", variant: "muted" as const };
  }

  const diffDays = getCalendarDayDifference(deadline, now);

  if (diffDays < 0) {
    return { badge: "Überfällig", variant: "orange" as const };
  }

  if (diffDays <= 2) {
    return { badge: "Bald fällig", variant: "orange" as const };
  }

  if (diffDays <= 7) {
    return { badge: "Diese Woche", variant: "blue" as const };
  }

  return { badge: "Im Blick", variant: "green" as const };
}

function getInterviewState(nextInterviewAt: string | null, now: Date) {
  if (!nextInterviewAt) {
    return { badge: "Noch offen", variant: "muted" as const };
  }

  const diffHours = Math.ceil(
    (toTimestamp(nextInterviewAt) - now.getTime()) / (1000 * 60 * 60)
  );

  if (diffHours < 0) {
    return { badge: "Vorbei", variant: "muted" as const };
  }

  if (diffHours <= 24) {
    return { badge: "In 24h", variant: "orange" as const };
  }

  if (diffHours <= 72) {
    return { badge: "In 3 Tagen", variant: "blue" as const };
  }

  return { badge: "Geplant", variant: "green" as const };
}

function getNextTrigger(
  deadline: string | null,
  nextInterviewAt: string | null,
  now: Date
) {
  const deadlineState = deadline ? getDeadlineState(deadline, now) : null;
  const interviewState = nextInterviewAt
    ? getInterviewState(nextInterviewAt, now)
    : null;
  const entries = [
    deadline
      ? {
          type: "Frist",
          date: toTimestamp(deadline),
          value: "Frist",
          hint: `${formatDateShort(deadline)} · ${relativeDate(deadline)}`,
          badge: deadlineState!.badge,
          variant: deadlineState!.variant,
        }
      : null,
    nextInterviewAt
      ? {
          type: "Interview",
          date: toTimestamp(nextInterviewAt),
          value: "Interview",
          hint: `${formatDateTime(nextInterviewAt)} · ${relativeDate(nextInterviewAt)}`,
          badge: interviewState!.badge,
          variant: interviewState!.variant,
        }
      : null,
  ]
    .filter(Boolean)
    .sort((a, b) => a!.date - b!.date);

  if (entries.length === 0) {
    return {
      value: "Noch nichts geplant",
      hint: "Sobald du eine Frist oder ein Gespräch einträgst, erscheint der nächste wichtige Schritt hier automatisch.",
      badge: "Leer",
      variant: "muted" as const,
    };
  }

  const next = entries[0]!;

  return {
    value: next.type,
    hint: next.hint,
    badge: next.badge,
    variant: next.variant,
  };
}
