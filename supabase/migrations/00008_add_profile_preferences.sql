ALTER TABLE public.profiles
  ADD COLUMN avatar_color TEXT NOT NULL DEFAULT 'dark'
    CHECK (avatar_color IN ('dark', 'orange', 'blue', 'green', 'rose', 'sand')),
  ADD COLUMN deadline_reminder_days INTEGER NOT NULL DEFAULT 3
    CHECK (deadline_reminder_days IN (1, 2, 3, 5, 7)),
  ADD COLUMN interview_reminder_hours INTEGER NOT NULL DEFAULT 48
    CHECK (interview_reminder_hours IN (6, 24, 48, 72));
