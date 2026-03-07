"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  buildAnalyticsSnapshot,
  buildEmptyAnalyticsSnapshot,
} from "@/lib/utils/analytics";
import {
  buildReminderNotifications,
  type ReminderApplication,
} from "@/lib/utils/reminders";
import {
  buildNextStepPrompts,
  type NextStepApplication,
} from "@/lib/utils/next-steps";
import { dateTimeInputToISOString } from "@/lib/utils/dates";
import type { ApplicationStatus } from "@/lib/utils/constants";
import type { Activity, ActivityMetadata, ActivityType } from "@/types/activity";
import type { AnalyticsSnapshot } from "@/types/analytics";
import type {
  Application,
  ApplicationOverview,
  CreateApplicationInput,
  CreateApplicationResult,
} from "@/types/application";
import type {
  ApplicationContact,
  ApplicationDocument,
  CreateApplicationContactInput,
  CreateApplicationDocumentInput,
} from "@/types/application-detail";
import type { NextStepPrompt } from "@/types/next-step";
import type { ReminderItem } from "@/types/reminder";
import type { UserProfile } from "@/types/profile";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function revalidateApplicationPaths(applicationIds: string[] = []) {
  revalidatePath("/board");
  revalidatePath("/bewerbung");

  new Set(applicationIds).forEach((id) => {
    revalidatePath(`/bewerbung/${id}`);
  });
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Nicht angemeldet");
  }

  return { supabase, user };
}

async function insertActivity(
  supabase: SupabaseServerClient,
  {
    userId,
    applicationId,
    activityType,
    title,
    metadata,
  }: {
    userId: string;
    applicationId: string;
    activityType: ActivityType;
    title: string;
    metadata?: ActivityMetadata;
  }
) {
  const { error } = await supabase.from("activities").insert({
    user_id: userId,
    application_id: applicationId,
    activity_type: activityType,
    title,
    metadata: metadata ?? {},
  });

  if (error) {
    console.error("Error inserting activity:", error);
    throw new Error("Aktivität konnte nicht gespeichert werden.");
  }
}

async function getNextPosition(
  supabase: SupabaseServerClient,
  userId: string,
  status: ApplicationStatus,
  excludeId?: string
) {
  let query = supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", status);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Error counting applications in status:", error);
    throw new Error("Status konnte nicht vorbereitet werden.");
  }

  return count ?? 0;
}

function normalizeOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeDateOnly(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getDateOnlyValue(value?: string | null) {
  return value ? value.slice(0, 10) : null;
}

function normalizeDateTimeValue(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return dateTimeInputToISOString(trimmed);
}

function buildExcerpt(value: string, maxLength = 140) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function normalizeContactInput(input: CreateApplicationContactInput) {
  return {
    full_name: input.full_name.trim(),
    role_title: normalizeOptionalString(input.role_title),
    email: normalizeOptionalString(input.email),
    phone: normalizeOptionalString(input.phone),
    linkedin_url: normalizeOptionalString(input.linkedin_url),
    notes: normalizeOptionalString(input.notes),
    is_primary: Boolean(input.is_primary),
  };
}

function normalizeDocumentInput(input: CreateApplicationDocumentInput) {
  return {
    title: input.title.trim(),
    document_type: input.document_type,
    document_url: input.document_url.trim(),
    version_label: normalizeOptionalString(input.version_label),
    notes: normalizeOptionalString(input.notes),
  };
}

function contactMatchesInput(
  contact: ApplicationContact,
  input: ReturnType<typeof normalizeContactInput>
) {
  return (
    contact.full_name === input.full_name &&
    contact.role_title === input.role_title &&
    contact.email === input.email &&
    contact.phone === input.phone &&
    contact.linkedin_url === input.linkedin_url &&
    contact.notes === input.notes &&
    contact.is_primary === input.is_primary
  );
}

function documentMatchesInput(
  document: ApplicationDocument,
  input: ReturnType<typeof normalizeDocumentInput>
) {
  return (
    document.title === input.title &&
    document.document_type === input.document_type &&
    document.document_url === input.document_url &&
    document.version_label === input.version_label &&
    document.notes === input.notes
  );
}

async function getReminderPreferences(
  supabase: SupabaseServerClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("deadline_reminder_days, interview_reminder_hours")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching reminder preferences:", error);
    return {
      deadlineReminderDays: 3,
      interviewReminderHours: 48,
    };
  }

  const profile = data as Pick<
    UserProfile,
    "deadline_reminder_days" | "interview_reminder_hours"
  > | null;

  return {
    deadlineReminderDays: profile?.deadline_reminder_days ?? 3,
    interviewReminderHours: profile?.interview_reminder_hours ?? 48,
  };
}

