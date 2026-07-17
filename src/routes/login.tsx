import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getSafeAuthRedirect } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { CircleAlert as AlertCircle, Sparkles, Mail, Lock, Loader as Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Login — Access Your AI Dashboard | Auto Seedance" },
      { name: "description", content: "Sign in to your Auto Seedance account to access AI image and video generation tools, manage credits, and view your creation history." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Login — Auto Seedance" },
      { property: "og:description", content: "Sign in to access your AI generation dashboard." },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/login" }],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log("Login result:", { error, userId: data.user?.id });

      if (error) {
        console.error("Login error:", error.message);
        setErrorMessage("Invalid email or password");
        toast.error("Invalid email or password");
        return;
      }

      if (data.user) {
        console.log("User logged in:", data.user.id);
        toast.success("Welcome back");
        navigate({ to: redirectTo as any, replace: true });
      }
    } catch (err: any) {
      console.error("Login exception:", err);
      setErrorMessage("Invalid email or password");
      toast.error("Invalid email or password");
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
          <h1 className="text-2xl font-display font-bold text-center">Welcome back</h1>
          <p className="text-sm text-muted-foreground text-center mt-1">Sign in to access your tools</p>

          {errorMessage && (
            <Alert variant="destructive" className="mt-5 bg-destructive/10">
              <AlertCircle className="size-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmail} className="space-y-4 mt-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="size-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="pl-9 bg-muted/50 border-border"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="size-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-9 bg-muted/50 border-border"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" disabled={loading} className="w-full btn-gradient text-white border-0">
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-5">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </Card>

        <Link to="/" className="flex items-center justify-center gap-1 mt-6 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
      </motion.div>
    </div>
  );
}
