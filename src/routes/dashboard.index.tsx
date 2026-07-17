import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Component, useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, Image as ImageIcon, Video, Sparkles, ArrowRight, Zap, Loader as Loader2, TriangleAlert as AlertTriangle, Crown } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({ component: OverviewWithBoundary });

// ─── Error boundary ───────────────────────────────────────────────────────────
class DashboardErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-10 flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <AlertTriangle className="size-10 text-destructive" />
          <h2 className="font-display text-xl font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            {this.state.error.message || "An unexpected error occurred loading the dashboard."}
          </p>
          <Button onClick={() => this.setState({ error: null })} variant="outline">
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function OverviewWithBoundary() {
  return (
    <DashboardErrorBoundary>
      <Overview />
    </DashboardErrorBoundary>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function Overview() {
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<{ balance: number; monthly_grant: number } | null>(null);
  const [subscription, setSubscription] = useState<{ plan: string } | null>(null);
  const [recentGenerations, setRecentGenerations] = useState<any[]>([]);
  const [stats, setStats] = useState({ images: 0, videos: 0, creditsUsed: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const userRef = useRef<string | null>(null);

  const fetchWallet = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("credit_wallets")
      .select("balance, monthly_grant")
      .eq("user_id", uid)
      .maybeSingle();
    if (data) setWallet(data as { balance: number; monthly_grant: number });
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!sessionLoading && !user) {
      navigate({ to: "/login", replace: true });
    }
  }, [sessionLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    userRef.current = user.id;

    // Check admin
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));

    fetchWallet(user.id);

    Promise.allSettled([
      supabase
        .from("credit_wallets")
        .select("balance, monthly_grant")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("subscriptions")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("generations")
        .select("id, tool_type, prompt, result_url, thumbnail_url, status, credits_used, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6),
    ])
      .then(async ([walletRes, subRes, genRes]) => {
        if (walletRes.status === "fulfilled" && walletRes.value.data) {
          setWallet(walletRes.value.data as any);
        }
        if (subRes.status === "fulfilled" && subRes.value.data)
          setSubscription(subRes.value.data as any);
        if (genRes.status === "fulfilled" && genRes.value.data)
          setRecentGenerations(genRes.value.data as any[]);
      })
      .catch(() => {});

    Promise.allSettled([
      supabase
        .from("generations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("tool_type", "image")
        .eq("status", "done"),
      supabase
        .from("generations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("tool_type", "video")
        .eq("status", "done"),
      (supabase as any).from("credits_transactions").select("amount").eq("user_id", user.id).eq("transaction_type", "debit"),
    ])
      .then(([imgRes, vidRes, creditRes]) => {
        const creditsUsed =
          creditRes.status === "fulfilled"
            ? ((creditRes.value.data as any[]) ?? []).reduce(
                (sum: number, r: any) => sum + (r.amount ?? 0),
                0,
              )
            : 0;
        setStats({
          images:
            imgRes.status === "fulfilled" ? ((imgRes.value as any).count ?? 0) : 0,
          videos:
            vidRes.status === "fulfilled" ? ((vidRes.value as any).count ?? 0) : 0,
          creditsUsed,
        });
      })
      .catch(() => {});

    // Realtime: refetch wallet when credit_wallets changes
    const channel = supabase
      .channel(`wallet-changes-dashboard-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "credit_wallets", filter: `user_id=eq.${user.id}` },
        () => { fetchWallet(user.id); },
      )
      .subscribe();

    // Refetch on window focus
    const onFocus = () => { if (userRef.current) fetchWallet(userRef.current); };
    window.addEventListener("focus", onFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, fetchWallet]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const planName = subscription?.plan ?? "free";
  const planDisplayName = planName.charAt(0).toUpperCase() + planName.slice(1);
  const balance = wallet?.balance ?? 0;
  const monthlyGrant = wallet?.monthly_grant ?? 0;
  const usedPercent =
    monthlyGrant > 0 ? Math.min(100, ((monthlyGrant - balance) / monthlyGrant) * 100) : 0;
  const displayName =
    user.user_metadata?.display_name || user.email?.split("@")[0] || "User";

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Welcome back, {displayName}!</h1>
          <p className="text-muted-foreground mt-1">Here's your creative overview.</p>
        </div>
        {isAdmin && (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/10">
            <Crown className="size-3 mr-1" /> Admin Account - Unlimited Access
          </Badge>
        )}
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass border-0 p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Credit Balance</span>
            <Badge
              className={`${planName === "free" ? "bg-muted text-muted-foreground" : "btn-gradient text-white"} border-0`}
            >
              {isAdmin ? "Admin" : planDisplayName}
            </Badge>
          </div>
          <div className="text-5xl font-display font-bold">
            {isAdmin ? "∞" : balance.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {isAdmin ? "Unlimited credits" : "credits remaining"}
          </div>
          {!isAdmin && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>{Math.max(0, monthlyGrant - balance)} used</span>
                <span>{monthlyGrant} total</span>
              </div>
              <Progress value={usedPercent} className="h-2" />
            </div>
          )}
          {!isAdmin && planName === "free" && balance < 30 && (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm">
              <span className="text-amber-400">Low credits!</span>{" "}
              <Link to="/pricing" className="text-primary hover:underline">
                Upgrade for more
              </Link>
            </div>
          )}
        </Card>

        <Card className="glass border-0 p-6 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/40">
              <ImageIcon className="size-5 mx-auto text-primary mb-2" />
              <div className="text-2xl font-display font-bold">{stats.images}</div>
              <div className="text-xs text-muted-foreground">Images Generated</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/40">
              <Video className="size-5 mx-auto text-primary mb-2" />
              <div className="text-2xl font-display font-bold">{stats.videos}</div>
              <div className="text-xs text-muted-foreground">Videos Generated</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/40">
              <Coins className="size-5 mx-auto text-primary mb-2" />
              <div className="text-2xl font-display font-bold">{stats.creditsUsed}</div>
              <div className="text-xs text-muted-foreground">Credits Used</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <Link to="/tools/image">
          <Card className="glass border-0 p-6 h-full hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/10 transition cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl btn-gradient grid place-items-center">
                <ImageIcon className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-lg">Generate Image</h3>
                <p className="text-sm text-muted-foreground">
                  Create 2K/4K AI images from text prompts
                </p>
              </div>
              <Badge className="btn-gradient text-white border-0">
                {isAdmin ? "Free" : "5 credits"}
              </Badge>
            </div>
          </Card>
        </Link>
        <Link to="/tools/video">
          <Card className="glass border-0 p-6 h-full hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/10 transition cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl btn-gradient grid place-items-center">
                <Video className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-lg">Generate Video</h3>
                <p className="text-sm text-muted-foreground">
                  Create cinematic AI videos with audio
                </p>
              </div>
              <Badge className="btn-gradient text-white border-0">
                {isAdmin ? "Free" : "30 credits"}
              </Badge>
            </div>
          </Card>
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Recent Generations</h2>
          <Link to="/dashboard/history">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="size-4 ml-1" />
            </Button>
          </Link>
        </div>
        {recentGenerations.length === 0 ? (
          <Card className="glass border-0 p-12 text-center">
            <Sparkles className="size-12 mx-auto text-muted-foreground opacity-50" />
            <p className="mt-4 text-muted-foreground">
              No generations yet. Create your first image or video!
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link to="/tools/image">
                <Button variant="outline" size="sm">
                  <ImageIcon className="size-4 mr-2" /> Generate Image
                </Button>
              </Link>
              <Link to="/tools/video">
                <Button variant="outline" size="sm">
                  <Video className="size-4 mr-2" /> Generate Video
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentGenerations.map((gen: any) => (
              <Card key={gen.id} className="glass border-0 overflow-hidden">
                <Link to={gen.tool_type === "image" ? "/tools/image" : "/tools/video"}>
                  <div className="aspect-video bg-muted grid place-items-center relative">
                    {gen.result_url ? (
                      gen.tool_type === "video" ? (
                        <video src={gen.result_url} className="size-full object-cover" />
                      ) : (
                        <img
                          src={gen.result_url}
                          alt={gen.prompt}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      )
                    ) : gen.status === "processing" ? (
                      <div className="flex flex-col items-center gap-2">
                        <Zap className="size-6 animate-pulse text-primary" />
                        <span className="text-xs text-muted-foreground">Processing...</span>
                      </div>
                    ) : gen.tool_type === "image" ? (
                      <ImageIcon className="size-8 text-muted-foreground opacity-50" />
                    ) : (
                      <Video className="size-8 text-muted-foreground opacity-50" />
                    )}
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      {gen.credits_used} cr
                    </Badge>
                  </div>
                </Link>
                <div className="p-3">
                  <p className="text-sm line-clamp-2">{gen.prompt}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(gen.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
