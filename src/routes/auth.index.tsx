import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ensureUserBootstrap, getSafeAuthRedirect } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { CircleAlert as AlertCircle, Sparkles, Mail, Lock, Loader as Loader2, User, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth/")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — Auto Seedance" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});


function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const redirectTo = typeof window !== "undefined"
    ? getSafeAuthRedirect(new URLSearchParams(window.location.search).get("redirect"))
    : "/dashboard";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirectTo as any, replace: true });
    });
  }, [navigate, redirectTo]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setNotice(null);

    if (mode === "signup") {
      if (!name.trim()) {
        setErrorMessage("Please enter your name");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { display_name: name },
          },
        });
        if (error) throw error;
        if (data.session) {
          await ensureUserBootstrap(data.session.user);
          toast.success("Account created");
          navigate({ to: redirectTo as any, replace: true });
        } else {
          setNotice("Account created. Check your email and open the confirmation link to continue.");
          toast.success("Check your email to confirm your account");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) await ensureUserBootstrap(data.user);
        toast.success("Welcome back");
        navigate({ to: redirectTo as any, replace: true });
      }
    } catch (err: any) {
      const message = err.message ?? "Something went wrong";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid-bg grid place-items-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6 font-display font-bold text-xl">
          <span className="size-9 rounded-lg btn-gradient grid place-items-center">
            <Sparkles className="size-5 text-white" />
          </span>
          <span className="gradient-text">Auto Seedance</span>
        </Link>
        <Card className="glass border-0 p-8">
          <h1 className="text-2xl font-display font-bold text-center">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-1">
            {mode === "signin" ? "Sign in to access your tools" : "Start generating in minutes"}
          </p>

          {errorMessage && (
            <Alert variant="destructive" className="mt-5 bg-destructive/10">
              <AlertCircle className="size-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {notice && (
            <Alert className="mt-5 border-primary/30 bg-primary/10 text-foreground">
              <Mail className="size-4" />
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmail} className="space-y-4 mt-6">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative mt-1">
                  <User className="size-4 text-muted-foreground absolute left-3 top-3" />
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="pl-9 bg-muted/50 border-border" disabled={loading} />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="size-4 text-muted-foreground absolute left-3 top-3" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="pl-9 bg-muted/50 border-border" disabled={loading} />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="size-4 text-muted-foreground absolute left-3 top-3" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="pl-9 bg-muted/50 border-border" disabled={loading} />
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative mt-1">
                  <Lock className="size-4 text-muted-foreground absolute left-3 top-3" />
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="pl-9 bg-muted/50 border-border" disabled={loading} />
                </div>
              </div>
            )}

            {mode === "signin" && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot Password?</Link>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full btn-gradient text-white border-0">
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-5">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErrorMessage(null); setConfirmPassword(""); }}
              className="text-primary hover:underline font-medium"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </Card>

        <Link to="/" className="flex items-center justify-center gap-1 mt-6 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
      </motion.div>
    </div>
  );
}
