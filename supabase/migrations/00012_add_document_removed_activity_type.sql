ALTER TABLE public.activities
  DROP CONSTRAINT IF EXISTS activities_activity_type_check;

ALTER TABLE public.activities
  ADD CONSTRAINT activities_activity_type_check
  CHECK (activity_type IN (
    'status_change',
    'note_added',
    'document_uploaded',
    'document_updated',
    'document_removed',
    'contact_added',
    'contact_updated',
    'email_received',
    'email_sent',
    'interview_scheduled',
    'deadline_set',
    'created'
  ));
