-- ============================================================
-- APPLICATION DETAIL ENTITIES
-- Contacts and linked documents per application
-- ============================================================

CREATE TABLE public.application_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role_title TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  notes TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_application_contacts_application
  ON public.application_contacts(application_id, created_at DESC);
CREATE INDEX idx_application_contacts_user
  ON public.application_contacts(user_id);
CREATE UNIQUE INDEX idx_application_contacts_primary
  ON public.application_contacts(application_id)
  WHERE is_primary = true;

ALTER TABLE public.application_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own application contacts"
  ON public.application_contacts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own application contacts"
  ON public.application_contacts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own application contacts"
  ON public.application_contacts FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own application contacts"
  ON public.application_contacts FOR DELETE
  USING (user_id = auth.uid());

CREATE TABLE public.application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL
    CHECK (document_type IN (
      'lebenslauf',
      'anschreiben',
      'portfolio',
      'arbeitsprobe',
      'zeugnis',
      'sonstiges'
    )),
  document_url TEXT NOT NULL,
  version_label TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_application_documents_application
  ON public.application_documents(application_id, created_at DESC);
CREATE INDEX idx_application_documents_user
  ON public.application_documents(user_id);

ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own application documents"
  ON public.application_documents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own application documents"
  ON public.application_documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own application documents"
  ON public.application_documents FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own application documents"
  ON public.application_documents FOR DELETE
  USING (user_id = auth.uid());
