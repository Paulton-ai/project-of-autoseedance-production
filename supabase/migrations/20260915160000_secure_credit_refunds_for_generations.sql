-- Keep credit mutation functions callable only by authenticated users where
-- the function itself enforces ownership, and keep admin-only credit grants
-- server-side.
revoke execute on function public.add_credits(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.add_credits(uuid, integer, text) to service_role;

revoke execute on function public.consume_credits(text, integer, uuid) from public, anon;
grant execute on function public.consume_credits(text, integer, uuid) to authenticated, service_role;

-- Refund a generation debit exactly once when a provider submission fails or
-- the application explicitly marks a queued generation as failed.
create or replace function public.refund_generation_credits(_generation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  _user_id uuid := auth.uid();
  _generation record;
  _new_balance integer;
begin
  if _user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select id, user_id, credits_used, status
    into _generation
  from public.generations
  where id = _generation_id
    and user_id = _user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Generation not found');
  end if;

  if coalesce(_generation.credits_used, 0) <= 0 then
    return jsonb_build_object('success', false, 'error', 'No credits to refund');
  end if;

  if exists (
    select 1
    from public.credit_ledger
    where generation_id = _generation_id
      and reason = 'image_generation_refund'
      and amount > 0
  ) then
    return jsonb_build_object('success', true, 'refunded', false, 'reason', 'Already refunded');
  end if;

  update public.credit_wallets
  set balance = balance + _generation.credits_used,
      updated_at = now()
  where user_id = _user_id
  returning balance into _new_balance;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Wallet not found');
  end if;

  insert into public.credit_ledger (user_id, amount, balance_after, reason, tool, generation_id)
  values (
    _user_id,
    _generation.credits_used,
    _new_balance,
    'image_generation_refund',
    'image',
    _generation_id
  );

  update public.generations
  set status = 'failed',
      error = coalesce(error, 'Generation failed and credits were refunded'),
      updated_at = now()
  where id = _generation_id;

  return jsonb_build_object(
    'success', true,
    'refunded', true,
    'amount', _generation.credits_used,
    'balance', _new_balance
  );
end;
$$;

revoke execute on function public.refund_generation_credits(uuid) from public, anon;
grant execute on function public.refund_generation_credits(uuid) to authenticated, service_role;
