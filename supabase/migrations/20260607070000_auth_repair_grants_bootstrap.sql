-- Auth repair: explicit Data API grants, robust user bootstrap, and safe RLS policies.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles', 'user_roles', 'subscriptions', 'prompts',
    'queue_jobs', 'generated_files', 'usage_tracking', 'user_settings', 'job_logs'
  ]
  LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', table_name);
      EXECUTE format('GRANT ALL ON public.%I TO service_role', table_name);
    END IF;
  END LOOP;
END $$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.ensure_user_records(
  _user_id uuid,
  _email text DEFAULT NULL,
  _raw_meta jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name text;
  avatar text;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'user id is required';
  END IF;

  display_name := COALESCE(
    NULLIF(_raw_meta->>'display_name', ''),
    NULLIF(_raw_meta->>'full_name', ''),
    NULLIF(split_part(COALESCE(_email, ''), '@', 1), ''),
    'User'
  );
  avatar := COALESCE(NULLIF(_raw_meta->>'avatar_url', ''), NULLIF(_raw_meta->>'picture', ''));

  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (_user_id, display_name, avatar)
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (_user_id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.usage_tracking (user_id, day, prompts_used)
  VALUES (_user_id, CURRENT_DATE, 0)
  ON CONFLICT (user_id, day) DO NOTHING;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.ensure_user_records(uuid, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_records(uuid, text, jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.ensure_user_bootstrap()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  PERFORM public.ensure_user_records(
    auth.uid(),
    auth.jwt()->>'email',
    COALESCE(auth.jwt()->'user_metadata', '{}'::jsonb)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.ensure_user_bootstrap() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_user_bootstrap() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.ensure_user_records(NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data, '{}'::jsonb));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user bootstrap failed for auth user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users view own sub" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins manage subs" ON public.subscriptions;
CREATE POLICY "Users view own sub" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage subs" ON public.subscriptions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users own prompts" ON public.prompts;
CREATE POLICY "Users own prompts" ON public.prompts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users own jobs" ON public.queue_jobs;
CREATE POLICY "Users own jobs" ON public.queue_jobs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users own files" ON public.generated_files;
CREATE POLICY "Users own files" ON public.generated_files
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users view own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users insert own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users update own usage" ON public.usage_tracking;
CREATE POLICY "Users view own usage" ON public.usage_tracking
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own usage" ON public.usage_tracking
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own usage" ON public.usage_tracking
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users own settings" ON public.user_settings;
CREATE POLICY "Users own settings" ON public.user_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DO $$
DECLARE
  existing_user record;
BEGIN
  FOR existing_user IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    BEGIN
      PERFORM public.ensure_user_records(
        existing_user.id,
        existing_user.email,
        COALESCE(existing_user.raw_user_meta_data, '{}'::jsonb)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'existing user bootstrap failed for %: %', existing_user.id, SQLERRM;
    END;
  END LOOP;
END $$;
