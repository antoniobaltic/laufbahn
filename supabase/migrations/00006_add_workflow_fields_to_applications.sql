ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS deadline_note TEXT,
  ADD COLUMN IF NOT EXISTS next_interview_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS interview_format TEXT,
  ADD COLUMN IF NOT EXISTS interview_location TEXT,
  ADD COLUMN IF NOT EXISTS interview_prep TEXT;
