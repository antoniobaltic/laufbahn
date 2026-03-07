import type { Application } from "@/types/application";
import type { ReminderItem, ReminderUrgency } from "@/types/reminder";
import { getCalendarDayDifference, toTimestamp } from "@/lib/utils/dates";

export type ReminderApplication = Pick<
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
  | "notes"
>;

const DECISION_STATUSES = new Set(["angebot", "abgelehnt", "ghosted"]);
const DAY_IN_MS = 1000 * 60 * 60 * 24;
const HOUR_IN_MS = 1000 * 60 * 60;

export function buildReminderNotifications(
  applications: ReminderApplication[],
  options?: {
    deadlineReminderDays?: number;
    interviewReminderHours?: number;
  },
  now = new Date()
) {
  const reminders = applications.flatMap((application) =>
    buildApplicationReminders(application, options, now)
  );

  return reminders.sort((a, b) => {
    const urgencyDiff = getUrgencyRank(a.urgency) - getUrgencyRank(b.urgency);

    if (urgencyDiff !== 0) {
      return urgencyDiff;
    }

    return toTimestamp(a.dueAt) - toTimestamp(b.dueAt);
  });
}

export function getReminderCounts(reminders: ReminderItem[]) {
  return reminders.reduce(
    (acc, reminder) => {
      acc.total += 1;
      acc[reminder.urgency] += 1;
      return acc;
    },
    { total: 0, high: 0, medium: 0, low: 0 }
  );
}

function buildApplicationReminders(
  application: ReminderApplication,
  options: {
    deadlineReminderDays?: number;
    interviewReminderHours?: number;
  } = {},
  now: Date
) {
  if (DECISION_STATUSES.has(application.status)) {
    return [];
  }

  return [
    buildDeadlineReminder(application, options.deadlineReminderDays ?? 7, now),
    buildInterviewReminder(application, options.interviewReminderHours ?? 96, now),
    buildFollowUpReminder(application, now),
  ].filter(Boolean) as ReminderItem[];
}

function buildDeadlineReminder(
  application: ReminderApplication,
  deadlineReminderDays: number,
  now: Date
) {
  if (!application.deadline) {
    return null;
  }

  const diffDays = getCalendarDayDifference(application.deadline, now);

  if (diffDays > deadlineReminderDays || diffDays < -2) {
    return null;
  }

  return {
    id: `${application.id}-deadline-${application.deadline}`,
    applicationId: application.id,
    href: `/bewerbung/${application.id}`,
    companyName: application.company_name,
    roleTitle: application.role_title,
    type: "deadline",
    urgency:
      diffDays <= 1 ? "high" : diffDays <= 3 ? "medium" : "low",
    title:
      diffDays < 0
        ? "Frist überfällig"
        : diffDays === 0
          ? "Frist heute"
          : diffDays === 1
            ? "Frist morgen"
            : `Frist in ${diffDays} Tagen`,
    body: `${application.company_name} · ${application.role_title}`,
    dueAt: application.deadline,
    ctaLabel: "Frist prüfen",
    meta: application.deadline_note || undefined,
  } satisfies ReminderItem;
}

function buildInterviewReminder(
  application: ReminderApplication,
  interviewReminderHours: number,
  now: Date
) {
  if (!application.next_interview_at) {
    return null;
  }

  const diffMs = toTimestamp(application.next_interview_at) - now.getTime();
  const diffHours = Math.ceil(diffMs / HOUR_IN_MS);

  if (diffHours > interviewReminderHours || diffHours < -8) {
    return null;
  }

  return {
    id: `${application.id}-interview-${application.next_interview_at}`,
    applicationId: application.id,
    href: `/bewerbung/${application.id}`,
    companyName: application.company_name,
    roleTitle: application.role_title,
    type: "interview",
    urgency:
      diffHours <= 24 ? "high" : diffHours <= 48 ? "medium" : "low",
    title:
      diffHours < 0
        ? "Interview läuft oder ist gerade vorbei"
        : diffHours <= 6
          ? "Interview in wenigen Stunden"
          : diffHours <= 24
            ? "Interview heute"
            : diffHours <= 48
              ? "Interview morgen"
              : "Interview bald",
    body: `${application.company_name} · ${application.role_title}`,
    dueAt: application.next_interview_at,
    ctaLabel: "Vorbereiten",
    meta:
      [application.interview_format, application.interview_location]
        .filter(Boolean)
        .join(" · ") || undefined,
  } satisfies ReminderItem;
}

function buildFollowUpReminder(application: ReminderApplication, now: Date) {
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
    id: `${application.id}-follow-up-${dueAt.slice(0, 10)}`,
    applicationId: application.id,
    href: `/bewerbung/${application.id}`,
    companyName: application.company_name,
    roleTitle: application.role_title,
    type: "follow_up",
    urgency: ageDays >= 18 ? "high" : ageDays >= 14 ? "medium" : "low",
    title: "Follow-up prüfen",
    body: `${application.company_name} wartet seit ${ageDays} Tagen im Status Beworben.`,
    dueAt,
    ctaLabel: "Nächsten Schritt planen",
    meta: application.notes || undefined,
  } satisfies ReminderItem;
}

function getUrgencyRank(urgency: ReminderUrgency) {
  const ranks: Record<ReminderUrgency, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return ranks[urgency];
}