async function deleteRecentStatusChangeActivities(
  supabase: SupabaseServerClient,
  userId: string,
  applicationId: string,
  previousStatus: ApplicationStatus,
  currentStatus: ApplicationStatus
) {
  const { data, error } = await supabase
    .from("activities")
    .select("id, metadata")
    .eq("user_id", userId)
    .eq("application_id", applicationId)
    .eq("activity_type", "status_change")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Error fetching status change activities for undo:", error);
    return;
  }

  const matchingIds = (data ?? [])
    .filter((activity) => {
      const metadata = activity.metadata as ActivityMetadata | null;

      return (
        (metadata?.old_status === previousStatus &&
          metadata?.new_status === currentStatus) ||
        (metadata?.old_status === currentStatus &&
          metadata?.new_status === previousStatus)
      );
    })
    .slice(0, 2)
    .map((activity) => activity.id);

  if (matchingIds.length === 0) {
    return;
  }

  const { error: deleteError } = await supabase
    .from("activities")
    .delete()
    .eq("user_id", userId)
    .in("id", matchingIds);

  if (deleteError) {
    console.error("Error deleting status change activities for undo:", deleteError);
  }
}

export async function getApplications(): Promise<ApplicationOverview[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("applications")
    .select(
      [
        "id",
        "user_id",
        "company_name",
        "company_website_url",
        "company_logo_url",
        "role_title",
        "location",
        "job_url",
        "salary_min",
        "salary_max",
        "salary_note",
        "status",
        "position_in_column",
        "date_saved",
        "date_applied",
        "date_interview",
        "date_offer",
        "date_rejected",
        "deadline",
        "next_interview_at",
        "employment_type",
        "remote_policy",
        "created_at",
        "updated_at",
      ].join(", ")
    )
    .eq("user_id", user.id)
    .order("position_in_column", { ascending: true });

  if (error) {
    console.error("Error fetching applications:", error);
    return [];
  }

  return (data ?? []) as unknown as ApplicationOverview[];
}

export async function getNotificationReminders(limit?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [] as ReminderItem[];

  const preferences = await getReminderPreferences(supabase, user.id);

  const { data, error } = await supabase
    .from("applications")
    .select(
      [
        "id",
        "company_name",
        "role_title",
        "status",
        "date_applied",
        "date_interview",
        "deadline",
        "deadline_note",
        "next_interview_at",
        "interview_format",
        "interview_location",
        "notes",
      ].join(", ")
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching notification reminders:", error);
    return [] as ReminderItem[];
  }

  const reminderApplications = (data ?? []) as unknown as ReminderApplication[];
  const reminders = buildReminderNotifications(reminderApplications, preferences);
  return typeof limit === "number" ? reminders.slice(0, limit) : reminders;
}

