/*
# Recreate missing auth.users trigger for wallet bootstrap

## Problem
The `handle_new_user()` trigger function exists in the database but no trigger
on `auth.users` calls it. Without this trigger, new user signups never create a
`credit_wallets` row (or profile, subscription, user_roles, user_settings,
usage_tracking rows). The frontend queries `credit_wallets` and gets `null`,
falling back to `balance = 0` and `monthly_grant = 50` — so the Credit Balance
card shows "0 credits remaining" even though the database is the source of truth.

## Fix
Recreate the `on_auth_user_created` trigger on `auth.users` that fires AFTER INSERT
and calls `public.handle_new_user()`. This function is SECURITY DEFINER and calls
`ensure_user_records()` which inserts the wallet row with balance=50, monthly_grant=50
along with all other bootstrap records.

## Safety
- Uses `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER` so it's idempotent.
- No data is modified or deleted — only the trigger is (re)created.
- The trigger function already exists and is correct; only the trigger was missing.
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
