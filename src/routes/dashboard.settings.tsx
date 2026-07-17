import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({ component: SettingsPage });

type Settings = {
  theme: string; automation_speed: string; delay_ms: number;
  auto_download: boolean; download_path: string | null; default_platform: string;
};

const defaults: Settings = { theme: "dark", automation_speed: "normal", delay_ms: 1500, auto_download: true, download_path: "Downloads/AutoSeedance", default_platform: "dreamina" };

function SettingsPage() {
  const { user } = useSession();
  const [s, setS] = useState<Settings>(defaults);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setS(data as any); });
  }, [user]);

  async function save() {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("user_settings").upsert({ user_id: user.id, ...s, updated_at: new Date().toISOString() } as any);
    setLoading(false);
    if (error) toast.error(error.message); else toast.success("Settings saved");
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground mt-1">Tune your automation behavior.</p>

      <Card className="glass border-0 p-6 mt-6 space-y-6">
        <Row label="Theme">
          <Select value={s.theme} onValueChange={(v) => setS({ ...s, theme: v })}>
            <SelectTrigger className="bg-muted/50 border-border w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </Row>

        <Row label="Default platform">
          <Select value={s.default_platform} onValueChange={(v) => setS({ ...s, default_platform: v })}>
            <SelectTrigger className="bg-muted/50 border-border w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dreamina">Dreamina</SelectItem>
            </SelectContent>
          </Select>
        </Row>

        <Row label="Automation speed">
          <Select value={s.automation_speed} onValueChange={(v) => setS({ ...s, automation_speed: v })}>
            <SelectTrigger className="bg-muted/50 border-border w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="careful">Careful</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="fast">Fast</SelectItem>
            </SelectContent>
          </Select>
        </Row>

        <div>
          <div className="flex items-center justify-between">
            <Label>Delay between actions ({s.delay_ms} ms)</Label>
          </div>
          <Slider value={[s.delay_ms]} min={250} max={5000} step={50} onValueChange={(v) => setS({ ...s, delay_ms: v[0] })} className="mt-3" />
        </div>

        <Row label="Auto-download finished videos">
          <Switch checked={s.auto_download} onCheckedChange={(v) => setS({ ...s, auto_download: v })} />
        </Row>

        <div>
          <Label>Download folder</Label>
          <Input value={s.download_path ?? ""} onChange={(e) => setS({ ...s, download_path: e.target.value })} className="mt-1 bg-muted/50 border-border" />
        </div>

        <Button onClick={save} disabled={loading} className="btn-gradient text-white border-0">
          {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />} Save settings
        </Button>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
