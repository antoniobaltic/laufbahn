"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_AVATAR_COLOR,
  DEFAULT_DEADLINE_REMINDER_DAYS,
  DEFAULT_INTERVIEW_REMINDER_HOURS,
  isAvatarColor,
  isValidDeadlineReminderDays,
  isValidInterviewReminderHours,
} from "@/lib/utils/profile";
import type {
  UpdateUserProfileInput,
  UserProfile,
} from "@/types/profile";

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

function normalizeProfileRow(
  user: { id: string; email?: string | null },
  row?: Partial<UserProfile> | null
): UserProfile {
  return {
    id: user.id,
    email: row?.email || user.email || "",
    full_name: row?.full_name?.trim() || null,
    avatar_color:
      row?.avatar_color && isAvatarColor(row.avatar_color)
        ? row.avatar_color
        : DEFAULT_AVATAR_COLOR,
    deadline_reminder_days:
      typeof row?.deadline_reminder_days === "number" &&
      isValidDeadlineReminderDays(row.deadline_reminder_days)
        ? row.deadline_reminder_days
        : DEFAULT_DEADLINE_REMINDER_DAYS,
    interview_reminder_hours:
      typeof row?.interview_reminder_hours === "number" &&
      isValidInterviewReminderHours(row.interview_reminder_hours)
        ? row.interview_reminder_hours
        : DEFAULT_INTERVIEW_REMINDER_HOURS,
  };
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const { supabase, user } = await getAuthenticatedClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, avatar_color, deadline_reminder_days, interview_reminder_hours"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    return normalizeProfileRow(user, null);
  }

  return normalizeProfileRow(user, data as Partial<UserProfile> | null);
}

export async function updateCurrentProfile(input: UpdateUserProfileInput) {
  const { supabase, user } = await getAuthenticatedClient();
  const fullName = input.full_name?.trim() || null;
  const payload = {
    email: user.email || "",
    full_name: fullName,
    avatar_color: input.avatar_color,
    deadline_reminder_days: input.deadline_reminder_days,
    interview_reminder_hours: input.interview_reminder_hours,
    updated_at: new Date().toISOString(),
  };

  if (!isAvatarColor(input.avatar_color)) {
    throw new Error("Ungültige Farbe.");
  }

  if (!isValidDeadlineReminderDays(input.deadline_reminder_days)) {
    throw new Error("Ungültige Frist-Erinnerung.");
  }

  if (!isValidInterviewReminderHours(input.interview_reminder_hours)) {
    throw new Error("Ungültige Gesprächs-Erinnerung.");
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id)
    .select(
      "id, email, full_name, avatar_color, deadline_reminder_days, interview_reminder_hours"
    )
    .maybeSingle();

  if (updateError) {
    console.error("Error updating profile:", updateError);
    throw new Error("Profil konnte nicht gespeichert werden.");
  }

  let data = updatedProfile;

  if (!data) {
    const { data: insertedProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        ...payload,
      })
      .select(
        "id, email, full_name, avatar_color, deadline_reminder_days, interview_reminder_hours"
      )
      .single();

    if (insertError) {
      console.error("Error inserting missing profile:", insertError);
      throw new Error("Profil konnte nicht gespeichert werden.");
    }

    data = insertedProfile;
  }

  revalidatePath("/board");
  revalidatePath("/bewerbung");
  revalidatePath("/analytics");
  revalidatePath("/einstellungen");

  return normalizeProfileRow(user, data as Partial<UserProfile>);
}
