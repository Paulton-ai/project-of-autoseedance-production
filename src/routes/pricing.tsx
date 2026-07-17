import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader as Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Plan = Tables<"plans">;

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — Free AI Image & Video Generation Credits | Auto Seedance" },
      { name: "description", content: "Simple credit-based pricing for AI image and video generation. Start free with 50 credits. Image generation 5 credits, video generation 30 credits. No credit card required. Flexible monthly plans available." },
      { name: "keywords", content: "AI image generator pricing, AI video generator cost, free AI credits, credit-based AI generation, Auto Seedance pricing, affordable AI generation" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:title", content: "Pricing — Free AI Image & Video Generation Credits" },
      { property: "og:description", content: "Simple credit-based pricing. Start free with 50 credits. No credit card required." },
      { property: "og:url", content: "https://autoseedance.site/pricing" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://autoseedance.site/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Pricing — Auto Seedance AI" },
      { name: "twitter:description", content: "Simple credit-based pricing. Start free with 50 credits." },
      { name: "twitter:image", content: "https://autoseedance.site/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/pricing" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://autoseedance.site/" },
            { "@type": "ListItem", position: 2, name: "Pricing", item: "https://autoseedance.site/pricing" },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "How much does AI image generation cost?", acceptedAnswer: { "@type": "Answer", text: "Each AI image generation costs 5 credits. You start with 50 free credits, giving you 10 free images. Paid plans offer more credits at better rates." } },
            { "@type": "Question", name: "How much does AI video generation cost?", acceptedAnswer: { "@type": "Answer", text: "Each AI video generation costs 30 credits. Video generation is more resource-intensive, including AI audio and higher processing requirements." } },
            { "@type": "Question", name: "Do credits expire?", acceptedAnswer: { "@type": "Answer", text: "Credits on paid plans reset monthly with your subscription. Free credits from sign-up have no expiration." } },
            { "@type": "Question", name: "Can I use credits for both images and videos?", acceptedAnswer: { "@type": "Answer", text: "Yes, credits are flexible and can be used across all AI tools. Use them for images, videos, or a mix of both." } },
          ],
        }),
      },
    ],
  }),
});

function PricingPage() {
  const navigate = useNavigate();
  const { user } = useSession();
  const [yearly, setYearly] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("plans")
      .select("*")
      .eq("is_active", true)
      .neq("name", "Free")
      .order("sort_order", { ascending: true })
      .then(({ data }) => { setPlans((data as Plan[]) ?? []); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setCurrentPlan(data.plan); });
  }, [user]);

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/pricing" } as any });
      return;
    }
    const priceMonthly = Number(plan.price_monthly ?? 0);
    const priceYearly = Number(plan.price_yearly ?? 0);
    const price = yearly ? priceYearly : priceMonthly;
    const displayName = plan.display_name ?? plan.name;

    setLoadingPlan(plan.name);
    try {
      const { data, error } = await supabase.functions.invoke("create-paypal-order", {
        body: { plan_name: displayName, price, user_id: user.id },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      if (data?.approval_url) {
        window.location.href = data.approval_url;
      } else {
        throw new Error("No approval URL returned from PayPal");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize payment");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-40 pb-24 grid-bg">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="border-border bg-muted/50">Pricing</Badge>
            <h1 className="mt-4 font-display text-5xl font-bold">Simple credit-based pricing</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Pay once, create endlessly. All plans include image and video generation.
            </p>

            <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 p-1">
              <button
                onClick={() => setYearly(false)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${!yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Yearly
                <Badge className="bg-orange-500 text-white border-0 text-xs px-1.5 py-0">Save 50%</Badge>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-20 flex justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const priceMonthly = Number(plan.price_monthly ?? 0);
                const priceYearly = Number(plan.price_yearly ?? 0);
                const price = yearly ? priceYearly : priceMonthly;
                const credits = yearly ? plan.monthly_credits * 12 : plan.monthly_credits;
                const pricePerCredit = price > 0 && credits > 0 ? price / credits : 0;
                const isPopular = plan.name === "Pro";
                const isCurrent = currentPlan === plan.name.toLowerCase();
                const displayName = plan.display_name ?? plan.name;
                const isThisLoading = loadingPlan === plan.name;

                return (
                  <Card
                    key={plan.id}
                    className={`relative glass border-0 p-6 flex flex-col ${isPopular ? "glow-purple ring-2 ring-primary/50" : "border border-border"}`}
                  >
                    {isPopular && (
                      <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground border-0">Most Popular</Badge>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-semibold text-xl">{displayName}</h3>
                      {pricePerCredit > 0 && (
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                          ${pricePerCredit.toFixed(3)}/cr
                        </Badge>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="text-4xl font-display font-bold">
                        ${price.toFixed(2)}
                        <span className="text-base font-normal text-muted-foreground">/{yearly ? "year" : "month"}</span>
                      </div>
                      {yearly && (
                        <div className="text-sm text-muted-foreground mt-1">
                          ${priceMonthly.toFixed(2)}/month billed yearly
                        </div>
                      )}
                    </div>

                    <Badge variant="outline" className="w-fit border-primary/30 text-primary mb-6 text-sm">
                      {credits.toLocaleString()} credits/{yearly ? "year" : "month"}
                    </Badge>

                    <ul className="space-y-3 text-sm flex-1 mb-6">
                      {((plan.features as string[]) ?? []).map((f) => (
                        <li key={f} className="flex gap-2">
                          <Check className="size-4 text-green-400 shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <Button className="w-full" variant="outline" disabled>Current plan</Button>
                    ) : (
                      <Button
                        className={`w-full ${isPopular ? "btn-gradient text-white border-0" : ""}`}
                        variant={isPopular ? "default" : "outline"}
                        disabled={isThisLoading || !!loadingPlan}
                        onClick={() => handleSubscribe(plan)}
                      >
                        {isThisLoading ? (
                          <><Loader2 className="size-4 mr-2 animate-spin" /> Redirecting to PayPal…</>
                        ) : (
                          <>Subscribe <ArrowRight className="ml-1 size-4" /></>
                        )}
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Secure payments via PayPal · Image 5 credits · Video 30 credits
          </div>

          <Card className="glass border-0 p-6 mt-8 max-w-2xl mx-auto">
            <h3 className="font-display font-semibold">Need enterprise or custom credits?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Contact us for volume discounts, custom packages, or API access.
            </p>
            <Link to="/contact" className="block mt-4">
              <Button variant="outline" className="w-full">
                Contact sales <ArrowRight className="ml-1 size-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  );
}
