export type ReminderType = "deadline" | "interview" | "follow_up";

export type ReminderUrgency = "high" | "medium" | "low";

export interface ReminderItem {
  id: string;
  applicationId: string;
  href: string;
  companyName: string;
  roleTitle: string;
  type: ReminderType;
  urgency: ReminderUrgency;
  title: string;
  body: string;
  dueAt: string;
  ctaLabel: string;
  meta?: string;
}