export async function getNextStepPrompts(limit?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [] as NextStepPrompt[];

  const [preferences, applicationsResult] = await Promise.all([
    getReminderPreferences(supabase, user.id),
    supabase
      .from("applications")
      .select(
        [
          "id",
          "company_name",
          "role_title",
          "status",
          "date_applied",
          "date_interview",
          "deadline",
          "deadline_note",
          "next_interview_at",
          "interview_format",
          "interview_location",
          "interview_prep",
          "notes",
        ].join(", ")
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  if (applicationsResult.error) {
    console.error("Error fetching next-step prompts:", applicationsResult.error);
    return [] as NextStepPrompt[];
  }

  return buildNextStepPrompts(
    (applicationsResult.data ?? []) as unknown as NextStepApplication[],
    {
      ...preferences,
      limit,
    }
  );
}

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  const { supabase, user } = await getAuthenticatedClient();

  const [
    applicationsResult,
    activitiesResult,
    contactsResult,
    documentsResult,
    sourceDocumentsResult,
  ] = await Promise.all([
      supabase
        .from("applications")
        .select(
          [
            "id",
            "company_name",
            "role_title",
            "status",
            "date_saved",
            "date_applied",
            "date_interview",
            "date_offer",
            "date_rejected",
            "deadline",
            "deadline_note",
            "next_interview_at",
            "interview_format",
            "interview_location",
            "notes",
            "created_at",
            "updated_at",
          ].join(", ")
        )
        .eq("user_id", user.id),
      supabase
        .from("activities")
        .select("id, application_id, activity_type, title, created_at")
        .eq("user_id", user.id),
      supabase
        .from("application_contacts")
        .select("application_id")
        .eq("user_id", user.id),
      supabase
        .from("application_documents")
        .select("application_id")
        .eq("user_id", user.id),
      supabase
        .from("application_source_documents")
        .select("application_id")
        .eq("user_id", user.id),
    ]);

  if (applicationsResult.error) {
    console.error("Error fetching analytics applications:", applicationsResult.error);
    return buildEmptyAnalyticsSnapshot();
  }

  if (activitiesResult.error) {
    console.error("Error fetching analytics activities:", activitiesResult.error);
  }

  if (contactsResult.error) {
    console.error("Error fetching analytics contacts:", contactsResult.error);
  }

  if (documentsResult.error) {
    console.error("Error fetching analytics documents:", documentsResult.error);
  }

  if (sourceDocumentsResult.error) {
    console.error(
      "Error fetching analytics source documents:",
      sourceDocumentsResult.error
    );
  }

  return buildAnalyticsSnapshot({
    applications: (applicationsResult.data ?? []) as unknown as Application[],
    activities: (activitiesResult.data ?? []) as unknown as Activity[],
    contactApplicationIds: (contactsResult.data ?? []).map(
      (row) => row.application_id
    ),
    documentApplicationIds: [
      ...(documentsResult.data ?? []).map((row) => row.application_id),
      ...(sourceDocumentsResult.data ?? []).map((row) => row.application_id),
    ],
  });
}

export async function getApplicationById(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching application:", error);
    return null;
  }

  return (data ?? null) as Application | null;
}

export async function getApplicationActivities(applicationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching application activities:", error);
    return [];
  }

  return (data ?? []) as Activity[];
}

export async function getApplicationContacts(applicationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("application_contacts")
    .select("*")
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching application contacts:", error);
    return [];
  }

  return (data ?? []) as ApplicationContact[];
}

export async function getApplicationDocuments(applicationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("application_documents")
    .select("*")
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching application documents:", error);
    return [];
  }

  return (data ?? []) as ApplicationDocument[];
}

