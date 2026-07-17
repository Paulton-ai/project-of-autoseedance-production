import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Save, Upload, User as UserIcon, Mail, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — Auto Seedance" }, { name: "robots", content: "noindex, nofollow" }] }),
});

function ProfilePage() {
  const { session } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    setEmail(session.user.email ?? "");
    supabase.from("profiles").select("display_name, avatar_url").eq("id", session.user.id).maybeSingle()
      .then(({ data }) => {
        if (data) { setDisplayName(data.display_name ?? ""); setAvatarUrl(data.avatar_url); }
      });
  }, [session]);

  async function saveProfile() {
    if (!session) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName, avatar_url: avatarUrl, updated_at: new Date().toISOString(),
    }).eq("id", session.user.id);
    setLoading(false);
    if (error) toast.error(error.message); else toast.success("Profile updated");
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${session.user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setUploading(false); toast.error(upErr.message); return; }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(pub.publicUrl);
    const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: pub.publicUrl, updated_at: new Date().toISOString() }).eq("id", session.user.id);
    setUploading(false);
    if (dbErr) toast.error(dbErr.message); else toast.success("Profile picture updated");
  }

  async function changeEmail() {
    if (!session) return;
    if (!email || email === session.user.email) { toast.info("Enter a new email"); return; }
    setEmailLoading(true);
    setEmailNotice(null);
    const { error } = await supabase.auth.updateUser({ email });
    setEmailLoading(false);
    if (error) { toast.error(error.message); return; }
    setEmailNotice("Confirmation links were sent to your old and new email addresses. Open both to finish the change.");
    toast.success("Confirmation emails sent");
  }

  if (!session) return null;

  const initials = (displayName || session.user.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl font-bold">Your profile</h1>
      <p className="text-muted-foreground mt-1">Update your name, picture, and email address.</p>

      <Card className="glass border-0 p-6 mt-6 space-y-6">
        <div className="flex items-center gap-5">
          <Avatar className="size-20">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName || "Avatar"} /> : null}
            <AvatarFallback className="text-lg btn-gradient text-white">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickFile} />
            <Button onClick={() => fileRef.current?.click()} disabled={uploading} variant="outline">
              {uploading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Upload className="size-4 mr-2" />}
              {uploading ? "Uploading…" : "Upload picture"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">PNG or JPG, up to 5MB.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_name">Display name</Label>
          <div className="relative">
            <UserIcon className="size-4 text-muted-foreground absolute left-3 top-3" />
            <Input id="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="pl-9 bg-muted/50 border-border" />
          </div>
        </div>

        <Button onClick={saveProfile} disabled={loading} className="btn-gradient text-white border-0">
          {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />} Save profile
        </Button>
      </Card>

      <Card className="glass border-0 p-6 mt-6 space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold">Email address</h2>
          <p className="text-muted-foreground text-sm mt-1">Changing your email sends confirmation links to both addresses.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="size-4 text-muted-foreground absolute left-3 top-3" />
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 bg-muted/50 border-border" />
          </div>
        </div>
        {emailNotice && (
          <Alert className="border-primary/30 bg-primary/10">
            <AlertCircle className="size-4" />
            <AlertDescription>{emailNotice}</AlertDescription>
          </Alert>
        )}
        <Button onClick={changeEmail} disabled={emailLoading} variant="outline">
          {emailLoading && <Loader2 className="size-4 mr-2 animate-spin" />} Update email
        </Button>
      </Card>
    </div>
  );
}
