import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, TrendingUp, TrendingDown, ArrowRight, Sparkles, ArrowUpRight, Wallet, Clock, Zap, Gift, ShoppingCart, Wand as Wand2, MessageSquare, ShieldCheck, Repeat, Ban, RotateCcw, Circle as HelpCircle, Video as LucideIcon } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/dashboard/credits")({
  component: CreditsPage,
  head: () => ({
    meta: [
      { title: "Credits — Auto Seedance AI" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type Transaction = Tables<"credits_transactions">;
type Wallet = Tables<"credit_wallets">;

const CREDIT_COSTS = {
  text: 1,
  image: 5,
  video: 30,
  animation: 20,
};

// Icon mapping for transaction reasons
const REASON_ICONS: Record<string, LucideIcon> = {
  "Signup Bonus": Gift,
  "Subscription": ShoppingCart,
  "AI Image Generation": Wand2,
  "AI Video Generation": Wand2,
  "AI Chat": MessageSquare,
  "Admin Credit": ShieldCheck,
  "Admin Deduction": Ban,
  "Referral": Repeat,
  "Refund": RotateCcw,
  "Daily Bonus": Gift,
  "Manual Adjustment": ShieldCheck,
};

function getReasonIcon(reason: string): LucideIcon {
  for (const [key, icon] of Object.entries(REASON_ICONS)) {
    if (reason.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return HelpCircle;
}

// Skeleton loader components
function BalanceSkeleton() {
  return (
    <Card className="glass border-0 p-6 mt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-3 w-full">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-14 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mt-6" />
    </Card>
  );
}

function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-border/50">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function CreditsPage() {
  const { user } = useSession();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;

    const [walletRes, txRes, adminRes] = await Promise.all([
      supabase.from("credit_wallets").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("credits_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
    ]);

    // If wallet doesn't exist, create one with signup bonus
    if (!walletRes.data) {
      await supabase.from("credit_wallets").upsert(
        { user_id: user.id, balance: 50, monthly_grant: 50 },
        { onConflict: "user_id", ignoreDuplicates: true },
      );
      const { data: newWallet } = await supabase
        .from("credit_wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setWallet(newWallet as Wallet | null);
    } else {
      setWallet(walletRes.data as Wallet | null);
    }
    setTransactions((txRes.data as Transaction[]) ?? []);
    setIsAdmin(!!adminRes.data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscriptions + focus refetch
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("credit_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "credits_transactions", filter: `user_id=eq.${user.id}` },
        () => { fetchData(); },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "credit_wallets", filter: `user_id=eq.${user.id}` },
        () => { fetchData(); },
      )
      .subscribe();

    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, fetchData]);

  const usedCredits = wallet ? wallet.monthly_grant - wallet.balance : 0;
  const usagePercent = wallet && wallet.monthly_grant > 0
    ? Math.min(100, (usedCredits / wallet.monthly_grant) * 100)
    : 0;

  const balance = wallet?.balance ?? 0;

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-4xl mx-auto">
      <h1 className="font-display text-3xl font-bold">Credits</h1>
      <p className="text-muted-foreground mt-1">Manage your AI generation credits</p>

      {loading ? (
        <BalanceSkeleton />
      ) : (
        <>
          {/* Balance card */}
          <Card className="glass border-0 p-6 mt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Wallet className="size-4 text-primary" /> Current balance
                </div>
                <div className="text-5xl font-display font-bold mt-2">
                  {isAdmin ? "∞" : balance.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {isAdmin
                    ? "Unlimited credits"
                    : `of ${wallet?.monthly_grant.toLocaleString() ?? 50} monthly credits`}
                </div>
              </div>
              <div className="hidden sm:block">
                <Link to="/pricing">
                  <Button className="btn-gradient text-white border-0">
                    Upgrade <ArrowRight className="size-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {!isAdmin && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Used this period</span>
                  <span className="font-medium">{usedCredits} credits</span>
                </div>
                <Progress value={usagePercent} className="h-3" />
              </div>
            )}

            <div className="sm:hidden mt-4">
              <Link to="/pricing" className="block">
                <Button className="w-full btn-gradient text-white border-0">
                  Upgrade <ArrowUpRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Credit costs */}
          <Card className="glass border-0 p-6 mt-4">
            <h2 className="font-display font-semibold">Credit costs per generation</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {Object.entries(CREDIT_COSTS).map(([tool, cost]) => (
                <div key={tool} className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                  <div className="text-sm text-muted-foreground capitalize">{tool}</div>
                  <div className="text-xl font-semibold mt-1">{cost}</div>
                  <div className="text-xs text-muted-foreground">credits</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Transaction history */}
          <Card className="glass border-0 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">Transaction History</h2>
              <Badge variant="outline" className="text-xs">
                {transactions.length} {transactions.length === 1 ? "entry" : "entries"}
              </Badge>
            </div>

            {loading ? (
              <TransactionSkeleton />
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center">
                <Coins className="size-10 mx-auto text-muted-foreground opacity-30 mb-3" />
                <p className="text-muted-foreground text-sm">No transactions yet.</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Generate content or get a signup bonus to see your first transaction.
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {/* Desktop header */}
                <div className="hidden md:grid grid-cols-[1fr_1fr_120px] gap-4 py-2 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Transaction</span>
                  <span>Date</span>
                  <span className="text-right">Amount</span>
                </div>

                {transactions.map((tx) => {
                  const Icon = getReasonIcon(tx.reason);
                  const isCredit = tx.transaction_type === "credit";
                  const date = new Date(tx.created_at);
                  const dateStr = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const timeStr = date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={tx.id}
                      className="group flex items-center gap-3 md:grid md:grid-cols-[1fr_1fr_120px] py-3 border-b border-border/50 hover:bg-muted/20 transition-colors rounded-lg md:rounded-none px-2 md:px-0 -mx-2 md:mx-0"
                    >
                      {/* Transaction info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-none">
                        <div
                          className={`shrink-0 size-9 rounded-lg grid place-items-center ${
                            isCredit
                              ? "bg-green-500/15 text-green-500"
                              : "bg-red-500/15 text-red-500"
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{tx.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            Balance: {tx.balance_after.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Date - hidden on mobile, shown on desktop */}
                      <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="size-3.5" />
                        <span>{dateStr}</span>
                        <span className="text-muted-foreground/50">{timeStr}</span>
                      </div>

                      {/* Mobile: date inline */}
                      <div className="md:hidden text-xs text-muted-foreground">
                        {dateStr}
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 text-sm font-semibold ${
                            isCredit ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {isCredit ? (
                            <TrendingUp className="size-3.5" />
                          ) : (
                            <TrendingDown className="size-3.5" />
                          )}
                          {isCredit ? "+" : "-"}
                          {tx.amount.toLocaleString()}
                        </span>
                        <Badge
                          variant="outline"
                          className={`ml-2 text-[10px] px-1.5 py-0 border-0 ${
                            isCredit
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {isCredit ? "Credit" : "Debit"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
