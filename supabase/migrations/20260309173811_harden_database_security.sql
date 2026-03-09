CREATE SCHEMA IF NOT EXISTS extensions;

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );

  RETURN NEW;
END;
$$;

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
  SELECT subscription_plan INTO user_plan
  FROM public.profiles
  WHERE id = NEW.user_id;

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

CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;
