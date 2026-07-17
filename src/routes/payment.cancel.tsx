import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TriangleAlert as AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/payment/cancel")({
  component: PaymentCancel,
  head: () => ({
    meta: [
      { title: "Payment Cancelled — Auto Seedance" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function PaymentCancel() {
  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <Card className="glass border-0 p-10 text-center max-w-md w-full">
        <div className="size-20 rounded-full bg-orange-500/20 grid place-items-center mx-auto mb-6">
          <AlertTriangle className="size-10 text-orange-400" />
        </div>
        <h2 className="font-display text-3xl font-bold">Payment Cancelled</h2>
        <p className="text-muted-foreground mt-2">No charges were made to your account.</p>
        <p className="text-sm text-muted-foreground mt-1">
          You can upgrade your plan anytime from the pricing page.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link to="/pricing">
            <Button className="w-full btn-gradient text-white border-0" size="lg">Back to Pricing</Button>
          </Link>
          <Link to="/dashboard">
            <Button className="w-full" variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
