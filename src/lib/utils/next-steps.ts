import type { Application } from "@/types/application";
import type { NextStepPrompt } from "@/types/next-step";
import { getCalendarDayDifference, toTimestamp } from "@/lib/utils/dates";

export type NextStepApplication = Pick<
  Application,
  | "id"
  | "company_name"
  | "role_title"
  | "status"
  | "date_applied"
  | "date_interview"
  | "deadline"
  | "deadline_note"
  | "next_interview_at"
  | "interview_format"
  | "interview_location"
  | "interview_prep"
  | "notes"
>;

const DECISION_STATUSES = new Set(["angebot", "abgelehnt", "ghosted"]);
const DAY_IN_MS = 1000 * 60 * 60 * 24;
const HOUR_IN_MS = 1000 * 60 * 60;

export function buildNextStepPrompts(
  applications: NextStepApplication[],
  options?: {
    deadlineReminderDays?: number;
    interviewReminderHours?: number;
    limit?: number;
  },
  now = new Date()
) {
  const prompts = applications.flatMap((application) =>
    buildApplicationNextStepPrompts(application, options, now)
  );

  const sorted = prompts.sort((a, b) => {
    const rankDiff = getPromptRank(a.type) - getPromptRank(b.type);

    if (rankDiff !== 0) {
      return rankDiff;
    }

    return toTimestamp(a.dueAt) - toTimestamp(b.dueAt);
  });

  return sorted.slice(0, options?.limit ?? 3);
}

export function buildApplicationNextStepPrompts(
  application: NextStepApplication,
  options?: {
    deadlineReminderDays?: number;
    interviewReminderHours?: number;
  },
  now = new Date()
) {
  if (DECISION_STATUSES.has(application.status)) {
    return [];
  }

  return [
    buildInterviewPrepPrompt(application, options?.interviewReminderHours ?? 48, now),
    buildDeadlinePrompt(application, options?.deadlineReminderDays ?? 3, now),
    buildFollowUpPrompt(application, now),
  ].filter(Boolean) as NextStepPrompt[];
}

function buildInterviewPrepPrompt(
  application: NextStepApplication,
  interviewReminderHours: number,
  now: Date
) {
  if (!application.next_interview_at) {
    return null;
  }

  const diffMs = toTimestamp(application.next_interview_at) - now.getTime();
  const diffHours = Math.ceil(diffMs / HOUR_IN_MS);

  if (diffHours < 0 || diffHours > interviewReminderHours) {
    return null;
  }

  const missingBits = [
    !application.interview_prep ? "Vorbereitung" : null,
    !application.interview_format ? "Format" : null,
    !application.interview_location ? "Ort" : null,
  ].filter(Boolean) as string[];

  if (missingBits.length === 0) {
    return null;
  }

  return {
    id: `${application.id}-interview-prep-${application.next_interview_at}`,
    applicationId: application.id,
    href: `/bewerbung/${application.id}`,
    companyName: application.company_name,
    roleTitle: application.role_title,
    type: "interview_prep",
    title: `${formatInterviewLead(diffHours)} Vorbereitung ergänzen?`,
    body: `${application.company_name} · ${application.role_title}`,
    ctaLabel: "Zum Gesprächstermin",
    dueAt: application.next_interview_at,
    meta: `Fehlt noch: ${missingBits.join(", ")}`,
  } satisfies NextStepPrompt;
}

function buildDeadlinePrompt(
  application: NextStepApplication,
  deadlineReminderDays: number,
  now: Date
) {
  if (!application.deadline) {
    return null;
  }

  const diffDays = getCalendarDayDifference(application.deadline, now);

  if (diffDays < 0 || diffDays > deadlineReminderDays) {
    return null;
  }

  if (application.deadline_note?.trim()) {
    return null;
  }

  return {
    id: `${application.id}-deadline-review-${application.deadline}`,
    applicationId: application.id,
    href: `/bewerbung/${application.id}`,
    companyName: application.company_name,
    roleTitle: application.role_title,
    type: "deadline_review",
    title: `${formatDeadlineLead(diffDays)} Nächsten Schritt festhalten?`,
    body: `${application.company_name} · ${application.role_title}`,
    ctaLabel: "Frist prüfen",
    dueAt: application.deadline,
    meta: "Zur Frist gibt es noch keine Notiz",
  } satisfies NextStepPrompt;
}

function buildFollowUpPrompt(application: NextStepApplication, now: Date) {
  if (application.status !== "beworben" || !application.date_applied) {
    return null;
  }

  if (application.next_interview_at || application.date_interview) {
    return null;
  }

  const appliedAt = toTimestamp(application.date_applied);
  const ageDays = Math.floor((now.getTime() - appliedAt) / DAY_IN_MS);

  if (ageDays < 10) {
    return null;
  }

  const dueAt = new Date(appliedAt + 10 * DAY_IN_MS).toISOString();

  return {
    id: `${application.id}-follow-up-prompt-${dueAt.slice(0, 10)}`,
    applicationId: application.id,
    href: `/bewerbung/${application.id}`,
    companyName: application.company_name,
    roleTitle: application.role_title,
    type: "follow_up",
    title: `Vor ${ageDays} Tagen beworben. Nachfassen einplanen?`,
    body: `${application.company_name} · ${application.role_title}`,
    ctaLabel: "Bewerbung öffnen",
    dueAt,
    meta: application.notes?.trim() || "Bisher ist noch keine Rückmeldung sichtbar",
  } satisfies NextStepPrompt;
}

function formatInterviewLead(diffHours: number) {
  if (diffHours <= 6) {
    return "Gespräch in wenigen Stunden.";
  }

  if (diffHours <= 24) {
    return "Gespräch heute.";
  }

  if (diffHours <= 48) {
    return "Gespräch morgen.";
  }

  return `Gespräch in ${Math.ceil(diffHours / 24)} Tagen.`;
}

function formatDeadlineLead(diffDays: number) {
  if (diffDays === 0) {
    return "Frist heute.";
  }

  if (diffDays === 1) {
    return "Frist morgen.";
  }

  return `Frist in ${diffDays} Tagen.`;
}

function getPromptRank(type: NextStepPrompt["type"]) {
  const ranks: Record<NextStepPrompt["type"], number> = {
    interview_prep: 0,
    deadline_review: 1,
    follow_up: 2,
  };

  return ranks[type];
}
