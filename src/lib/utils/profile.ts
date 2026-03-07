import type { AvatarColor } from "@/types/profile";

export const AVATAR_COLOR_OPTIONS: {
  value: AvatarColor;
  label: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}[] = [
  {
    value: "dark",
    label: "Dunkel",
    backgroundColor: "#141413",
    textColor: "#faf9f5",
    borderColor: "#2a2826",
  },
  {
    value: "orange",
    label: "Orange",
    backgroundColor: "#d97757",
    textColor: "#fffaf4",
    borderColor: "#e7a184",
  },
  {
    value: "blue",
    label: "Blau",
    backgroundColor: "#6a9bcc",
    textColor: "#f7fbff",
    borderColor: "#9fc0de",
  },
  {
    value: "green",
    label: "Grün",
    backgroundColor: "#788c5d",
    textColor: "#fbfdf7",
    borderColor: "#a2b18c",
  },
  {
    value: "rose",
    label: "Rosé",
    backgroundColor: "#b56d7a",
    textColor: "#fff8f9",
    borderColor: "#d39aa4",
  },
  {
    value: "sand",
    label: "Sand",
    backgroundColor: "#9b8873",
    textColor: "#fffaf5",
    borderColor: "#c3b29f",
  },
];

export const DEADLINE_REMINDER_OPTIONS = [
  { value: 1, label: "1 Tag vorher" },
  { value: 2, label: "2 Tage vorher" },
  { value: 3, label: "3 Tage vorher" },
  { value: 5, label: "5 Tage vorher" },
  { value: 7, label: "7 Tage vorher" },
];

export const INTERVIEW_REMINDER_OPTIONS = [
  { value: 6, label: "6 Stunden vorher" },
  { value: 24, label: "1 Tag vorher" },
  { value: 48, label: "2 Tage vorher" },
  { value: 72, label: "3 Tage vorher" },
];

export const DEFAULT_AVATAR_COLOR: AvatarColor = "dark";
export const DEFAULT_DEADLINE_REMINDER_DAYS = 3;
export const DEFAULT_INTERVIEW_REMINDER_HOURS = 48;

export function isAvatarColor(value: string): value is AvatarColor {
  return AVATAR_COLOR_OPTIONS.some((option) => option.value === value);
}

export function getAvatarColorOption(avatarColor?: AvatarColor | null) {
  return (
    AVATAR_COLOR_OPTIONS.find((option) => option.value === avatarColor) ||
    AVATAR_COLOR_OPTIONS[0]
  );
}

export function getDisplayName(
  fullName?: string | null,
  email?: string | null
) {
  const trimmedName = fullName?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  return email?.trim() || "Laufbahn";
}

export function getUserInitials(
  fullName?: string | null,
  email?: string | null
) {
  const trimmedName = fullName?.trim();

  if (trimmedName) {
    const parts = trimmedName.split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
  }

  const localPart = email?.split("@")[0] || "LB";
  return localPart.slice(0, 2).toUpperCase();
}

export function isValidDeadlineReminderDays(value: number) {
  return DEADLINE_REMINDER_OPTIONS.some((option) => option.value === value);
}

export function isValidInterviewReminderHours(value: number) {
  return INTERVIEW_REMINDER_OPTIONS.some((option) => option.value === value);
}
