import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CircleAlert as AlertCircle, Sparkles, Lock, Loader as Loader2, ArrowLeft, Check, X } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset Your Password — Auto Seedance" },
      { name: "description", content: "Set a new password for your Auto Seedance account to regain access to AI image and video generation tools." },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/reset-password" }],
  }),
});

function getPasswordStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 20, label: "Weak" };
  if (score <= 2) return { score: 40, label: "Fair" };
  if (score <= 3) return { score: 60, label: "Good" };
  if (score <= 4) return { score: 80, label: "Strong" };
  return { score: 100, label: "Very Strong" };
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a valid session from the reset link
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        // No session, redirect to login
        toast.error("Invalid or expired reset link");
        navigate({ to: "/login" });
      }
    });
  }, [navigate]);

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

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
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setSuccess(true);
      toast.success("Password updated!");
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
          {success ? (
            <div className="text-center">
              <div className="size-12 rounded-full bg-green-500/20 grid place-items-center mx-auto mb-4">
                <Check className="size-6 text-green-500" />
              </div>
              <h1 className="text-2xl font-display font-bold">Password Reset</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Your password has been updated successfully
              </p>
              <Link to="/login">
                <Button className="mt-6 w-full btn-gradient text-white border-0">
                  Continue to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-center">Reset Password</h1>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Enter your new password
              </p>

              {errorMessage && (
                <Alert variant="destructive" className="mt-5 bg-destructive/10">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="password">New Password</Label>
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
                        <span className="text-muted-foreground">{strength.label}</span>
                      </div>
                      <Progress value={strength.score} className="h-1.5" />
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
                  Update Password
                </Button>
              </form>
            </>
          )}
        </Card>

        <Link to="/" className="flex items-center justify-center gap-1 mt-6 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
      </motion.div>
    </div>
  );
}
