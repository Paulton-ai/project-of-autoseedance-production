import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader as Loader2, ArrowRight, Wallet } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Plan = Tables<"plans">;
type Payment = Tables<"payments">;

export const Route = createFileRoute("/dashboard/billing")({ component: Billing });

function Billing() {
  const { user } = useSession();
  const [current, setCurrent] = useState<string>("free");
  const [balance, setBalance] = useState<number>(0);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("plans").select("*")
      .eq("is_active", true)
      .neq("name", "Free")
      .order("price_monthly", { ascending: true })
      .then(({ data }) => { setPlans((data as Plan[]) ?? []); setLoading(false); });

    supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setCurrent(data?.plan ?? "free"));

    supabase.from("credit_wallets").select("balance").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setBalance(data?.balance ?? 0));

    supabase.from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPayments((data as Payment[]) ?? []));
  }, [user]);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-bold">Billing</h1>
      <p className="text-muted-foreground mt-1">Manage your subscription and view payment history.</p>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Card className="glass border-0 p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Current plan</div>
            <div className="font-display font-bold text-2xl mt-1 capitalize">{current}</div>
          </div>
          <Sparkles className="size-8 text-primary" />
        </Card>
        <Card className="glass border-0 p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Credits balance</div>
            <div className="font-display font-bold text-2xl mt-1">{balance.toLocaleString()}</div>
          </div>
          <Wallet className="size-8 text-primary" />
        </Card>
      </div>

      <div className="mt-6">
        <Link to="/pricing">
          <Button className="btn-gradient text-white border-0">
            Upgrade Plan <ArrowRight className="ml-1 size-4" />
          </Button>
        </Link>
      </div>

      <h2 className="font-display text-xl font-bold mt-10 mb-4">Payment History</h2>
      {payments.length === 0 ? (
        <Card className="glass border-0 p-6 text-center text-muted-foreground">
          No payments yet. Upgrade your plan to get started.
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <Card key={p.id} className="glass border-0 p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold capitalize">{p.plan_name} Plan</div>
                <div className="text-xs text-muted-foreground">
                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : ""} · {p.paypal_order_id?.slice(0, 12)}…
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">${p.amount?.toFixed(2)}</div>
                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">{p.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
