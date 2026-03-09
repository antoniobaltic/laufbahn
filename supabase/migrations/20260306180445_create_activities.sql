-- ============================================================
-- ACTIVITIES TABLE
-- Timeline of events per application
-- ============================================================
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL
    CHECK (activity_type IN (
      'status_change', 'note_added', 'document_uploaded',
      'contact_added', 'email_received', 'email_sent',
      'interview_scheduled', 'deadline_set', 'created'
    )),
  title TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_activities_application ON public.activities(application_id);
CREATE INDEX idx_activities_user ON public.activities(user_id);
CREATE INDEX idx_activities_created ON public.activities(created_at DESC);

-- RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities"
  ON public.activities FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own activities"
  ON public.activities FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Auto-log status changes
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.activities (user_id, application_id, activity_type, title, metadata)
    VALUES (
      NEW.user_id,
      NEW.id,
      'status_change',
      'Status geaendert: ' || OLD.status || ' -> ' || NEW.status,
      jsonb_build_object('old_status', OLD.status::text, 'new_status', NEW.status::text)
    );

    -- Update date fields based on new status
    CASE NEW.status
      WHEN 'beworben' THEN
        NEW.date_applied = COALESCE(NEW.date_applied, now());
      WHEN 'im_gespraech' THEN
        NEW.date_interview = COALESCE(NEW.date_interview, now());
      WHEN 'angebot' THEN
        NEW.date_offer = COALESCE(NEW.date_offer, now());
      WHEN 'abgelehnt' THEN
        NEW.date_rejected = COALESCE(NEW.date_rejected, now());
      ELSE
        NULL;
    END CASE;
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_application_status_change
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_status_change();

-- ============================================================
-- Enable fuzzy matching for duplicate detection
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;
