export type ApplicationDocumentType =
  | "lebenslauf"
  | "anschreiben"
  | "portfolio"
  | "arbeitsprobe"
  | "zeugnis"
  | "sonstiges";

export interface ApplicationContact {
  id: string;
  user_id: string;
  application_id: string;
  full_name: string;
  role_title: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  notes: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationContactInput {
  full_name: string;
  role_title?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  notes?: string;
  is_primary?: boolean;
}

export interface ApplicationDocument {
  id: string;
  user_id: string;
  application_id: string;
  title: string;
  document_type: ApplicationDocumentType;
  document_url: string;
  version_label: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationDocumentInput {
  title: string;
  document_type: ApplicationDocumentType;
  document_url: string;
  version_label?: string;
  notes?: string;
}
