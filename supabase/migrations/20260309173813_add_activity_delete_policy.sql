DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'activities'
      AND policyname = 'Users can delete own activities'
  ) THEN
    CREATE POLICY "Users can delete own activities"
      ON public.activities FOR DELETE
      USING (user_id = auth.uid());
  END IF;
END;
$$;
