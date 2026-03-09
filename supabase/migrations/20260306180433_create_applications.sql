-- ============================================================
-- APPLICATIONS TABLE
-- Core table: each row is one job application
-- ============================================================
CREATE TYPE application_status AS ENUM (
  'gemerkt',
  'beworben',
  'im_gespraech',
  'angebot',
  'abgelehnt',
  'ghosted'
);

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID,
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  location TEXT,
  job_url TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_note TEXT,
  status application_status NOT NULL DEFAULT 'gemerkt',
  position_in_column INTEGER NOT NULL DEFAULT 0,
  date_saved TIMESTAMPTZ DEFAULT now(),
  date_applied TIMESTAMPTZ,
  date_interview TIMESTAMPTZ,
  date_offer TIMESTAMPTZ,
  date_rejected TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  description TEXT,
  requirements TEXT[],
  benefits TEXT[],
  employment_type TEXT,
  remote_policy TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_user_status ON public.applications(user_id, status);

-- RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own applications"
  ON public.applications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own applications"
  ON public.applications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own applications"
  ON public.applications FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- Free tier limit enforcement
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_application_limit()
RETURNS TRIGGER AS $$
DECLARE
  app_count INTEGER;
  user_plan TEXT;
BEGIN
  SELECT subscription_plan INTO user_plan
  FROM public.profiles WHERE id = NEW.user_id;

  IF user_plan = 'free' THEN
    SELECT COUNT(*) INTO app_count
    FROM public.applications
    WHERE user_id = NEW.user_id;

    IF app_count >= 10 THEN
      RAISE EXCEPTION 'Free plan limit reached. Upgrade to premium for unlimited applications.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_app_limit_before_insert
  BEFORE INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.check_application_limit();
