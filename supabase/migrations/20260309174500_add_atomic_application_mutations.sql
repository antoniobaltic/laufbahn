CREATE OR REPLACE FUNCTION public.reorder_applications(p_updates jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  payload_count integer;
  owned_count integer;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Nicht angemeldet.';
  END IF;

  SELECT COUNT(*)
  INTO payload_count
  FROM jsonb_to_recordset(COALESCE(p_updates, '[]'::jsonb)) AS item(
    id uuid,
    position_in_column integer,
    status text
  );

  IF payload_count = 0 THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(COALESCE(p_updates, '[]'::jsonb)) AS item(
      id uuid,
      position_in_column integer,
      status text
    )
    WHERE item.id IS NULL
      OR item.position_in_column IS NULL
      OR item.status IS NULL
  ) THEN
    RAISE EXCEPTION 'Ungueltige Bewerbungsdaten.';
  END IF;

  IF (
    SELECT COUNT(DISTINCT item.id)
    FROM jsonb_to_recordset(COALESCE(p_updates, '[]'::jsonb)) AS item(
      id uuid,
      position_in_column integer,
      status text
    )
  ) <> payload_count THEN
    RAISE EXCEPTION 'Doppelte Bewerbungen sind nicht erlaubt.';
  END IF;

  SELECT COUNT(*)
  INTO owned_count
  FROM public.applications AS application
  JOIN jsonb_to_recordset(COALESCE(p_updates, '[]'::jsonb)) AS item(
    id uuid,
    position_in_column integer,
    status text
  )
    ON application.id = item.id
  WHERE application.user_id = current_user_id;

  IF owned_count <> payload_count THEN
    RAISE EXCEPTION 'Mindestens eine Bewerbung wurde nicht gefunden.';
  END IF;

  PERFORM 1
  FROM public.applications AS application
  JOIN jsonb_to_recordset(COALESCE(p_updates, '[]'::jsonb)) AS item(
    id uuid,
    position_in_column integer,
    status text
  )
    ON application.id = item.id
  WHERE application.user_id = current_user_id
  FOR UPDATE;

  UPDATE public.applications AS application
  SET
    position_in_column = item.position_in_column,
    status = item.status::public.application_status,
    updated_at = now()
  FROM jsonb_to_recordset(COALESCE(p_updates, '[]'::jsonb)) AS item(
    id uuid,
    position_in_column integer,
    status text
  )
  WHERE application.id = item.id
    AND application.user_id = current_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_application_snapshots(p_snapshots jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  payload_count integer;
  owned_count integer;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Nicht angemeldet.';
  END IF;

  SELECT COUNT(*)
  INTO payload_count
  FROM jsonb_to_recordset(COALESCE(p_snapshots, '[]'::jsonb)) AS item(
    id uuid,
    status text,
    position_in_column integer,
    date_saved timestamptz,
    date_applied timestamptz,
    date_interview timestamptz,
    date_offer timestamptz,
    date_rejected timestamptz
  );

  IF payload_count = 0 THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(COALESCE(p_snapshots, '[]'::jsonb)) AS item(
      id uuid,
      status text,
      position_in_column integer,
      date_saved timestamptz,
      date_applied timestamptz,
      date_interview timestamptz,
      date_offer timestamptz,
      date_rejected timestamptz
    )
    WHERE item.id IS NULL
      OR item.status IS NULL
      OR item.position_in_column IS NULL
  ) THEN
    RAISE EXCEPTION 'Ungueltige Wiederherstellungsdaten.';
  END IF;

  IF (
    SELECT COUNT(DISTINCT item.id)
    FROM jsonb_to_recordset(COALESCE(p_snapshots, '[]'::jsonb)) AS item(
      id uuid,
      status text,
      position_in_column integer,
      date_saved timestamptz,
      date_applied timestamptz,
      date_interview timestamptz,
      date_offer timestamptz,
      date_rejected timestamptz
    )
  ) <> payload_count THEN
    RAISE EXCEPTION 'Doppelte Bewerbungen sind nicht erlaubt.';
  END IF;

  SELECT COUNT(*)
  INTO owned_count
  FROM public.applications AS application
  JOIN jsonb_to_recordset(COALESCE(p_snapshots, '[]'::jsonb)) AS item(
    id uuid,
    status text,
    position_in_column integer,
    date_saved timestamptz,
    date_applied timestamptz,
    date_interview timestamptz,
    date_offer timestamptz,
    date_rejected timestamptz
  )
    ON application.id = item.id
  WHERE application.user_id = current_user_id;

  IF owned_count <> payload_count THEN
    RAISE EXCEPTION 'Mindestens eine Bewerbung wurde nicht gefunden.';
  END IF;

  PERFORM 1
  FROM public.applications AS application
  JOIN jsonb_to_recordset(COALESCE(p_snapshots, '[]'::jsonb)) AS item(
    id uuid,
    status text,
    position_in_column integer,
    date_saved timestamptz,
    date_applied timestamptz,
    date_interview timestamptz,
    date_offer timestamptz,
    date_rejected timestamptz
  )
    ON application.id = item.id
  WHERE application.user_id = current_user_id
  FOR UPDATE;

  UPDATE public.applications AS application
  SET
    status = item.status::public.application_status,
    position_in_column = item.position_in_column,
    date_saved = item.date_saved,
    date_applied = item.date_applied,
    date_interview = item.date_interview,
    date_offer = item.date_offer,
    date_rejected = item.date_rejected,
    updated_at = now()
  FROM jsonb_to_recordset(COALESCE(p_snapshots, '[]'::jsonb)) AS item(
    id uuid,
    status text,
    position_in_column integer,
    date_saved timestamptz,
    date_applied timestamptz,
    date_interview timestamptz,
    date_offer timestamptz,
    date_rejected timestamptz
  )
  WHERE application.id = item.id
    AND application.user_id = current_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_primary_application_contact(
  p_application_id uuid,
  p_full_name text,
  p_role_title text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_linkedin_url text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  result_contact public.application_contacts;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Nicht angemeldet.';
  END IF;

  IF p_full_name IS NULL OR btrim(p_full_name) = '' THEN
    RAISE EXCEPTION 'Name ist erforderlich.';
  END IF;

  PERFORM 1
  FROM public.applications
  WHERE id = p_application_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bewerbung nicht gefunden.';
  END IF;

  PERFORM 1
  FROM public.application_contacts
  WHERE application_id = p_application_id
    AND user_id = current_user_id
  FOR UPDATE;

  UPDATE public.application_contacts
  SET
    is_primary = false,
    updated_at = now()
  WHERE application_id = p_application_id
    AND user_id = current_user_id
    AND is_primary = true;

  INSERT INTO public.application_contacts (
    user_id,
    application_id,
    full_name,
    role_title,
    email,
    phone,
    linkedin_url,
    notes,
    is_primary
  )
  VALUES (
    current_user_id,
    p_application_id,
    btrim(p_full_name),
    NULLIF(btrim(p_role_title), ''),
    NULLIF(btrim(p_email), ''),
    NULLIF(btrim(p_phone), ''),
    NULLIF(btrim(p_linkedin_url), ''),
    NULLIF(btrim(p_notes), ''),
    true
  )
  RETURNING *
  INTO result_contact;

  RETURN to_jsonb(result_contact);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_application_contact_atomic(
  p_contact_id uuid,
  p_application_id uuid,
  p_full_name text,
  p_role_title text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_linkedin_url text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_is_primary boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  result_contact public.application_contacts;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Nicht angemeldet.';
  END IF;

  IF p_full_name IS NULL OR btrim(p_full_name) = '' THEN
    RAISE EXCEPTION 'Name ist erforderlich.';
  END IF;

  PERFORM 1
  FROM public.applications
  WHERE id = p_application_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bewerbung nicht gefunden.';
  END IF;

  PERFORM 1
  FROM public.application_contacts
  WHERE id = p_contact_id
    AND application_id = p_application_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kontakt nicht gefunden.';
  END IF;

  IF p_is_primary THEN
    UPDATE public.application_contacts
    SET
      is_primary = false,
      updated_at = now()
    WHERE application_id = p_application_id
      AND user_id = current_user_id
      AND id <> p_contact_id
      AND is_primary = true;
  END IF;

  UPDATE public.application_contacts
  SET
    full_name = btrim(p_full_name),
    role_title = NULLIF(btrim(p_role_title), ''),
    email = NULLIF(btrim(p_email), ''),
    phone = NULLIF(btrim(p_phone), ''),
    linkedin_url = NULLIF(btrim(p_linkedin_url), ''),
    notes = NULLIF(btrim(p_notes), ''),
    is_primary = COALESCE(p_is_primary, false),
    updated_at = now()
  WHERE id = p_contact_id
    AND application_id = p_application_id
    AND user_id = current_user_id
  RETURNING *
  INTO result_contact;

  RETURN to_jsonb(result_contact);
END;
$$;
