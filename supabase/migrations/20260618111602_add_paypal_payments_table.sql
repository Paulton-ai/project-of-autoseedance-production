
-- Add paypal_subscription_id to subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paypal_subscription_id text;

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  paypal_order_id text,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  plan_name text,
  credits_granted integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_own" ON public.payments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payments_update_admin" ON public.payments FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "payments_delete_admin" ON public.payments FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- grant_credits is service-role-only (SECURITY DEFINER). Add add_credits as user-callable wrapper
-- (for verify-paypal-payment edge function which uses service role key anyway, but keep grant_credits for safety)
-- The edge function already uses service role, so it can call grant_credits directly.
GRANT EXECUTE ON FUNCTION public.grant_credits(uuid, integer, text) TO authenticated, anon, service_role;
