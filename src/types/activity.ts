import type { ApplicationStatus } from "@/lib/utils/constants";
import type { ApplicationDocumentType } from "@/types/application-detail";

export type ActivityType =
  | "status_change"
  | "note_added"
  | "document_uploaded"
  | "document_updated"
  | "document_removed"
  | "contact_added"
  | "contact_updated"
  | "email_received"
  | "email_sent"
  | "interview_scheduled"
  | "deadline_set"
  | "created";

export interface ActivityMetadata {
  old_status?: ApplicationStatus;
  new_status?: ApplicationStatus;
  note_excerpt?: string;
  deadline?: string;
  deadline_note?: string;
  contact_name?: string;
  contact_role?: string;
  document_title?: string;
  document_type?: ApplicationDocumentType;
  version_label?: string;
  interview_at?: string;
  interview_format?: string;
  interview_location?: string;
  [key: string]: unknown;
}

export interface Activity {
  id: string;
  user_id: string;
  application_id: string;
  activity_type: ActivityType;
  title: string;
  metadata: ActivityMetadata | null;
  created_at: string;
}
