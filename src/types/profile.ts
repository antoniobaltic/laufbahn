export type AvatarColor =
  | "dark"
  | "orange"
  | "blue"
  | "green"
  | "rose"
  | "sand";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_color: AvatarColor;
  deadline_reminder_days: number;
  interview_reminder_hours: number;
}

export interface UpdateUserProfileInput {
  full_name?: string;
  avatar_color: AvatarColor;
  deadline_reminder_days: number;
  interview_reminder_hours: number;
}
