import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ensureUserBootstrap, getSafeAuthRedirect } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
  head: () => ({
    meta: [
      { title: "Signing in — Auto Seedance" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finishAuth() {
      const search = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const next = getSafeAuthRedirect(search.get("next") ?? hash.get("next"));
      const authError = search.get("error_description") ?? hash.get("error_description") ?? search.get("error") ?? hash.get("error");

      if (authError) {
        setError(authError);
        return;
      }

      try {
        const code = search.get("code");
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) throw new Error("No active session was returned. Please sign in again.");

        await ensureUserBootstrap(data.session.user);
        if (!cancelled) navigate({ to: next as any, replace: true });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
      }
    }

    void finishAuth();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="min-h-screen grid-bg grid place-items-center px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
        <Link to="/" className="mb-6 inline-flex items-center justify-center gap-2 font-display text-xl font-bold">
          <span className="size-9 rounded-lg btn-gradient grid place-items-center">
            <Sparkles className="size-5 text-white" />
          </span>
          <span className="gradient-text">Auto Seedance</span>
        </Link>
        {error ? (
          <>
            <h1 className="font-display text-2xl font-bold">Sign-in link failed</h1>
            <p className="mt-3 text-sm text-muted-foreground">{error}</p>
            <Button asChild className="mt-6 btn-gradient border-0 text-white">
              <Link to="/auth">Back to sign in</Link>
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto size-7 animate-spin text-primary" />
            <h1 className="mt-4 font-display text-2xl font-bold">Finishing sign in</h1>
            <p className="mt-2 text-sm text-muted-foreground">Securing your session and preparing your dashboard.</p>
          </>
        )}
      </div>
    </div>
  );
}