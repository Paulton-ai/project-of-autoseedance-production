import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { CircleAlert as AlertCircle, Sparkles, Mail, Loader as Loader2, ArrowLeft, Check } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Forgot Password — Reset Your Password | Auto Seedance" },
      { name: "description", content: "Reset your Auto Seedance password. Enter your email to receive a password reset link and regain access to your AI generation dashboard." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Forgot Password — Auto Seedance" },
      { property: "og:description", content: "Reset your password to regain access to your account." },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/forgot-password" }],
  }),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
      toast.success("Reset link sent!");
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
              <h1 className="text-2xl font-display font-bold">Check your email</h1>
              <p className="text-sm text-muted-foreground mt-2">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <Link to="/login">
                <Button variant="outline" className="mt-6 w-full">
                  Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-center">Forgot Password?</h1>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Enter your email and we'll send you a reset link
              </p>

              {errorMessage && (
                <Alert variant="destructive" className="mt-5 bg-destructive/10">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
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

                <Button type="submit" disabled={loading} className="w-full btn-gradient text-white border-0">
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Send Reset Link
                </Button>
              </form>

              <p className="text-sm text-muted-foreground text-center mt-5">
                Remember your password?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
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
