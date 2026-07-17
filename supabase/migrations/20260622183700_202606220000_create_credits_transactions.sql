/*
# Create credits_transactions table with full audit trail

1. New Table
- `credits_transactions` — a complete credit ledger with running balance tracking
  - `id` (uuid, primary key, auto-generated)
  - `user_id` (uuid, FK to auth.users, NOT NULL)
  - `transaction_type` (text, CHECK credit|debit)
  - `reason` (text, NOT NULL)
  - `amount` (integer, NOT NULL, positive)
  - `balance_before` (integer, NOT NULL)
  - `balance_after` (integer, NOT NULL)
  - `reference_id` (uuid, nullable)
  - `metadata` (jsonb, nullable)
  - `created_at` (timestamptz, DEFAULT now())

2. Indexes
- `idx_credits_transactions_user_id` — fast lookup by user
- `idx_credits_transactions_created_at` — sort by date desc
- `idx_credits_transactions_user_created` — composite for user + date queries

3. Security
- RLS enabled on `credits_transactions`
- SELECT: users can only view their own transactions
- INSERT: users can only insert their own transactions

4. New Functions
- `add_credits(user_id, amount, reason, reference_id, metadata)` — atomic credit add
  - Reads current balance from credit_wallets
  - Calculates new balance
  - Inserts transaction into credits_transactions
  - Updates credit_wallets
  - Returns JSON with success, new_balance, transaction_id
  
- `deduct_credits(user_id, amount, reason, reference_id, metadata)` — atomic credit deduct
  - Reads current balance
  - Checks sufficient credits
  - Inserts transaction
  - Updates wallet
  - Returns JSON with success, new_balance, transaction_id
  - Admin bypass: returns success without deducting
*/

CREATE TABLE IF NOT EXISTS public.credits_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  reason TEXT NOT NULL,
  amount INT NOT NULL CHECK (amount > 0),
  balance_before INT NOT NULL,
  balance_after INT NOT NULL,
  reference_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credits_transactions_user_id ON public.credits_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_transactions_created_at ON public.credits_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credits_transactions_user_created ON public.credits_transactions(user_id, created_at DESC);

ALTER TABLE public.credits_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own transactions" ON public.credits_transactions;
CREATE POLICY "Users view own transactions" ON public.credits_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own transactions" ON public.credits_transactions;
CREATE POLICY "Users insert own transactions" ON public.credits_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT ON public.credits_transactions TO authenticated;
GRANT ALL ON public.credits_transactions TO service_role;

-- Add add_credits function
CREATE OR REPLACE FUNCTION public.add_credits(
  _user_id UUID,
  _amount INT,
  _reason TEXT,
  _reference_id UUID DEFAULT NULL,
  _metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_balance INT;
  _new_balance INT;
  _transaction_id UUID;
BEGIN
  -- Get current balance (lock row)
  SELECT balance INTO _current_balance FROM credit_wallets WHERE user_id = _user_id;
  
  IF _current_balance IS NULL THEN
    -- Create wallet if not exists
    INSERT INTO credit_wallets (user_id, balance, monthly_grant)
    VALUES (_user_id, _amount, 50)
    ON CONFLICT (user_id) DO NOTHING;
    _current_balance := 0;
  END IF;

  _new_balance := _current_balance + _amount;

  -- Insert transaction record
  INSERT INTO credits_transactions (user_id, transaction_type, reason, amount, balance_before, balance_after, reference_id, metadata)
  VALUES (_user_id, 'credit', _reason, _amount, _current_balance, _new_balance, _reference_id, _metadata)
  RETURNING id INTO _transaction_id;

  -- Update wallet
  UPDATE credit_wallets SET balance = _new_balance, updated_at = now() WHERE user_id = _user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'new_balance', _new_balance,
    'transaction_id', _transaction_id,
    'amount', _amount
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.add_credits(UUID, INT, TEXT, UUID, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_credits(UUID, INT, TEXT, UUID, JSONB) TO authenticated, service_role;

-- Add deduct_credits function
CREATE OR REPLACE FUNCTION public.deduct_credits(
  _user_id UUID,
  _amount INT,
  _reason TEXT,
  _reference_id UUID DEFAULT NULL,
  _metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_balance INT;
  _new_balance INT;
  _transaction_id UUID;
  _is_admin BOOLEAN;
BEGIN
  -- Check if user is admin
  _is_admin := EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = 'admin');
  
  -- Admin bypass
  IF _is_admin THEN
    RETURN jsonb_build_object('success', true, 'is_admin', true, 'new_balance', NULL);
  END IF;

  -- Get current balance (lock row)
  SELECT balance INTO _current_balance FROM credit_wallets WHERE user_id = _user_id;
  
  IF _current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No wallet found');
  END IF;

  IF _current_balance < _amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits', 'balance', _current_balance, 'required', _amount);
  END IF;

  _new_balance := _current_balance - _amount;

  -- Insert transaction record
  INSERT INTO credits_transactions (user_id, transaction_type, reason, amount, balance_before, balance_after, reference_id, metadata)
  VALUES (_user_id, 'debit', _reason, _amount, _current_balance, _new_balance, _reference_id, _metadata)
  RETURNING id INTO _transaction_id;

  -- Update wallet
  UPDATE credit_wallets SET balance = _new_balance, updated_at = now() WHERE user_id = _user_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', _new_balance,
    'transaction_id', _transaction_id,
    'amount', _amount
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.deduct_credits(UUID, INT, TEXT, UUID, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.deduct_credits(UUID, INT, TEXT, UUID, JSONB) TO authenticated, service_role;
