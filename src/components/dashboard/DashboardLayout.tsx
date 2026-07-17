import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureUserBootstrap, signOut, useSession } from "@/lib/auth";
import { LayoutDashboard, Settings, Shield, Sparkles, LogOut, Loader as Loader2, CreditCard, User, Coins, Image as ImageIcon, Video, History, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/tools/image", label: "Image Generation", icon: ImageIcon },
  { to: "/tools/video", label: "Video Generation", icon: Video },
  { to: "/dashboard/credits", label: "Credits", icon: Coins },
  { to: "/dashboard/history", label: "History", icon: History },
  { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [wallet, setWallet] = useState<Tables<"credit_wallets"> | null>(null);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const redirectPath =
    path.startsWith("/dashboard") || path.startsWith("/tools") ? path : "/dashboard";

  // Redirect to login if no session
  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login", search: { redirect: redirectPath } as any, replace: true });
    }
  }, [loading, session, navigate, redirectPath]);

  // Admin check using supabase.auth.getUser() as requested
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
      } catch {
        // not an admin — ignore the error
      }
    };
    checkAdmin();
  }, [session]);

  // Wallet + bootstrap
  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;
    void ensureUserBootstrap(session.user);

    const fetchWallet = async () => {
      const { data } = await supabase
        .from("credit_wallets")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();
      if (data) setWallet(data as Tables<"credit_wallets">);
    };

    fetchWallet();

    // Realtime subscription — all .on() handlers MUST be chained before .subscribe()
    const channel = supabase
      .channel(`wallet-changes-layout-${uid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "credit_wallets", filter: `user_id=eq.${uid}` },
        () => { fetchWallet(); },
      )
      .subscribe();

    const onFocus = () => { fetchWallet(); };
    window.addEventListener("focus", onFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, [session]);

  if (loading || !session) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const allItems = isAdmin
    ? [...NAV_ITEMS, { to: "/dashboard/admin", label: "Admin Panel", icon: Shield }]
    : NAV_ITEMS;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <Link to="/" className="px-6 py-5 flex items-center gap-2 font-display font-bold text-lg">
          <span className="size-8 rounded-lg btn-gradient grid place-items-center">
            <Sparkles className="size-4 text-white" />
          </span>
          <span className="gradient-text">Auto Seedance</span>
        </Link>

        {wallet && (
          <div className="mx-3 mb-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isAdmin ? <Crown className="size-3.5 text-amber-500" /> : <Coins className="size-3.5 text-primary" />}
              {isAdmin ? "Admin" : "Credits"}
            </div>
            <div className="mt-2 text-2xl font-display font-bold">
              {isAdmin ? "∞" : wallet.balance.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {isAdmin ? "Unlimited access" : `${wallet.monthly_grant.toLocaleString()} / month`}
            </div>
          </div>
        )}

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {allItems.map((it) => {
            const active =
              path === it.to || (it.to !== "/dashboard" && path.startsWith(it.to));
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? "btn-gradient text-white"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <it.icon className="size-4" /> {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">
            {session.user.email}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={async () => {
              await signOut();
              navigate({ to: "/", replace: true });
            }}
          >
            <LogOut className="size-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
