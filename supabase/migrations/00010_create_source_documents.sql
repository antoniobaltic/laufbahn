CREATE TABLE public.source_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_document_id UUID REFERENCES public.source_documents(id) ON DELETE SET NULL,
  current_version_id UUID,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL
    CHECK (document_type IN ('lebenslauf', 'anschreiben')),
  tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_source_documents_user
  ON public.source_documents(user_id, updated_at DESC);
CREATE INDEX idx_source_documents_parent
  ON public.source_documents(parent_document_id);
CREATE INDEX idx_source_documents_type
  ON public.source_documents(user_id, document_type);

CREATE TABLE public.source_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.source_documents(id) ON DELETE CASCADE,
  source_version_id UUID REFERENCES public.source_document_versions(id) ON DELETE SET NULL,
  version_number INTEGER NOT NULL,
  version_label TEXT,
  markdown_content TEXT NOT NULL,
  plain_text TEXT NOT NULL,
  editor_mode TEXT NOT NULL DEFAULT 'guided'
    CHECK (editor_mode IN ('guided', 'markdown')),
  change_note TEXT,
  source_kind TEXT NOT NULL DEFAULT 'manual'
    CHECK (source_kind IN (
      'manual',
      'import_docx',
      'import_pdf',
      'restore',
      'variant'
    )),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(document_id, version_number)
);

CREATE INDEX idx_source_document_versions_document
  ON public.source_document_versions(document_id, version_number DESC);
CREATE INDEX idx_source_document_versions_user
  ON public.source_document_versions(user_id, created_at DESC);

ALTER TABLE public.source_documents
  ADD CONSTRAINT source_documents_current_version_id_fkey
  FOREIGN KEY (current_version_id)
  REFERENCES public.source_document_versions(id)
  ON DELETE SET NULL;

CREATE TABLE public.application_source_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  source_document_id UUID NOT NULL REFERENCES public.source_documents(id) ON DELETE RESTRICT,
  source_document_version_id UUID NOT NULL REFERENCES public.source_document_versions(id) ON DELETE RESTRICT,
  document_type TEXT NOT NULL
    CHECK (document_type IN ('lebenslauf', 'anschreiben')),
  title_snapshot TEXT NOT NULL,
  version_number_snapshot INTEGER NOT NULL,
  version_label_snapshot TEXT,
  markdown_snapshot TEXT NOT NULL,
  linked_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(application_id, document_type)
);

CREATE INDEX idx_application_source_documents_application
  ON public.application_source_documents(application_id, document_type);
CREATE INDEX idx_application_source_documents_user
  ON public.application_source_documents(user_id, linked_at DESC);
CREATE INDEX idx_application_source_documents_document
  ON public.application_source_documents(source_document_id, source_document_version_id);

ALTER TABLE public.source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_source_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own source documents"
  ON public.source_documents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own source documents"
  ON public.source_documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own source documents"
  ON public.source_documents FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own source documents"
  ON public.source_documents FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own source document versions"
  ON public.source_document_versions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own source document versions"
  ON public.source_document_versions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own source document versions"
  ON public.source_document_versions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own source document versions"
  ON public.source_document_versions FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own application source documents"
  ON public.application_source_documents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own application source documents"
  ON public.application_source_documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own application source documents"
  ON public.application_source_documents FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own application source documents"
  ON public.application_source_documents FOR DELETE
  USING (user_id = auth.uid());
