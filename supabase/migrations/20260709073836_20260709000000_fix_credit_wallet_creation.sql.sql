-- Add INSERT policy for credit_wallets (users can create their own wallet if none exists)
CREATE POLICY "Users insert own wallet" ON credit_wallets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update ensure_user_records to also create credit wallet with signup bonus
CREATE OR REPLACE FUNCTION ensure_user_records(
  _user_id uuid,
  _email text DEFAULT NULL,
  _raw_meta jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
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

  -- Create credit wallet with signup bonus if it doesn't exist
  INSERT INTO public.credit_wallets (user_id, balance, monthly_grant)
  VALUES (_user_id, 50, 50)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on the updated function
GRANT EXECUTE ON FUNCTION ensure_user_records(uuid, text, jsonb) TO authenticated;