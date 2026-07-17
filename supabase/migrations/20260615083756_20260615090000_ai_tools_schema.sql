-- AI Tools Schema: generations, credit_wallets, credit_ledger, plans, consume_credits

-- Plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_credits INT NOT NULL,
  price_monthly_cents INT NOT NULL DEFAULT 0,
  price_yearly_cents INT NOT NULL DEFAULT 0,
  features TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans read access" ON public.plans FOR SELECT TO authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage plans" ON public.plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default plans
INSERT INTO public.plans (id, name, monthly_credits, price_monthly_cents, price_yearly_cents, features, sort_order) VALUES
('free', 'Free', 50, 0, 0, ARRAY['50 credits/month', 'Text generation', 'Image generation', 'Basic support'], 1),
('starter', 'Starter', 500, 999, 9990, ARRAY['500 credits/month', 'All AI tools', 'Priority queue', 'Email support'], 2),
('pro', 'Pro', 2000, 2499, 24990, ARRAY['2000 credits/month', 'All AI tools', 'Priority queue', 'API access', 'Priority support'], 3),
('business', 'Business', 8000, 7999, 79990, ARRAY['8000 credits/month', 'All AI tools', 'API access', 'Dedicated support', 'Custom integrations'], 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  monthly_credits = EXCLUDED.monthly_credits,
  price_monthly_cents = EXCLUDED.price_monthly_cents,
  price_yearly_cents = EXCLUDED.price_yearly_cents,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order;

-- Credit wallets table
CREATE TABLE IF NOT EXISTS public.credit_wallets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0,
  monthly_grant INT NOT NULL DEFAULT 50,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.credit_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own wallet" ON public.credit_wallets FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage wallets" ON public.credit_wallets FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Credit ledger table
CREATE TABLE IF NOT EXISTS public.credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  reason TEXT NOT NULL,
  tool TEXT,
  generation_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own ledger" ON public.credit_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System inserts ledger" ON public.credit_ledger FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage ledger" ON public.credit_ledger FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_credit_ledger_user_id ON public.credit_ledger(user_id);
CREATE INDEX idx_credit_ledger_created_at ON public.credit_ledger(created_at DESC);

-- Generations table (for AI tools)
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL CHECK (tool_type IN ('text', 'image', 'video', 'animation')),
  prompt TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  result_url TEXT,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  credits_used INT NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  error TEXT,
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own generations" ON public.generations FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert generations" ON public.generations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update generations" ON public.generations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete generations" ON public.generations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_generations_user_id ON public.generations(user_id);
CREATE INDEX idx_generations_tool_type ON public.generations(tool_type);
CREATE INDEX idx_generations_created_at ON public.generations(created_at DESC);

-- Consume credits function
CREATE OR REPLACE FUNCTION public.consume_credits(_tool TEXT, _amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _current_balance INT;
  _new_balance INT;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT balance INTO _current_balance FROM credit_wallets WHERE user_id = _user_id;
  IF _current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No wallet found');
  END IF;

  IF _current_balance < _amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits', 'balance', _current_balance, 'required', _amount);
  END IF;

  _new_balance := _current_balance - _amount;
  
  UPDATE credit_wallets SET balance = _new_balance, updated_at = now() WHERE user_id = _user_id;
  
  INSERT INTO credit_ledger (user_id, amount, reason, tool)
  VALUES (_user_id, -_amount, 'Generation: ' || _tool, _tool);
  
  RETURN jsonb_build_object('success', true, 'new_balance', _new_balance);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.consume_credits(TEXT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_credits(TEXT, INT) TO authenticated, service_role;

-- Grant credits function (for admin use and subscription grants)
CREATE OR REPLACE FUNCTION public.grant_credits(_user_id UUID, _amount INT, _reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_balance INT;
  _new_balance INT;
BEGIN
  SELECT balance INTO _current_balance FROM credit_wallets WHERE user_id = _user_id;
  IF _current_balance IS NULL THEN
    INSERT INTO credit_wallets (user_id, balance, monthly_grant) VALUES (_user_id, _amount, _amount);
  ELSE
    _new_balance := _current_balance + _amount;
    UPDATE credit_wallets SET balance = _new_balance, updated_at = now() WHERE user_id = _user_id;
  END IF;
  
  INSERT INTO credit_ledger (user_id, amount, reason)
  VALUES (_user_id, _amount, _reason);
  
  RETURN jsonb_build_object('success', true);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.grant_credits(UUID, INT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_credits(UUID, INT, TEXT) TO service_role;

-- Initialize wallet for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO credit_wallets (user_id, balance, monthly_grant)
  VALUES (NEW.id, 50, 50)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- Grant permissions
GRANT SELECT ON public.plans TO authenticated;
GRANT ALL ON public.credit_wallets TO authenticated;
GRANT ALL ON public.credit_ledger TO authenticated;
GRANT ALL ON public.generations TO authenticated;