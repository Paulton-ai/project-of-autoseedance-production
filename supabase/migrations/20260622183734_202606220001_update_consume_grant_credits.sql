/*
# Update consume_credits and grant_credits to use new transaction system

1. Updated Functions
- `consume_credits` — now delegates to `deduct_credits` which records transactions
- `grant_credits` — now delegates to `add_credits` which records transactions

2. New Trigger
- `handle_new_user_wallet` — updated to use `add_credits` for signup bonus

3. Benefits
- All existing callers (edge functions, frontend) continue to work without changes
- Every credit change now creates a transaction record in `credits_transactions`
- Full audit trail for all credit operations
*/

CREATE OR REPLACE FUNCTION public.consume_credits(_tool TEXT, _amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.deduct_credits(auth.uid(), _amount, 'Generation: ' || _tool, NULL, jsonb_build_object('tool', _tool));
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_credits(TEXT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_credits(TEXT, INT) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.grant_credits(_user_id UUID, _amount INT, _reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.add_credits(_user_id, _amount, _reason);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.grant_credits(UUID, INT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_credits(UUID, INT, TEXT) TO authenticated, service_role;

-- Update handle_new_user_wallet to use add_credits for signup bonus
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create wallet first
  INSERT INTO credit_wallets (user_id, balance, monthly_grant)
  VALUES (NEW.id, 0, 50)
  ON CONFLICT (user_id) DO NOTHING;

  -- Add signup bonus via transaction system
  PERFORM public.add_credits(NEW.id, 50, 'Signup Bonus', NULL, jsonb_build_object('source', 'signup'));

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();
