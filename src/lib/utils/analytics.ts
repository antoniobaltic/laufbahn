import {
  addMonths,
  differenceInCalendarDays,
  format,
  isWithinInterval,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { de } from "date-fns/locale";
import { COLUMN_ORDER, type ApplicationStatus } from "@/lib/utils/constants";
import { parseStoredDate } from "@/lib/utils/dates";
import { buildReminderNotifications } from "@/lib/utils/reminders";
import type { Activity } from "@/types/activity";
import type { AnalyticsSnapshot } from "@/types/analytics";
import type { Application } from "@/types/application";

type AnalyticsApplication = Pick<
  Application,
  | "id"
  | "company_name"
  | "role_title"
  | "status"
  | "date_saved"
  | "date_applied"
  | "date_interview"
  | "date_offer"
  | "date_rejected"
  | "deadline"
  | "deadline_note"
  | "next_interview_at"
  | "interview_format"
  | "interview_location"
  | "notes"
  | "created_at"
  | "updated_at"
>;

type AnalyticsActivity = Pick<
  Activity,
  "id" | "application_id" | "activity_type" | "title" | "created_at"
>;

interface BuildAnalyticsSnapshotInput {
  applications: AnalyticsApplication[];
  activities: AnalyticsActivity[];
  contactApplicationIds: string[];
  documentApplicationIds: string[];
  now?: Date;
}

const ACTIVE_STATUSES = new Set<ApplicationStatus>([
  "gemerkt",
  "beworben",
  "im_gespraech",
]);
const RESPONSE_STATUSES = new Set<ApplicationStatus>([
  "im_gespraech",
  "angebot",
  "abgelehnt",
]);

export function buildAnalyticsSnapshot({
  applications,
  activities,
  contactApplicationIds,
  documentApplicationIds,
  now = new Date(),
}: BuildAnalyticsSnapshotInput): AnalyticsSnapshot {
  const totalApplications = applications.length;
  const activeApplications = applications.filter((application) =>
    ACTIVE_STATUSES.has(application.status)
  ).length;
  const appliedApplications = applications.filter((application) =>
    Boolean(application.date_applied)
  );
  const interviewApplications = applications.filter((application) =>
    Boolean(application.date_interview)
  );
  const offeredApplications = applications.filter((application) =>
    Boolean(application.date_offer)
  );
  const decisionsCount = applications.filter((application) =>
    ["angebot", "abgelehnt"].includes(application.status)
  ).length;
  const respondedApplications = appliedApplications.filter(
    (application) =>
      RESPONSE_STATUSES.has(application.status) || Boolean(application.date_rejected)
  );
  const reminders = buildReminderNotifications(applications, undefined, now);
  const applicationLookup = new Map(
    applications.map((application) => [application.id, application])
  );
  const contactIds = new Set(contactApplicationIds);
  const documentIds = new Set(documentApplicationIds);

  return {
    generatedAt: now.toISOString(),
    totalApplications,
    activeApplications,
    appliedApplications: appliedApplications.length,
    interviewCount: interviewApplications.length,
    offerCount: offeredApplications.length,
    decisionsCount,
    responseRate: toPercent(
      respondedApplications.length,
      appliedApplications.length
    ),
    offerRate: toPercent(offeredApplications.length, appliedApplications.length),
    averageDaysToInterview: getAverageDuration(
      interviewApplications,
      "date_applied",
      "date_interview"
    ),
    averageDaysToOffer: getAverageDuration(
      offeredApplications,
      "date_applied",
      "date_offer"
    ),
    activityLast30Days: activities.filter((activity) =>
      isWithinInterval(parseStoredDate(activity.created_at), {
        start: subDays(now, 30),
        end: now,
      })
    ).length,
    reminderCount: reminders.length,
    upcomingDeadlines: reminders.filter((reminder) => reminder.type === "deadline")
      .length,
    upcomingInterviews: reminders.filter((reminder) => reminder.type === "interview")
      .length,
    pendingFollowUps: reminders.filter((reminder) => reminder.type === "follow_up")
      .length,
    statusBreakdown: COLUMN_ORDER.map((status) => {
      const count = applications.filter((application) => application.status === status)
        .length;

      return {
        status,
        count,
        share: totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0,
      };
    }),
    funnel: buildFunnel(applications, totalApplications),
    monthlyMomentum: buildMonthlyMomentum(applications, now),
    workspaceCoverage: buildWorkspaceCoverage(
      applications,
      contactIds,
      documentIds,
      totalApplications
    ),
    recentMovement: [...activities]
      .sort(
        (a, b) =>
          parseStoredDate(b.created_at).getTime() - parseStoredDate(a.created_at).getTime()
      )
      .slice(0, 6)
      .map((activity) => {
        const application = applicationLookup.get(activity.application_id);

        return {
          id: activity.id,
          applicationId: activity.application_id,
          companyName: application?.company_name || "Bewerbung",
          roleTitle: application?.role_title || "Ohne Titel",
          title: activity.title,
          activityType: activity.activity_type,
          createdAt: activity.created_at,
        };
      }),
  };
}

export function buildEmptyAnalyticsSnapshot(now = new Date()) {
  return buildAnalyticsSnapshot({
    applications: [],
    activities: [],
    contactApplicationIds: [],
    documentApplicationIds: [],
    now,
  });
}

function buildFunnel(
  applications: AnalyticsApplication[],
  totalApplications: number
) {
  const stages = [
    {
      id: "saved",
      label: "Gemerkt",
      count: totalApplications,
    },
    {
      id: "applied",
      label: "Beworben",
      count: applications.filter((application) => Boolean(application.date_applied))
        .length,
    },
    {
      id: "interview",
      label: "Im Gespräch",
      count: applications.filter((application) => Boolean(application.date_interview))
        .length,
    },
    {
      id: "offer",
      label: "Angebot",
      count: applications.filter((application) => Boolean(application.date_offer)).length,
    },
  ] as const;

  return stages.map((stage, index) => {
    const previousCount = index > 0 ? stages[index - 1]!.count : null;

    return {
      ...stage,
      share: totalApplications > 0 ? Math.round((stage.count / totalApplications) * 100) : 0,
      rateFromPrevious:
        previousCount && previousCount > 0
          ? Math.round((stage.count / previousCount) * 100)
          : null,
    };
  });
}

function buildMonthlyMomentum(applications: AnalyticsApplication[], now: Date) {
  const months = Array.from({ length: 6 }, (_, index) =>
    startOfMonth(subMonths(now, 5 - index))
  );

  return months.map((month) => {
    const nextMonth = addMonths(month, 1);
    const countBetween = (value: string | null) => {
      if (!value) {
        return 0;
      }

      const date = parseStoredDate(value);
      return date >= month && date < nextMonth ? 1 : 0;
    };

    return {
      key: format(month, "yyyy-MM"),
      label: format(month, "LLL", { locale: de }),
      saved: applications.reduce(
        (sum, application) => sum + countBetween(application.date_saved),
        0
      ),
      applied: applications.reduce(
        (sum, application) => sum + countBetween(application.date_applied),
        0
      ),
      interviews: applications.reduce(
        (sum, application) => sum + countBetween(application.date_interview),
        0
      ),
      offers: applications.reduce(
        (sum, application) => sum + countBetween(application.date_offer),
        0
      ),
    };
  });
}

function buildWorkspaceCoverage(
  applications: AnalyticsApplication[],
  contactIds: Set<string>,
  documentIds: Set<string>,
  totalApplications: number
): AnalyticsSnapshot["workspaceCoverage"] {
  const withNotes = applications.filter((application) => application.notes?.trim()).length;
  const withDeadlines = applications.filter((application) => Boolean(application.deadline))
    .length;
  const withContacts = applications.filter((application) => contactIds.has(application.id))
    .length;
  const withDocuments = applications.filter((application) => documentIds.has(application.id))
    .length;

  return [
    {
      id: "notes",
      label: "Notizen",
      count: withNotes,
      share: toPercent(withNotes, totalApplications),
      helper: "Gedanken, Gesprächsnotizen und nächste Schritte sind festgehalten.",
    },
    {
      id: "deadlines",
      label: "Fristen",
      count: withDeadlines,
      share: toPercent(withDeadlines, totalApplications),
      helper: "Wichtige Termine und Fristen sind sauber hinterlegt.",
    },
    {
      id: "contacts",
      label: "Kontakte",
      count: withContacts,
      share: toPercent(withContacts, totalApplications),
      helper: "Mindestens eine Ansprechperson ist pro Bewerbung hinterlegt.",
    },
    {
      id: "documents",
      label: "Dokumente",
      count: withDocuments,
      share: toPercent(withDocuments, totalApplications),
      helper: "Lebenslauf, Anschreiben oder weitere Unterlagen sind verknüpft.",
    },
  ];
}

function getAverageDuration(
  applications: AnalyticsApplication[],
  startKey: "date_applied",
  endKey: "date_interview" | "date_offer"
) {
  const values = applications
    .map((application) => {
      const start = application[startKey];
      const end = application[endKey];

      if (!start || !end) {
        return null;
      }

      return differenceInCalendarDays(parseStoredDate(end), parseStoredDate(start));
    })
    .filter((value): value is number => value !== null && value >= 0);

  if (values.length === 0) {
    return null;
  }

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(average * 10) / 10;
}

function toPercent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}
