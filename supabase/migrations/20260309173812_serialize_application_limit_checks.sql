CREATE OR REPLACE FUNCTION public.check_application_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  app_count INTEGER;
  user_plan TEXT;
BEGIN
  SELECT subscription_plan
  INTO user_plan
  FROM public.profiles
  WHERE id = NEW.user_id
  FOR UPDATE;

  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;

  IF user_plan = 'free' THEN
    SELECT COUNT(*) INTO app_count
    FROM public.applications
    WHERE user_id = NEW.user_id;

    IF app_count >= 10 THEN
      RAISE EXCEPTION 'Im kostenlosen Tarif kannst du bis zu 10 Bewerbungen anlegen. Für unbegrenzte Einträge brauchst du Premium.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
