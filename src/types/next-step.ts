export type NextStepPromptType =
  | "follow_up"
  | "interview_prep"
  | "deadline_review";

export interface NextStepPrompt {
  id: string;
  applicationId: string;
  href: string;
  companyName: string;
  roleTitle: string;
  type: NextStepPromptType;
  title: string;
  body: string;
  ctaLabel: string;
  dueAt: string;
  meta?: string;
}
