import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

const SITE_URL = "https://www.autoseedance.site";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPolicyPage,
  head: () => ({
    meta: [
      { title: "Refund Policy | Auto Seedance" },
      {
        name: "description",
        content:
          "Review Auto Seedance refund and cancellation terms for credit-based AI image, video, and reel generation purchases.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Refund Policy | Auto Seedance" },
      { property: "og:description", content: "Review the refund and cancellation terms that apply to Auto Seedance purchases." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/refund-policy` },
      { property: "og:image", content: `${SITE_URL}/web-app-manifest-512x512.png` },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/refund-policy` }],
  }),
});

function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-36 pb-24">
        <article className="mx-auto max-w-3xl px-4">
          <h1 className="font-display text-4xl font-bold">Refund Policy</h1>
          <p className="mt-3 text-sm text-muted-foreground">Please also review the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>, which form part of the agreement governing Auto Seedance.</p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
            <section>
              <h2 className="font-display text-2xl font-semibold text-foreground">1. Purchase and cancellation terms</h2>
              <p className="mt-3">Cancellation and refund eligibility, if offered, is determined by the purchase terms shown at checkout and any applicable terms presented by Auto Seedance for the specific purchase.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl font-semibold text-foreground">2. Used credits</h2>
              <p className="mt-3">Because AI generation consumes computing resources, credits that have already been used may not be refundable except where required by law or expressly stated by Auto Seedance.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl font-semibold text-foreground">3. Incorrect charges</h2>
              <p className="mt-3">If you believe you were charged incorrectly, contact Auto Seedance through the Contact page and provide the relevant transaction information so the team can review the issue.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl font-semibold text-foreground">4. Changes</h2>
              <p className="mt-3">Refund terms may change as the service, payment providers, plans, or applicable law changes. The terms shown for your purchase and the current Terms of Service should be reviewed before buying credits or a subscription.</p>
            </section>
          </div>

          <div className="mt-12 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-semibold text-foreground">Need help with a charge?</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">Use the Contact page for billing questions or suspected incorrect charges.</p>
            <Link to="/contact" className="mt-4 inline-flex rounded-xl btn-gradient px-4 py-2 text-sm font-semibold text-white">Contact Auto Seedance</Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
