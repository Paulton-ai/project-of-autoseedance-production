import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

const DEFAULT_AUTH_REDIRECT = "/dashboard";
const VALID_AUTH_REDIRECT_PREFIXES = ["/dashboard", "/tools"];
const bootstrapInFlight = new Map<string, Promise<void>>();

export function getSafeAuthRedirect(value: unknown, fallback = DEFAULT_AUTH_REDIRECT) {
  if (typeof value !== "string" || !value.trim()) return fallback;
  let path = value.trim();

  try {
    const parsed = new URL(path, window.location.origin);
    if (parsed.origin !== window.location.origin) return fallback;
    path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }

  if (path.startsWith("//") || path.startsWith("/auth")) return fallback;
  return VALID_AUTH_REDIRECT_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
    ? path
    : fallback;
}

export async function ensureUserBootstrap(user: User) {
  const existing = bootstrapInFlight.get(user.id);
  if (existing) return existing;

  const task = (async () => {
    const { error: rpcError } = await (supabase.rpc as unknown as (fn: "ensure_user_bootstrap") => Promise<{ error: { message: string } | null }>) ("ensure_user_bootstrap");
    if (!rpcError) return;

    console.warn("User bootstrap RPC failed; falling back to client-safe defaults", rpcError.message);
    const displayName =
      user.user_metadata?.display_name ??
      user.user_metadata?.full_name ??
      user.email?.split("@")[0] ??
      "User";

    await Promise.allSettled([
      supabase.from("profiles").upsert(
        {
          id: user.id,
          display_name: displayName,
          avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
        },
        { onConflict: "id", ignoreDuplicates: true },
      ),
      supabase.from("user_settings").upsert(
        { user_id: user.id },
        { onConflict: "user_id", ignoreDuplicates: true },
      ),
      supabase.from("credit_wallets").upsert(
        { user_id: user.id, balance: 30, monthly_grant: 30 },
        { onConflict: "user_id", ignoreDuplicates: true },
      ),
    ]);
  })().finally(() => bootstrapInFlight.delete(user.id));

  bootstrapInFlight.set(user.id, task);
  return task;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
      if (s?.user) void ensureUserBootstrap(s.user);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session?.user) void ensureUserBootstrap(data.session.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null as User | null, loading };
}

export async function signOut() {
  await supabase.auth.signOut();
}
