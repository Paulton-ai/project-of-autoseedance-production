import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader as Loader2, CircleCheck as CheckCircle, Circle as XCircle, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/payment/success")({
  component: PaymentSuccess,
  head: () => ({
    meta: [
      { title: "Payment Successful — Auto Seedance" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function PaymentSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [creditsAdded, setCreditsAdded] = useState(0);
  const [planName, setPlanName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("token"); // PayPal returns ?token=ORDER_ID

    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate({ to: "/login", replace: true }); return; }

        if (!orderId) { setErrorMsg("No order ID found in URL"); setStatus("error"); return; }

        const { data, error } = await supabase.functions.invoke("verify-paypal-payment", {
          body: { order_id: orderId, user_id: user.id },
        });

        if (error || !data?.success) {
          setErrorMsg(error?.message || data?.error || "Payment verification failed");
          setStatus("error");
          return;
        }

        setCreditsAdded(data.credits_added ?? 0);
        setPlanName(data.plan ?? "");
        setStatus("success");
      } catch (err: any) {
        setErrorMsg(err.message || "Unknown error");
        setStatus("error");
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <Card className="glass border-0 p-10 text-center max-w-md w-full">
        {status === "loading" && (
          <>
            <Loader2 className="size-14 mx-auto animate-spin text-primary mb-4" />
            <h2 className="font-display text-2xl font-bold">Verifying payment…</h2>
            <p className="text-muted-foreground mt-2">Please wait while we confirm your payment with PayPal.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="size-20 rounded-full bg-green-500/20 grid place-items-center mx-auto mb-6">
              <CheckCircle className="size-10 text-green-400" />
            </div>
            <h2 className="font-display text-3xl font-bold">Payment Successful!</h2>
            <p className="text-muted-foreground mt-2">
              Your <span className="font-semibold text-foreground capitalize">{planName}</span> plan is now active.
            </p>
            {creditsAdded > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary font-semibold">
                <Sparkles className="size-4" />
                {creditsAdded.toLocaleString()} credits added to your account
              </div>
            )}
            <div className="mt-8 flex flex-col gap-3">
              <Link to="/dashboard">
                <Button className="w-full btn-gradient text-white border-0" size="lg">Go to Dashboard</Button>
              </Link>
              <Link to="/tools/image">
                <Button className="w-full" variant="outline" size="lg">Start Creating</Button>
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="size-20 rounded-full bg-red-500/20 grid place-items-center mx-auto mb-6">
              <XCircle className="size-10 text-red-400" />
            </div>
            <h2 className="font-display text-2xl font-bold">Payment Verification Failed</h2>
            <p className="text-muted-foreground mt-2">{errorMsg}</p>
            <p className="text-sm text-muted-foreground mt-1">
              If you were charged, please contact support with your PayPal transaction ID.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link to="/contact">
                <Button className="w-full btn-gradient text-white border-0" size="lg">Contact Support</Button>
              </Link>
              <Link to="/pricing">
                <Button className="w-full" variant="outline">Back to Pricing</Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
