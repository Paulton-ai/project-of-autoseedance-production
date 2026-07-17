-- Grant EXECUTE permissions on credit functions to authenticated users
GRANT EXECUTE ON FUNCTION public.consume_credits(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_credits(uuid, integer, text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits(uuid, integer, text, uuid, jsonb) TO authenticated;

-- Add UPDATE policy for credit_wallets so SECURITY DEFINER functions can update users' own wallet
DROP POLICY IF EXISTS "Users update own wallet" ON credit_wallets;
CREATE POLICY "Users update own wallet" ON credit_wallets
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));