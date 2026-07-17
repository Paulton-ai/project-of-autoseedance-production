
-- Add display_name to plans if not exists
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS display_name text;

-- Add price columns in dollars (as numeric) for admin UI
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS price_monthly numeric GENERATED ALWAYS AS (price_monthly_cents::numeric / 100) STORED;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS price_yearly numeric GENERATED ALWAYS AS (price_yearly_cents::numeric / 100) STORED;

-- Backfill display_name from name
UPDATE public.plans SET display_name = initcap(name) WHERE display_name IS NULL;

-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  site_name text NOT NULL DEFAULT 'Auto Seedance',
  support_email text NOT NULL DEFAULT 'support@autoseedance.site',
  free_signup_credits integer NOT NULL DEFAULT 50,
  max_images_per_day integer NOT NULL DEFAULT 20,
  max_videos_per_day integer NOT NULL DEFAULT 5,
  maintenance_mode boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Constraint to ensure only one row
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_single_row;
ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_single_row CHECK (id = 1);

-- Insert default row
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_select_all" ON public.site_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "site_settings_update_admin" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create email_campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body_html text NOT NULL,
  recipient_type text NOT NULL CHECK (recipient_type IN ('all','free','paid','specific')),
  recipient_count integer NOT NULL DEFAULT 0,
  sent_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_campaigns_select_admin" ON public.email_campaigns FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "email_campaigns_insert_admin" ON public.email_campaigns FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "email_campaigns_update_admin" ON public.email_campaigns FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "email_campaigns_delete_admin" ON public.email_campaigns FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Grant credits RPC already exists; add update_plan_price helper for admin
CREATE OR REPLACE FUNCTION public.update_plan(
  _plan_name text,
  _display_name text,
  _price_monthly_cents integer,
  _price_yearly_cents integer,
  _monthly_credits integer,
  _features jsonb,
  _is_active boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  UPDATE public.plans SET
    display_name = _display_name,
    price_monthly_cents = _price_monthly_cents,
    price_yearly_cents = _price_yearly_cents,
    monthly_credits = _monthly_credits,
    features = _features,
    is_active = _is_active
  WHERE name = _plan_name;
END;
$$;

-- Allow plans to be read publicly
DROP POLICY IF EXISTS "plans_select" ON public.plans;
CREATE POLICY "plans_select_all" ON public.plans FOR SELECT USING (true);
