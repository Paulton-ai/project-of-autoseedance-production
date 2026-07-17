import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader as Loader2, Users, CreditCard, Zap, Settings, Mail, Search,
  Pencil, Send, Image as ImageIcon, Video, RefreshCw, Database, Shield,
  Globe, Plus, Trash2, Check, X, Clock,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/dashboard/admin")({ component: AdminBoundary });

// ── Error boundary ────────────────────────────────────────────────────────────
class AdminErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Admin panel error:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen grid place-items-center p-8">
          <Card className="glass border-0 p-8 text-center max-w-md">
            <X className="size-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold">Admin panel encountered an error</h2>
            <p className="text-sm text-muted-foreground mt-2 mb-4 font-mono">
              {(this.state.error as Error).message}
            </p>
            <Button onClick={() => this.setState({ error: null })}>Try again</Button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminBoundary() {
  return <AdminErrorBoundary><Admin /></AdminErrorBoundary>;
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Profile = Tables<"profiles">;
type Subscription = Tables<"subscriptions">;
type Plan = Tables<"plans">;
type Generation = Tables<"generations">;

interface UserRow extends Profile { sub: Subscription | null; balance: number }
interface SiteSettings {
  site_name: string; support_email: string; free_signup_credits: number;
  max_images_per_day: number; max_videos_per_day: number; maintenance_mode: boolean;
}
interface Campaign { id: string; subject: string; recipient_type: string; recipient_count: number; status: string; created_at: string }

const EMAIL_TEMPLATES = [
  {
    name: "Welcome Email",
    subject: "Welcome to Auto Seedance!",
    body: `<h2>Welcome to Auto Seedance!</h2><p>We're thrilled to have you on board. You now have access to powerful AI image and video generation tools.</p><ul><li><a href="https://autoseedance.site/tools/image">Image Generation</a></li><li><a href="https://autoseedance.site/tools/video">Video Generation</a></li></ul><p>Happy creating!</p>`,
  },
  {
    name: "New Feature",
    subject: "New Features Available on Auto Seedance",
    body: `<h2>Exciting New Features!</h2><p>We've been working hard to bring you new capabilities. Check out what's new in your dashboard today.</p>`,
  },
  {
    name: "Special Offer",
    subject: "Exclusive Offer: Upgrade Your Plan Today",
    body: `<h2>Special Offer Just for You!</h2><p>As a valued member, we're offering you an exclusive discount on our paid plans. Upgrade today for more credits and priority generation.</p>`,
  },
  {
    name: "Maintenance",
    subject: "Scheduled Maintenance — Auto Seedance",
    body: `<h2>Scheduled Maintenance Notice</h2><p>We will be performing scheduled maintenance. The service may be temporarily unavailable. We apologize for any inconvenience.</p>`,
  },
];

// ── Main component ────────────────────────────────────────────────────────────
function Admin() {
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "denied" | "ready">("loading");
  const [dataLoading, setDataLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  // Overview
  const [stats, setStats] = useState({ users: 0, paid: 0, generationsToday: 0, creditsUsedToday: 0 });
  const [recentUsers, setRecentUsers] = useState<UserRow[]>([]);
  const [recentGens, setRecentGens] = useState<Generation[]>([]);

  // Users
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [creditModal, setCreditModal] = useState<{ row: UserRow; mode: "add" | "remove" } | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [planModal, setPlanModal] = useState<UserRow | null>(null);
  const [newPlan, setNewPlan] = useState("free");

  // Plans
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editingPlan, setEditingPlan] = useState<(Plan & { _monthly?: number; _yearly?: number }) | null>(null);
  const [planDialog, setPlanDialog] = useState(false);
  const [newFeature, setNewFeature] = useState("");

  // Campaigns
  const [campaignTo, setCampaignTo] = useState<"all" | "free" | "paid" | "specific">("all");
  const [specificEmail, setSpecificEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [preview, setPreview] = useState(false);

  // Settings
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "Auto Seedance", support_email: "paultonai26@gmail.com",
    free_signup_credits: 50, max_images_per_day: 20, max_videos_per_day: 5, maintenance_mode: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // ── Auth / admin gate ──────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    (async () => {
      try {
        const { data, error } = await supabase
          .from("user_roles").select("role")
          .eq("user_id", user.id).eq("role", "admin").maybeSingle();
        if (error || !data) { setStatus("denied"); return; }
        setStatus("ready");
        loadAll();
      } catch {
        setStatus("denied");
      }
    })();
  }, [user, sessionLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Safe loaders ──────────────────────────────────────────────────────────
  async function loadAll() {
    setDataLoading(true);
    await Promise.allSettled([loadStats(), loadUsers(), loadPlans(), loadCampaigns(), loadSettings()]);
    setDataLoading(false);
  }

  async function loadStats() {
    const todayIso = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    const [usersRes, paidRes, genRes, ledgerRes, recentProfilesRes, recentGensRes] = await Promise.allSettled([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("subscriptions").select("id", { count: "exact", head: true }).neq("plan", "free"),
      supabase.from("generations").select("id", { count: "exact", head: true }).gte("created_at", todayIso),
      supabase.from("credit_ledger").select("amount").gte("created_at", todayIso).lt("amount", 0),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("generations").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    const totalUsers = usersRes.status === "fulfilled" ? (usersRes.value.count ?? 0) : 0;
    const totalPaid = paidRes.status === "fulfilled" ? (paidRes.value.count ?? 0) : 0;
    const totalGens = genRes.status === "fulfilled" ? (genRes.value.count ?? 0) : 0;
    const ledgerData = ledgerRes.status === "fulfilled" ? (ledgerRes.value.data ?? []) : [];
    const creditsUsed = Math.abs(ledgerData.reduce((s: number, e: any) => s + (e.amount || 0), 0));

    setStats({ users: totalUsers, paid: totalPaid, generationsToday: totalGens, creditsUsedToday: creditsUsed });

    const profiles = recentProfilesRes.status === "fulfilled" ? (recentProfilesRes.value.data ?? []) : [];
    if (profiles.length > 0) {
      const ids = profiles.map((p: any) => p.id);
      const [subsRes, walletsRes] = await Promise.allSettled([
        supabase.from("subscriptions").select("*").in("user_id", ids),
        supabase.from("credit_wallets").select("user_id, balance").in("user_id", ids),
      ]);
      const subs = subsRes.status === "fulfilled" ? (subsRes.value.data ?? []) : [];
      const wallets = walletsRes.status === "fulfilled" ? (walletsRes.value.data ?? []) : [];
      const subMap = new Map(subs.map((s: any) => [s.user_id, s]));
      const walletMap = new Map(wallets.map((w: any) => [w.user_id, w.balance]));
      setRecentUsers(profiles.map((p: any) => ({ ...p, sub: (subMap.get(p.id) ?? null) as Subscription | null, balance: (walletMap.get(p.id) ?? 0) as number })));
    }

    const gens = recentGensRes.status === "fulfilled" ? (recentGensRes.value.data ?? []) : [];
    setRecentGens(gens as Generation[]);
  }

  async function loadUsers() {
    const [profilesRes] = await Promise.allSettled([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    const profiles = profilesRes.status === "fulfilled" ? (profilesRes.value.data ?? []) : [];
    if (profiles.length === 0) { setUsers([]); return; }

    const ids = profiles.map((p: any) => p.id);
    const [subsRes, walletsRes] = await Promise.allSettled([
      supabase.from("subscriptions").select("*").in("user_id", ids),
      supabase.from("credit_wallets").select("user_id, balance").in("user_id", ids),
    ]);
    const subs = subsRes.status === "fulfilled" ? (subsRes.value.data ?? []) : [];
    const wallets = walletsRes.status === "fulfilled" ? (walletsRes.value.data ?? []) : [];
    const subMap = new Map(subs.map((s: any) => [s.user_id, s]));
    const walletMap = new Map(wallets.map((w: any) => [w.user_id, w.balance]));
    setUsers(profiles.map((p: any) => ({ ...p, sub: (subMap.get(p.id) ?? null) as Subscription | null, balance: (walletMap.get(p.id) ?? 0) as number })));
  }

  async function loadPlans() {
    const [res] = await Promise.allSettled([supabase.from("plans").select("*").order("price_monthly", { ascending: true })]);
    if (res.status === "fulfilled") setPlans((res.value.data ?? []) as Plan[]);
  }

  async function loadCampaigns() {
    const [res] = await Promise.allSettled([
      supabase.from("email_campaigns").select("id, subject, recipient_type, recipient_count, status, created_at")
        .order("created_at", { ascending: false }).limit(20),
    ]);
    if (res.status === "fulfilled") setCampaigns((res.value.data ?? []) as Campaign[]);
  }

  async function loadSettings() {
    const [res] = await Promise.allSettled([supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()]);
    if (res.status === "fulfilled" && res.value.data) setSettings(res.value.data as SiteSettings);
  }

  // ── Credit actions ────────────────────────────────────────────────────────
  async function handleCredits() {
    if (!creditModal) return;
    const amount = parseInt(creditAmount, 10);
    if (isNaN(amount) || amount <= 0) { toast.error("Enter a valid amount"); return; }
    const uid = creditModal.row.id;
    const reason = creditReason.trim() || (creditModal.mode === "add" ? "Admin credit grant" : "Admin credit removal");

    // Use the admin-credits edge function which has service role access
    const { data, error } = await supabase.functions.invoke("admin-credits", {
      body: {
        action: creditModal.mode,
        user_id: uid,
        amount: amount,
        reason: reason,
      },
    });

    if (error || !data?.success) {
      toast.error(error?.message || data?.error || "Failed to update credits");
      return;
    }
    toast.success(`${creditModal.mode === "add" ? "Added" : "Removed"} ${amount} credits`);
    setCreditModal(null); setCreditAmount(""); setCreditReason("");
    loadUsers();
  }

  // ── Admin plan change (with credits update) ───────────────────────────────────
  async function handleAdminPlanChange() {
    if (!planModal) return;

    try {
      const { data, error } = await supabase.functions.invoke("admin-update-plan", {
        body: {
          user_id: planModal.id,
          new_plan_name: newPlan,
        },
      });

      if (error || !data?.success) {
        toast.error(error?.message || data?.error || "Failed to update plan");
        return;
      }

      toast.success(`Plan updated to ${data.new_plan}. Credits set to ${data.monthly_credits}.`);
      setPlanModal(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update plan");
    }
  }

  // ── Plan editor ───────────────────────────────────────────────────────────
  async function savePlan() {
    if (!editingPlan) return;
    const priceMonthly = editingPlan._monthly ?? Number(editingPlan.price_monthly ?? 0);
    const priceYearly = editingPlan._yearly ?? Number(editingPlan.price_yearly ?? 0);
    const { error } = await supabase.from("plans").update({
      name: editingPlan.name,
      display_name: editingPlan.display_name ?? editingPlan.name,
      price_monthly: priceMonthly,
      price_yearly: priceYearly,
      monthly_credits: editingPlan.monthly_credits,
      features: editingPlan.features,
      is_active: editingPlan.is_active,
      sort_order: editingPlan.sort_order,
    }).eq("id", editingPlan.id);
    if (error) {
      console.error("Save plan error:", error);
      toast.error("Failed to save plan: " + error.message);
      return;
    }
    toast.success("Plan saved!");
    setPlanDialog(false);
    setEditingPlan(null);
    loadPlans();
  }

  // ── Campaign ──────────────────────────────────────────────────────────────
  async function sendCampaign() {
    if (!subject.trim() || !body.trim()) { toast.error("Subject and body required"); return; }
    if (campaignTo === "specific" && !specificEmail.trim()) { toast.error("Enter a recipient email"); return; }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-campaign-email', {
        body: {
          recipient_type: campaignTo,
          specific_email: campaignTo === "specific" ? specificEmail.trim() : undefined,
          subject,
          html_body: body,
          sent_by: user?.id
        }
      })
      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)
      toast.success(`Sent to ${data.sent_count} recipient(s)`)
      setSubject(""); setBody(""); setSpecificEmail("");
      loadCampaigns();
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  }

  // ── Site settings ─────────────────────────────────────────────────────────
  async function saveSettings() {
    setSavingSettings(true);
    const [res] = await Promise.allSettled([
      supabase.from("site_settings").update({ ...settings, updated_at: new Date().toISOString() }).eq("id", 1),
    ]);
    setSavingSettings(false);
    if (res.status === "rejected") { toast.error("Failed to save settings"); return; }
    toast.success("Settings saved");
  }

  // ── Filtered users ────────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    const matchName = !q || (u.display_name?.toLowerCase().includes(q) ?? false) || u.id.toLowerCase().includes(q);
    const plan = u.sub?.plan ?? "free";
    const matchPlan = userFilter === "all" || plan === userFilter;
    return matchName && matchPlan;
  });

  // ── Render guards ─────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }
  if (status === "denied") {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <Card className="glass border-0 p-8 text-center max-w-sm">
          <Shield className="size-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Admin Access Required</h2>
          <p className="text-muted-foreground mt-2">You don't have permission to view this page.</p>
          <Button className="mt-4 w-full" onClick={() => navigate({ to: "/dashboard" })}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">Full control over users, plans, and platform</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadAll} disabled={dataLoading}>
            <RefreshCw className={`size-4 mr-2 ${dataLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {dataLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Loader2 className="size-4 animate-spin" /> Loading data…
          </div>
        )}

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="bg-muted/50 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview"><Zap className="size-4 mr-1.5" /> Overview</TabsTrigger>
            <TabsTrigger value="users"><Users className="size-4 mr-1.5" /> Users</TabsTrigger>
            <TabsTrigger value="plans"><CreditCard className="size-4 mr-1.5" /> Plans</TabsTrigger>
            <TabsTrigger value="campaigns"><Mail className="size-4 mr-1.5" /> Campaigns</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="size-4 mr-1.5" /> Settings</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-400" },
                { label: "Paid Subscribers", value: stats.paid, icon: CreditCard, color: "text-green-400" },
                { label: "Generations Today", value: stats.generationsToday, icon: Zap, color: "text-amber-400" },
                { label: "Credits Used Today", value: stats.creditsUsedToday.toLocaleString(), icon: Database, color: "text-rose-400" },
              ].map(s => (
                <Card key={s.label} className="glass border-0 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <s.icon className={`size-5 ${s.color}`} />
                  </div>
                  <div className="mt-2 text-3xl font-display font-bold">{s.value}</div>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass border-0 p-6">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Users className="size-4" /> Recent Signups
                </h3>
                {recentUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No users yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentUsers.map(u => (
                      <div key={u.id} className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-gradient-to-br from-primary to-primary/50 grid place-items-center text-white text-xs font-bold shrink-0">
                          {(u.display_name?.[0] ?? "U").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{u.display_name ?? "Unnamed"}</div>
                          <div className="text-xs text-muted-foreground">{u.id.slice(0, 12)}…</div>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize shrink-0">{u.sub?.plan ?? "free"}</Badge>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(u.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="glass border-0 p-6">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Zap className="size-4" /> Recent Generations
                </h3>
                {recentGens.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No generations yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentGens.map(g => (
                      <div key={g.id} className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-muted overflow-hidden shrink-0">
                          {(g.thumbnail_url ?? g.result_url) ? (
                            <img src={g.thumbnail_url ?? g.result_url ?? ""} alt="" className="size-full object-cover" />
                          ) : (
                            <div className="size-full grid place-items-center">
                              {g.tool_type === "video" ? <Video className="size-4 text-muted-foreground" /> : <ImageIcon className="size-4 text-muted-foreground" />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{g.prompt}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-xs px-1 py-0">{g.tool_type}</Badge>
                            <span className="text-xs text-muted-foreground">{g.credits_used} cr</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {g.status === "done" ? <Check className="size-4 text-green-400" /> :
                           g.status === "failed" ? <X className="size-4 text-red-400" /> :
                           <Clock className="size-4 text-amber-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <Card className="glass border-0 p-6">
              <h3 className="font-display font-semibold mb-4">Quick Actions</h3>
              <div className="grid sm:grid-cols-4 gap-3">
                {(["users", "plans", "campaigns", "settings"] as const).map(t => (
                  <Button key={t} variant="outline" className="capitalize justify-start" onClick={() => setTab(t)}>
                    {t === "users" ? <Users className="size-4 mr-2" /> : t === "plans" ? <CreditCard className="size-4 mr-2" /> : t === "campaigns" ? <Mail className="size-4 mr-2" /> : <Settings className="size-4 mr-2" />}
                    {t === "users" ? "Manage Users" : t === "plans" ? "Edit Plans" : t === "campaigns" ? "Send Campaign" : "Site Settings"}
                  </Button>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* ── USERS ── */}
          <TabsContent value="users">
            <Card className="glass border-0 p-6">
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search by name or ID…" className="pl-9" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                </div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="All plans" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {dataLoading ? "Loading users…" : "No users found"}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Plan</th>
                        <th className="text-right py-3 font-medium text-muted-foreground">Credits</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Joined</th>
                        <th className="text-right py-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.slice(0, 50).map(u => (
                        <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-gradient-to-br from-primary to-primary/50 grid place-items-center text-white text-xs font-bold shrink-0">
                                {(u.display_name?.[0] ?? "U").toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{u.display_name ?? "Unnamed"}</div>
                                <div className="text-xs text-muted-foreground">{u.id.slice(0, 10)}…</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge variant="outline" className={
                              u.sub?.plan === "business" ? "border-amber-500 text-amber-500" :
                              u.sub?.plan === "pro" ? "border-primary text-primary" :
                              u.sub?.plan === "starter" ? "border-blue-400 text-blue-400" : ""
                            }>
                              {u.sub?.plan ?? "free"}
                            </Badge>
                          </td>
                          <td className="py-3 text-right font-medium">{u.balance.toLocaleString()}</td>
                          <td className="py-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="outline" size="sm" className="h-7 text-xs px-2 text-green-500 border-green-500/30"
                                onClick={() => { setCreditModal({ row: u, mode: "add" }); setCreditAmount(""); setCreditReason(""); }}>
                                +Credits
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs px-2 text-red-500 border-red-500/30"
                                onClick={() => { setCreditModal({ row: u, mode: "remove" }); setCreditAmount(""); setCreditReason(""); }}>
                                -Credits
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs px-2"
                                onClick={() => { setPlanModal(u); setNewPlan(u.sub?.plan ?? "free"); }}>
                                Plan
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length > 50 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">Showing 50 of {filteredUsers.length}</p>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ── PLANS ── */}
          <TabsContent value="plans">
            <p className="text-sm text-muted-foreground mb-4">Changes reflect immediately on the public pricing page.</p>
            {plans.length === 0 && !dataLoading && (
              <p className="text-sm text-muted-foreground">No plans found.</p>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {plans.map(plan => (
                <Card key={plan.id} className="glass border-0 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold">{plan.display_name ?? plan.name}</h3>
                      <p className="text-xs text-muted-foreground">slug: {plan.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={plan.is_active ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditingPlan({ ...plan, _monthly: Number(plan.price_monthly ?? 0), _yearly: Number(plan.price_yearly ?? 0) });
                        setPlanDialog(true);
                      }}>
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="rounded-lg bg-muted/30 p-3 text-center">
                      <div className="text-xs text-muted-foreground">Monthly</div>
                      <div className="font-bold">${Number(plan.price_monthly ?? 0).toFixed(2)}</div>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3 text-center">
                      <div className="text-xs text-muted-foreground">Yearly</div>
                      <div className="font-bold">${Number(plan.price_yearly ?? 0).toFixed(2)}</div>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3 text-center">
                      <div className="text-xs text-muted-foreground">Credits/mo</div>
                      <div className="font-bold">{plan.monthly_credits.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {((plan.features as string[]) ?? []).map((f, i) => (
                      <Badge key={i} variant="secondary" className="bg-muted/50 text-xs">{f}</Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── CAMPAIGNS ── */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card className="glass border-0 p-6">
              <h3 className="font-display font-semibold mb-4">Compose Email Campaign</h3>
              <div className="space-y-4">
                <div>
                  <Label>To</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(["all", "free", "paid", "specific"] as const).map(t => (
                      <Button key={t} variant={campaignTo === t ? "default" : "outline"} size="sm"
                        className={campaignTo === t ? "btn-gradient text-white border-0" : ""}
                        onClick={() => setCampaignTo(t)}>
                        {t === "all" ? "All Users" : t === "free" ? "Free Users" : t === "paid" ? "Paid Users" : "Specific Email"}
                      </Button>
                    ))}
                  </div>
                  {campaignTo === "specific" && (
                    <Input className="mt-2" placeholder="recipient@example.com" value={specificEmail} onChange={e => setSpecificEmail(e.target.value)} />
                  )}
                </div>
                <div>
                  <Label>Templates</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {EMAIL_TEMPLATES.map(t => (
                      <Button key={t.name} variant="outline" size="sm" onClick={() => { setSubject(t.subject); setBody(t.body); }}>
                        {t.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input className="mt-1" placeholder="Email subject…" value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
                <div>
                  <Label>Body (HTML supported)</Label>
                  <Textarea className="mt-1 min-h-[180px] font-mono text-sm" placeholder="<p>Your email content…</p>" value={body} onChange={e => setBody(e.target.value)} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setPreview(true)} disabled={!body.trim()}>Preview</Button>
                    <Button className="btn-gradient text-white border-0" disabled={sending || !subject.trim() || !body.trim()} onClick={sendCampaign}>
                      {sending ? <><Loader2 className="size-4 mr-2 animate-spin" /> Sending…</> : <><Send className="size-4 mr-2" /> Send Campaign</>}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recipients: <span className="font-medium text-foreground">
                      {campaignTo === "all" ? `~${stats.users}` : campaignTo === "paid" ? `~${stats.paid}` : campaignTo === "free" ? `~${Math.max(0, stats.users - stats.paid)}` : specificEmail || "—"}
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="glass border-0 p-6">
              <h3 className="font-display font-semibold mb-4">Sent Campaigns</h3>
              {campaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No campaigns sent yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-medium text-muted-foreground">Subject</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Recipients</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Sent</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map(c => (
                        <tr key={c.id} className="border-b border-border/50">
                          <td className="py-2.5 max-w-[200px] truncate">{c.subject}</td>
                          <td className="py-2.5">
                            <Badge variant="outline" className="capitalize text-xs">{c.recipient_type}</Badge>
                            <span className="ml-2 text-muted-foreground">{c.recipient_count}</span>
                          </td>
                          <td className="py-2.5 text-right text-muted-foreground text-xs">
                            {new Date(c.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 text-right">
                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">{c.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ── SETTINGS ── */}
          <TabsContent value="settings">
            <Card className="glass border-0 p-6 max-w-2xl">
              <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
                <Globe className="size-5" /> Site Settings
              </h3>
              <div className="space-y-5">
                <div>
                  <Label>Site Name</Label>
                  <Input className="mt-1" value={settings.site_name} onChange={e => setSettings({ ...settings, site_name: e.target.value })} />
                </div>
                <div>
                  <Label>Support Email</Label>
                  <Input className="mt-1" type="email" value={settings.support_email} onChange={e => setSettings({ ...settings, support_email: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Free Signup Credits</Label>
                    <Input className="mt-1" type="number" value={settings.free_signup_credits} onChange={e => setSettings({ ...settings, free_signup_credits: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Max Images/Day</Label>
                    <Input className="mt-1" type="number" value={settings.max_images_per_day} onChange={e => setSettings({ ...settings, max_images_per_day: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Max Videos/Day</Label>
                    <Input className="mt-1" type="number" value={settings.max_videos_per_day} onChange={e => setSettings({ ...settings, max_videos_per_day: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                  <Switch id="maintenance" checked={settings.maintenance_mode} onCheckedChange={v => setSettings({ ...settings, maintenance_mode: v })} />
                  <div>
                    <Label htmlFor="maintenance" className="cursor-pointer font-medium">Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Shows a maintenance banner to non-admin users</p>
                  </div>
                </div>
                <Button className="btn-gradient text-white border-0 w-full" onClick={saveSettings} disabled={savingSettings}>
                  {savingSettings ? <><Loader2 className="size-4 mr-2 animate-spin" /> Saving…</> : "Save Settings"}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

      {/* ── Credits modal ── */}
      <Dialog open={!!creditModal} onOpenChange={open => !open && setCreditModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{creditModal?.mode === "add" ? "Add Credits" : "Remove Credits"} — {creditModal?.row.display_name ?? "User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Amount</Label>
              <Input type="number" className="mt-1" placeholder="e.g. 100" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} />
            </div>
            <div>
              <Label>Reason (optional)</Label>
              <Input className="mt-1" placeholder="e.g. Promotional grant" value={creditReason} onChange={e => setCreditReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setCreditModal(null)}>Cancel</Button>
            <Button onClick={handleCredits}
              className={creditModal?.mode === "add" ? "btn-gradient text-white border-0" : "bg-destructive text-white hover:bg-destructive/90"}>
              {creditModal?.mode === "add" ? "Add Credits" : "Remove Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Change plan modal ── */}
      <Dialog open={!!planModal} onOpenChange={open => !open && setPlanModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Plan — {planModal?.display_name ?? "User"}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Label>New Plan</Label>
            <Select value={newPlan} onValueChange={setNewPlan}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter (Basic)</SelectItem>
                <SelectItem value="pro">Pro (Standard)</SelectItem>
                <SelectItem value="business">Business (Pro)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Changing the plan will also update the user's credit balance to match the new plan's monthly credits.
            </p>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setPlanModal(null)}>Cancel</Button>
            <Button className="btn-gradient text-white border-0" onClick={handleAdminPlanChange}>Update Plan & Credits</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Plan edit dialog ── */}
      <Dialog open={planDialog} onOpenChange={setPlanDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Plan: {editingPlan?.display_name ?? editingPlan?.name}</DialogTitle>
          </DialogHeader>
          {editingPlan && (
            <div className="space-y-4 mt-2">
              <div>
                <Label>Display Name</Label>
                <Input value={editingPlan.display_name ?? ""} className="mt-1"
                  onChange={e => setEditingPlan({ ...editingPlan, display_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Monthly Price ($)</Label>
                  <Input type="number" step="0.01" className="mt-1"
                    value={editingPlan._monthly ?? 0}
                    onChange={e => setEditingPlan({ ...editingPlan, _monthly: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Yearly Price ($)</Label>
                  <Input type="number" step="0.01" className="mt-1"
                    value={editingPlan._yearly ?? 0}
                    onChange={e => setEditingPlan({ ...editingPlan, _yearly: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label>Monthly Credits</Label>
                <Input type="number" className="mt-1"
                  value={editingPlan.monthly_credits}
                  onChange={e => setEditingPlan({ ...editingPlan, monthly_credits: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Features</Label>
                <div className="mt-2 space-y-2">
                  {((editingPlan.features as string[]) ?? []).map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="flex-1 text-sm bg-muted/30 px-3 py-1.5 rounded-lg">{f}</span>
                      <Button variant="ghost" size="sm" className="size-7 p-0 text-destructive" onClick={() => {
                        const feats = [...(editingPlan.features as string[])];
                        feats.splice(i, 1);
                        setEditingPlan({ ...editingPlan, features: feats });
                      }}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input placeholder="Add feature…" value={newFeature} onChange={e => setNewFeature(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && newFeature.trim()) {
                          setEditingPlan({ ...editingPlan, features: [...(editingPlan.features as string[]), newFeature.trim()] });
                          setNewFeature("");
                        }
                      }} />
                    <Button variant="outline" size="sm" onClick={() => {
                      if (!newFeature.trim()) return;
                      setEditingPlan({ ...editingPlan, features: [...(editingPlan.features as string[]), newFeature.trim()] });
                      setNewFeature("");
                    }}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="planActive" checked={editingPlan.is_active}
                  onCheckedChange={v => setEditingPlan({ ...editingPlan, is_active: v })} />
                <Label htmlFor="planActive" className="cursor-pointer">Active (visible on pricing page)</Label>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => { setPlanDialog(false); setEditingPlan(null); }}>Cancel</Button>
            <Button className="btn-gradient text-white border-0" onClick={savePlan}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Email preview modal ── */}
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview — {subject || "No subject"}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 rounded-xl border border-border bg-white text-black p-6 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: body }} />
        </DialogContent>
      </Dialog>
    </>
  );
}