export async function getApplicationWorkspace(id: string) {
  const { supabase, user } = await getAuthenticatedClient();

  const [
    applicationResult,
    activitiesResult,
    contactsResult,
    documentsResult,
  ] = await Promise.all([
    supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("activities")
      .select("*")
      .eq("application_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("application_contacts")
      .select("*")
      .eq("application_id", id)
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("application_documents")
      .select("*")
      .eq("application_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (applicationResult.error) {
    console.error("Error fetching application workspace application:", applicationResult.error);
    return null;
  }

  if (activitiesResult.error) {
    console.error("Error fetching application workspace activities:", activitiesResult.error);
  }

  if (contactsResult.error) {
    console.error("Error fetching application workspace contacts:", contactsResult.error);
  }

  if (documentsResult.error) {
    console.error("Error fetching application workspace documents:", documentsResult.error);
  }

  return {
    application: (applicationResult.data ?? null) as Application | null,
    activities: (activitiesResult.data ?? []) as Activity[],
    contacts: (contactsResult.data ?? []) as ApplicationContact[],
    documents: (documentsResult.data ?? []) as ApplicationDocument[],
  };
}

export async function createApplication(
  input: CreateApplicationInput
): Promise<CreateApplicationResult> {
  const { supabase, user } = await getAuthenticatedClient();
  const status = input.status || "gemerkt";
  const position = await getNextPosition(supabase, user.id, status);
  let importedContact: ApplicationContact | null = null;

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      company_name: input.company_name,
      company_website_url: input.company_website_url || null,
      company_logo_url: input.company_logo_url || null,
      role_title: input.role_title,
      location: input.location || null,
      job_url: input.job_url || null,
      salary_min: input.salary_min || null,
      salary_max: input.salary_max || null,
      salary_note: input.salary_note || null,
      status,
      position_in_column: position,
      deadline: input.deadline || null,
      description: input.description || null,
      requirements: input.requirements?.length ? input.requirements : null,
      benefits: input.benefits?.length ? input.benefits : null,
      employment_type: input.employment_type || null,
      remote_policy: input.remote_policy || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating application:", error);
    throw new Error("Bewerbung konnte nicht erstellt werden.");
  }

  if (input.initial_contact?.full_name?.trim()) {
    const contact = normalizeContactInput({
      ...input.initial_contact,
      is_primary: true,
    });

    try {
      const { data: contactData, error: contactError } = await supabase
        .from("application_contacts")
        .insert({
          user_id: user.id,
          application_id: data.id,
          full_name: contact.full_name,
          role_title: contact.role_title,
          email: contact.email,
          phone: contact.phone,
          linkedin_url: contact.linkedin_url,
          notes: contact.notes,
          is_primary: true,
        })
        .select()
        .single();

      if (contactError) {
        console.error("Error creating imported contact:", contactError);
      } else {
        importedContact = contactData as unknown as ApplicationContact;
        await insertActivity(supabase, {
          userId: user.id,
          applicationId: data.id,
          activityType: "contact_added",
          title: `${contact.full_name} hinterlegt`,
          metadata: {
            contact_name: contact.full_name,
            contact_role: contact.role_title || undefined,
          },
        });
      }
    } catch (contactInsertError) {
      console.error("Error creating imported contact:", contactInsertError);
    }
  }

  revalidateApplicationPaths([data.id]);
  return {
    application: data as Application,
    importedContact,
  };
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  positionInColumn: number
) {
  const { supabase, user } = await getAuthenticatedClient();

  const { error } = await supabase
    .from("applications")
    .update({
      status,
      position_in_column: positionInColumn,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating application status:", error);
    throw new Error("Status konnte nicht aktualisiert werden.");
  }

  revalidateApplicationPaths([id]);
}

export async function updateApplicationStatusFromDetail(
  id: string,
  status: ApplicationStatus
) {
  const { supabase, user } = await getAuthenticatedClient();
  const { data: application, error: fetchError } = await supabase
    .from("applications")
    .select("id, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching application for status update:", fetchError);
    throw new Error("Bewerbung konnte nicht geladen werden.");
  }

  if (!application) {
    throw new Error("Bewerbung nicht gefunden.");
  }

  if (application.status === status) {
    return;
  }

  const nextPosition = await getNextPosition(supabase, user.id, status, id);

  const { error } = await supabase
    .from("applications")
    .update({
      status,
      position_in_column: nextPosition,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating application status from detail:", error);
    throw new Error("Status konnte nicht aktualisiert werden.");
  }

  revalidateApplicationPaths([id]);
  return {
    positionInColumn: nextPosition,
  };
}

export async function restoreApplicationSnapshots(
  snapshots: Pick<
    ApplicationOverview,
    | "id"
    | "status"
    | "position_in_column"
    | "date_saved"
    | "date_applied"
    | "date_interview"
    | "date_offer"
    | "date_rejected"
  >[]
) {
  if (snapshots.length === 0) {
    return;
  }

  const { supabase, user } = await getAuthenticatedClient();
  const snapshotIds = snapshots.map((snapshot) => snapshot.id);

  const { data: currentApplications, error: currentError } = await supabase
    .from("applications")
    .select("id, status")
    .in("id", snapshotIds)
    .eq("user_id", user.id);

  if (currentError) {
    console.error("Error fetching snapshots for restore:", currentError);
    throw new Error("Status konnte nicht wiederhergestellt werden.");
  }

  const currentStatusById = new Map(
    (currentApplications ?? []).map((application) => [
      application.id,
      application.status as ApplicationStatus,
    ])
  );

  const updateTimestamp = new Date().toISOString();
  const updates = await Promise.all(
    snapshots.map((snapshot) =>
      supabase
        .from("applications")
        .update({
          status: snapshot.status,
          position_in_column: snapshot.position_in_column,
          updated_at: updateTimestamp,
        })
        .eq("id", snapshot.id)
        .eq("user_id", user.id)
    )
  );

  const updateErrors = updates.filter((result) => result.error);

  if (updateErrors.length > 0) {
    console.error("Error restoring application snapshots:", updateErrors);
    throw new Error("Status konnte nicht wiederhergestellt werden.");
  }

  const milestoneUpdates = await Promise.all(
    snapshots.map((snapshot) =>
      supabase
        .from("applications")
        .update({
          date_saved: snapshot.date_saved,
          date_applied: snapshot.date_applied,
          date_interview: snapshot.date_interview,
          date_offer: snapshot.date_offer,
          date_rejected: snapshot.date_rejected,
          updated_at: updateTimestamp,
        })
        .eq("id", snapshot.id)
        .eq("user_id", user.id)
    )
  );

  const milestoneErrors = milestoneUpdates.filter((result) => result.error);

  if (milestoneErrors.length > 0) {
    console.error(
      "Error restoring application milestone dates:",
      milestoneErrors
    );
    throw new Error("Status konnte nicht wiederhergestellt werden.");
  }

  await Promise.all(
    snapshots.map(async (snapshot) => {
      const currentStatus = currentStatusById.get(snapshot.id);

      if (!currentStatus || currentStatus === snapshot.status) {
        return;
      }

      await deleteRecentStatusChangeActivities(
        supabase,
        user.id,
        snapshot.id,
        snapshot.status,
        currentStatus
      );
    })
  );

  revalidateApplicationPaths(snapshotIds);
}

export async function undoImportedContactCreation(
  applicationId: string,
  contactId: string
) {
  const { supabase, user } = await getAuthenticatedClient();

  const { data: contact, error: contactError } = await supabase
    .from("application_contacts")
    .select("id, full_name")
    .eq("id", contactId)
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (contactError) {
    console.error("Error loading imported contact for undo:", contactError);
    throw new Error("Kontakt konnte nicht rückgängig gemacht werden.");
  }

  if (!contact) {
    revalidateApplicationPaths([applicationId]);
    return;
  }

  const { error: deleteContactError } = await supabase
    .from("application_contacts")
    .delete()
    .eq("id", contactId)
    .eq("application_id", applicationId)
    .eq("user_id", user.id);

  if (deleteContactError) {
    console.error("Error deleting imported contact during undo:", deleteContactError);
    throw new Error("Kontakt konnte nicht rückgängig gemacht werden.");
  }

  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("id, metadata")
    .eq("user_id", user.id)
    .eq("application_id", applicationId)
    .eq("activity_type", "contact_added")
    .order("created_at", { ascending: false })
    .limit(5);

  if (activitiesError) {
    console.error("Error loading contact activities for undo:", activitiesError);
  } else {
    const matchingActivity = (activities ?? []).find((activity) => {
      const metadata = activity.metadata as ActivityMetadata | null;
      return metadata?.contact_name === contact.full_name;
    });

    if (matchingActivity) {
      const { error: deleteActivityError } = await supabase
        .from("activities")
        .delete()
        .eq("id", matchingActivity.id)
        .eq("user_id", user.id);

      if (deleteActivityError) {
        console.error(
          "Error deleting imported contact activity during undo:",
          deleteActivityError
        );
      }
    }
  }

  revalidateApplicationPaths([applicationId]);
}

export async function updateApplicationNotes(id: string, notes: string) {
  const { supabase, user } = await getAuthenticatedClient();
  const trimmedNotes = notes.trim();

  const { data: current, error: currentError } = await supabase
    .from("applications")
    .select("notes")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (currentError) {
    console.error("Error fetching current application notes:", currentError);
    throw new Error("Notizen konnten nicht geladen werden.");
  }

  const existingNotes = current?.notes?.trim() || "";

  const { data, error } = await supabase
    .from("applications")
    .update({
      notes: trimmedNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating application notes:", error);
    throw new Error("Notizen konnten nicht gespeichert werden.");
  }

  if (trimmedNotes && trimmedNotes !== existingNotes) {
    await insertActivity(supabase, {
      userId: user.id,
      applicationId: id,
      activityType: "note_added",
      title: existingNotes ? "Notiz aktualisiert" : "Notiz hinzugefügt",
      metadata: {
        note_excerpt: buildExcerpt(trimmedNotes),
      },
    });
  }

  revalidateApplicationPaths([id]);
  return data as Application;
}

export async function updateApplicationDeadline(
  id: string,
  input: {
    deadline?: string | null;
    deadline_note?: string;
  }
) {
  const { supabase, user } = await getAuthenticatedClient();
  const deadline = normalizeDateOnly(input.deadline);
  const deadlineNote = normalizeOptionalString(input.deadline_note);

  const { data: current, error: currentError } = await supabase
    .from("applications")
    .select("deadline, deadline_note")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (currentError) {
    console.error("Error fetching application deadline:", currentError);
    throw new Error("Frist konnte nicht geladen werden.");
  }

  if (
    getDateOnlyValue(current?.deadline) === deadline &&
    current?.deadline_note === deadlineNote
  ) {
    return current as Pick<Application, "deadline" | "deadline_note">;
  }

  const { data, error } = await supabase
    .from("applications")
    .update({
      deadline,
      deadline_note: deadlineNote,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating application deadline:", error);
    throw new Error("Frist konnte nicht gespeichert werden.");
  }

  if (deadline) {
    await insertActivity(supabase, {
      userId: user.id,
      applicationId: id,
      activityType: "deadline_set",
      title: current?.deadline ? "Frist aktualisiert" : "Frist gesetzt",
      metadata: {
        deadline,
        deadline_note: deadlineNote || undefined,
      },
    });
  }

  revalidateApplicationPaths([id]);
  return data as Application;
}

export async function updateApplicationInterview(
  id: string,
  input: {
    next_interview_at?: string | null;
    interview_format?: string;
    interview_location?: string;
    interview_prep?: string;
  }
) {
  const { supabase, user } = await getAuthenticatedClient();
  const nextInterviewAt = normalizeDateTimeValue(input.next_interview_at);
  const interviewFormat = normalizeOptionalString(input.interview_format);
  const interviewLocation = normalizeOptionalString(input.interview_location);
  const interviewPrep = normalizeOptionalString(input.interview_prep);

  const { data: current, error: currentError } = await supabase
    .from("applications")
    .select(
      "next_interview_at, interview_format, interview_location, interview_prep"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (currentError) {
    console.error("Error fetching application interview:", currentError);
    throw new Error("Gespräch konnte nicht geladen werden.");
  }

  if (
    current?.next_interview_at === nextInterviewAt &&
    current?.interview_format === interviewFormat &&
    current?.interview_location === interviewLocation &&
    current?.interview_prep === interviewPrep
  ) {
    return current as Pick<
      Application,
      | "next_interview_at"
      | "interview_format"
      | "interview_location"
      | "interview_prep"
    >;
  }

  const { data, error } = await supabase
    .from("applications")
    .update({
      next_interview_at: nextInterviewAt,
      interview_format: interviewFormat,
      interview_location: interviewLocation,
      interview_prep: interviewPrep,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating application interview:", error);
    throw new Error("Gespräch konnte nicht gespeichert werden.");
  }

  if (nextInterviewAt) {
    await insertActivity(supabase, {
      userId: user.id,
      applicationId: id,
      activityType: "interview_scheduled",
      title: current?.next_interview_at ? "Gespräch aktualisiert" : "Gespräch geplant",
      metadata: {
        interview_at: nextInterviewAt,
        interview_format: interviewFormat || undefined,
        interview_location: interviewLocation || undefined,
      },
    });
  }

  revalidateApplicationPaths([id]);
  return data as Application;
}

export async function reorderApplications(
  updates: { id: string; position_in_column: number; status: ApplicationStatus }[]
) {
  const { supabase, user } = await getAuthenticatedClient();

  const promises = updates.map((update) =>
    supabase
      .from("applications")
      .update({
        position_in_column: update.position_in_column,
        status: update.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", update.id)
      .eq("user_id", user.id)
  );

  const results = await Promise.all(promises);
  const errors = results.filter((result) => result.error);

  if (errors.length > 0) {
    console.error("Error reordering applications:", errors);
    throw new Error("Reihenfolge konnte nicht aktualisiert werden.");
  }

  revalidateApplicationPaths(updates.map((update) => update.id));
}

export async function createApplicationContact(
  applicationId: string,
  input: CreateApplicationContactInput
) {
  const { supabase, user } = await getAuthenticatedClient();
  const payload = normalizeContactInput(input);

  if (!payload.full_name) {
    throw new Error("Name ist erforderlich.");
  }

  if (payload.is_primary) {
    const { error: resetError } = await supabase
      .from("application_contacts")
      .update({ is_primary: false, updated_at: new Date().toISOString() })
      .eq("application_id", applicationId)
      .eq("user_id", user.id);

    if (resetError) {
      console.error("Error resetting primary contact:", resetError);
      throw new Error("Kontakt konnte nicht vorbereitet werden.");
    }
  }

  const { data, error } = await supabase
    .from("application_contacts")
    .insert({
      user_id: user.id,
      application_id: applicationId,
      full_name: payload.full_name,
      role_title: payload.role_title,
      email: payload.email,
      phone: payload.phone,
      linkedin_url: payload.linkedin_url,
      notes: payload.notes,
      is_primary: payload.is_primary,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating application contact:", error);
    throw new Error("Kontakt konnte nicht gespeichert werden.");
  }

  await insertActivity(supabase, {
    userId: user.id,
    applicationId,
    activityType: "contact_added",
    title: `Kontakt hinzugefügt: ${data.full_name}`,
    metadata: {
      contact_name: data.full_name,
      contact_role: data.role_title || undefined,
    },
  });

  revalidateApplicationPaths([applicationId]);
  return data as ApplicationContact;
}

export async function updateApplicationContact(
  id: string,
  applicationId: string,
  input: CreateApplicationContactInput
) {
  const { supabase, user } = await getAuthenticatedClient();
  const payload = normalizeContactInput(input);

  if (!payload.full_name) {
    throw new Error("Name ist erforderlich.");
  }

  const { data: current, error: currentError } = await supabase
    .from("application_contacts")
    .select("*")
    .eq("id", id)
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (currentError) {
    console.error("Error fetching contact for update:", currentError);
    throw new Error("Kontakt konnte nicht geladen werden.");
  }

  if (!current) {
    throw new Error("Kontakt nicht gefunden.");
  }

  if (contactMatchesInput(current as ApplicationContact, payload)) {
    return current as ApplicationContact;
  }

  if (payload.is_primary) {
    const { error: resetError } = await supabase
      .from("application_contacts")
      .update({ is_primary: false, updated_at: new Date().toISOString() })
      .eq("application_id", applicationId)
      .eq("user_id", user.id)
      .neq("id", id);

    if (resetError) {
      console.error("Error resetting primary contact during update:", resetError);
      throw new Error("Kontakt konnte nicht vorbereitet werden.");
    }
  }

  const { data, error } = await supabase
    .from("application_contacts")
    .update({
      full_name: payload.full_name,
      role_title: payload.role_title,
      email: payload.email,
      phone: payload.phone,
      linkedin_url: payload.linkedin_url,
      notes: payload.notes,
      is_primary: payload.is_primary,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating application contact:", error);
    throw new Error("Kontakt konnte nicht aktualisiert werden.");
  }

  await insertActivity(supabase, {
    userId: user.id,
    applicationId,
    activityType: "contact_updated",
    title: `Kontakt aktualisiert: ${data.full_name}`,
    metadata: {
      contact_name: data.full_name,
      contact_role: data.role_title || undefined,
    },
  });

  revalidateApplicationPaths([applicationId]);
  return data as ApplicationContact;
}

export async function deleteApplicationContact(id: string, applicationId: string) {
  const { supabase, user } = await getAuthenticatedClient();

  const { error } = await supabase
    .from("application_contacts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting application contact:", error);
    throw new Error("Kontakt konnte nicht entfernt werden.");
  }

  revalidateApplicationPaths([applicationId]);
}

export async function createApplicationDocument(
  applicationId: string,
  input: CreateApplicationDocumentInput
) {
  const { supabase, user } = await getAuthenticatedClient();
  const payload = normalizeDocumentInput(input);

  if (!payload.title || !payload.document_url) {
    throw new Error("Titel und Link sind erforderlich.");
  }

  const { data, error } = await supabase
    .from("application_documents")
    .insert({
      user_id: user.id,
      application_id: applicationId,
      title: payload.title,
      document_type: payload.document_type,
      document_url: payload.document_url,
      version_label: payload.version_label,
      notes: payload.notes,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating application document:", error);
    throw new Error("Dokument konnte nicht gespeichert werden.");
  }

  await insertActivity(supabase, {
    userId: user.id,
    applicationId,
    activityType: "document_uploaded",
    title: `Dokument hinzugefügt: ${data.title}`,
    metadata: {
      document_title: data.title,
      document_type: data.document_type,
      version_label: data.version_label || undefined,
    },
  });

  revalidateApplicationPaths([applicationId]);
  return data as ApplicationDocument;
}

export async function updateApplicationDocument(
  id: string,
  applicationId: string,
  input: CreateApplicationDocumentInput
) {
  const { supabase, user } = await getAuthenticatedClient();
  const payload = normalizeDocumentInput(input);

  if (!payload.title || !payload.document_url) {
    throw new Error("Titel und Link sind erforderlich.");
  }

  const { data: current, error: currentError } = await supabase
    .from("application_documents")
    .select("*")
    .eq("id", id)
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (currentError) {
    console.error("Error fetching document for update:", currentError);
    throw new Error("Dokument konnte nicht geladen werden.");
  }

  if (!current) {
    throw new Error("Dokument nicht gefunden.");
  }

  if (documentMatchesInput(current as ApplicationDocument, payload)) {
    return current as ApplicationDocument;
  }

  const { data, error } = await supabase
    .from("application_documents")
    .update({
      title: payload.title,
      document_type: payload.document_type,
      document_url: payload.document_url,
      version_label: payload.version_label,
      notes: payload.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating application document:", error);
    throw new Error("Dokument konnte nicht aktualisiert werden.");
  }

  await insertActivity(supabase, {
    userId: user.id,
    applicationId,
    activityType: "document_updated",
    title: `Dokument aktualisiert: ${data.title}`,
    metadata: {
      document_title: data.title,
      document_type: data.document_type,
      version_label: data.version_label || undefined,
    },
  });

  revalidateApplicationPaths([applicationId]);
  return data as ApplicationDocument;
}

export async function deleteApplicationDocument(id: string, applicationId: string) {
  const { supabase, user } = await getAuthenticatedClient();

  const { error } = await supabase
    .from("application_documents")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting application document:", error);
    throw new Error("Dokument konnte nicht entfernt werden.");
  }

  revalidateApplicationPaths([applicationId]);
}

export async function deleteApplication(id: string) {
  const { supabase, user } = await getAuthenticatedClient();

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting application:", error);
    throw new Error("Bewerbung konnte nicht geloescht werden.");
  }

  revalidateApplicationPaths([id]);
}
