import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader as Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface AuthGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once a session exists — the caller can resume the pending action. */
  onAuthenticated?: (userId: string) => void;
  toolName?: string;
}

export function AuthGateDialog({ open, onOpenChange, onAuthenticated, toolName = "this tool" }: AuthGateDialogProps) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}` },
        });
        if (err) throw err;
        if (!data.session) {
          setConfirmSent(true);
          return;
        }
        toast.success("Account created — 30 free credits added");
        onAuthenticated?.(data.session.user.id);
        onOpenChange(false);
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        toast.success("Signed in");
        if (data.session) onAuthenticated?.(data.session.user.id);
        onOpenChange(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="size-8 rounded-lg btn-gradient grid place-items-center">
              <Sparkles className="size-4 text-white" />
            </span>
            Create a free account
          </DialogTitle>
          <DialogDescription>
            Your settings are saved — sign up to use {toolName} and get 30 free credits instantly.
          </DialogDescription>
        </DialogHeader>

        {confirmSent ? (
          <Alert>
            <AlertDescription>
              Check your inbox and confirm your email address. Once confirmed, come back to this page — your
              inputs are still here and your free credits will be ready.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs value={mode} onValueChange={(v) => { setMode(v as "signup" | "login"); setError(null); }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup">Sign up</TabsTrigger>
              <TabsTrigger value="login">Log in</TabsTrigger>
            </TabsList>

            <TabsContent value={mode} className="mt-4">
              <form onSubmit={submit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="gate-email">Email</Label>
                  <Input
                    id="gate-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gate-password">Password</Label>
                  <Input
                    id="gate-password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full btn-gradient text-white border-0">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : mode === "signup" ? "Sign up & continue" : "Log in & continue"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
