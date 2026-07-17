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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CircleAlert as AlertCircle, Sparkles, Mail, Lock, Loader as Loader2, User, ArrowLeft, Check, X } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [
      { title: "Create Free Account — Start AI Image & Video Generation | Auto Seedance" },
      { name: "description", content: "Create your free Auto Seedance account. Get 50 free credits to start generating AI images and videos. No credit card required. Start creating with AI today." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Sign Up — Auto Seedance" },
      { property: "og:description", content: "Create your free account and start generating AI images and videos." },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/signup" }],
  }),
});

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 20, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score: 40, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score: 60, label: "Good", color: "bg-yellow-500" };
  if (score <= 4) return { score: 80, label: "Strong", color: "bg-green-500" };
  return { score: 100, label: "Very Strong", color: "bg-green-500" };
}

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const strength = getPasswordStrength(password);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setNotice(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your name");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: { display_name: name.trim() },
        },
      });

      console.log("Signup result:", { error, userId: data.user?.id });

      if (error) {
        console.error("Signup error:", error.message);
        setErrorMessage(error.message);
        toast.error(error.message);
        return;
      }

      if (data.user) {
        console.log("User created:", data.user.id);
        toast.success("Account created!");
        navigate({ to: redirectTo as any, replace: true });
      } else {
        setNotice("Account created. Check your email to confirm your account.");
        toast.success("Check your email to confirm your account");
      }
    } catch (err: any) {
      console.error("Signup exception:", err);
      setErrorMessage(err.message ?? "Something went wrong");
      toast.error(err.message ?? "Something went wrong");
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
          <h1 className="text-2xl font-display font-bold text-center">Create your account</h1>
          <p className="text-sm text-muted-foreground text-center mt-1">Start generating AI images and videos</p>

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
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative mt-1">
                <User className="size-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="pl-9 bg-muted/50 border-border"
                  disabled={loading}
                />
              </div>
            </div>

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
                  minLength={8}
                  className="pl-9 bg-muted/50 border-border"
                  disabled={loading}
                />
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Password strength</span>
                    <span className={strength.color.replace("bg-", "text-")}>{strength.label}</span>
                  </div>
                  <Progress value={strength.score} className={`h-1.5 ${strength.color}`} />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-1">
                <Lock className="size-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-9 bg-muted/50 border-border"
                  disabled={loading}
                />
                {confirmPassword && (
                  password === confirmPassword ? (
                    <Check className="size-4 text-green-500 absolute right-3 top-3" />
                  ) : (
                    <X className="size-4 text-red-500 absolute right-3 top-3" />
                  )
                )}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full btn-gradient text-white border-0">
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
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
