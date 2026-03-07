import type { ApplicationStatus } from "@/lib/utils/constants";

export interface Application {
  id: string;
  user_id: string;
  company_id: string | null;
  company_name: string;
  role_title: string;
  location: string | null;
  job_url: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_note: string | null;
  status: ApplicationStatus;
  position_in_column: number;
  date_saved: string;
  date_applied: string | null;
  date_interview: string | null;
  date_offer: string | null;
  date_rejected: string | null;
  deadline: string | null;
  deadline_note: string | null;
  next_interview_at: string | null;
  interview_format: string | null;
  interview_location: string | null;
  interview_prep: string | null;
  description: string | null;
  requirements: string[] | null;
  benefits: string[] | null;
  employment_type: string | null;
  remote_policy: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ApplicationOverview = Pick<
  Application,
  | "id"
  | "user_id"
  | "company_name"
  | "role_title"
  | "location"
  | "job_url"
  | "salary_min"
  | "salary_max"
  | "salary_note"
  | "status"
  | "position_in_column"
  | "date_saved"
  | "date_applied"
  | "date_interview"
  | "date_offer"
  | "date_rejected"
  | "deadline"
  | "next_interview_at"
  | "employment_type"
  | "remote_policy"
  | "created_at"
  | "updated_at"
>;

export interface CreateApplicationInput {
  company_name: string;
  role_title: string;
  location?: string;
  job_url?: string;
  salary_min?: number;
  salary_max?: number;
  salary_note?: string;
  status?: ApplicationStatus;
  deadline?: string;
  description?: string;
  employment_type?: string;
  remote_policy?: string;
  notes?: string;
}
