export type SourceDocumentType = "lebenslauf" | "anschreiben";

export type SourceDocumentSourceKind =
  | "manual"
  | "import_docx"
  | "import_pdf"
  | "restore"
  | "variant";

export type SourceDocumentEditorMode = "guided" | "markdown";

export interface SourceDocument {
  id: string;
  user_id: string;
  parent_document_id: string | null;
  current_version_id: string | null;
  title: string;
  document_type: SourceDocumentType;
  tags: string[];
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface SourceDocumentVersion {
  id: string;
  user_id: string;
  document_id: string;
  source_version_id: string | null;
  version_number: number;
  version_label: string | null;
  markdown_content: string;
  plain_text: string;
  editor_mode: SourceDocumentEditorMode;
  change_note: string | null;
  source_kind: SourceDocumentSourceKind;
  created_at: string;
}

export interface LinkedApplicationSummary {
  id: string;
  company_name: string;
  role_title: string;
  status: string;
}

export interface ApplicationSourceDocument {
  id: string;
  user_id: string;
  application_id: string;
  source_document_id: string;
  source_document_version_id: string;
  document_type: SourceDocumentType;
  title_snapshot: string;
  version_number_snapshot: number;
  version_label_snapshot: string | null;
  markdown_snapshot: string;
  linked_at: string;
  updated_at: string;
  application?: LinkedApplicationSummary | null;
}

export interface SourceDocumentOverviewItem {
  document: SourceDocument;
  currentVersion: SourceDocumentVersion | null;
  usageCount: number;
  recentApplications: LinkedApplicationSummary[];
  childCount: number;
  parentTitle: string | null;
}

export interface SourceDocumentWorkspace {
  document: SourceDocument;
  currentVersion: SourceDocumentVersion | null;
  versions: SourceDocumentVersion[];
  usages: ApplicationSourceDocument[];
  childDocuments: SourceDocumentOverviewItem[];
  lineage: Pick<SourceDocument, "id" | "title" | "document_type">[];
}

export interface DocumentPickerOption {
  documentId: string;
  title: string;
  documentType: SourceDocumentType;
  tags: string[];
  currentVersionId: string;
  currentVersionNumber: number;
  currentVersionLabel: string | null;
  preview: string;
  usageCount: number;
}

export interface CreateSourceDocumentInput {
  title: string;
  document_type: SourceDocumentType;
  tags?: string[];
  parent_document_id?: string | null;
  markdown_content: string;
  version_label?: string;
  change_note?: string;
  editor_mode?: SourceDocumentEditorMode;
  source_kind?: SourceDocumentSourceKind;
  source_version_id?: string | null;
}

export interface UpdateSourceDocumentInput {
  title?: string;
  tags?: string[];
  markdown_content: string;
  version_label?: string;
  change_note?: string;
  editor_mode?: SourceDocumentEditorMode;
}

export interface LinkSourceDocumentToApplicationInput {
  application_id: string;
  source_document_id: string;
  source_document_version_id: string;
}

export interface ImportDocumentResult {
  markdown: string;
  plainText: string;
  warnings: string[];
  sourceKind: SourceDocumentSourceKind;
}
