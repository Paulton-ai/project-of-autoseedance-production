import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service — User Agreement | Auto Seedance" },
      { name: "description", content: "Auto Seedance terms of service: Fair usage policies, account responsibilities, and legal terms for our AI image and video generation platform. Read our user agreement and service terms." },
      { name: "keywords", content: "Auto Seedance terms, terms of service, AI platform terms, user agreement, service terms" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Terms of Service — Auto Seedance" },
      { property: "og:description", content: "Terms governing your use of Auto Seedance AI image and video generation platform." },
      { property: "og:url", content: "https://autoseedance.site/terms" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://autoseedance.site/og-image.png" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Terms of Service — Auto Seedance" },
      { name: "twitter:description", content: "Terms governing your use of Auto Seedance." },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/terms" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://autoseedance.site/" },
            { "@type": "ListItem", position: 2, name: "Terms of Service", item: "https://autoseedance.site/terms" },
          ],
        }),
      },
    ],
  }),
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-40 pb-24">
        <article className="mx-auto max-w-3xl px-4 prose prose-invert prose-sm md:prose-base">
          <h1 className="font-display text-4xl font-bold">Terms of Service</h1>
          <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <p className="mt-6 text-muted-foreground">
            Welcome to Auto Seedance. By using our browser extension or dashboard, you agree to these terms.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">1. The service</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Auto Seedance provides a browser extension and companion dashboard that automate bulk AI image and
            video generation workflows on third-party services (such as Dreamina) using your own account.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">2. Your account &amp; usage</h2>
          <ul className="mt-3 list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>You are responsible for your Dreamina account and for complying with Dreamina's terms of service.</li>
            <li>You must not use Auto Seedance to violate any law or third-party rights.</li>
            <li>You must not resell, redistribute, or reverse-engineer the extension.</li>
          </ul>

          <h2 className="mt-8 font-display text-2xl font-semibold">3. Third-party services</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Auto Seedance is not affiliated with, endorsed by, or sponsored by Dreamina or its parent company.
            We provide automation tooling that runs in your own browser using your own logged-in account.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">4. Early Access &amp; pricing</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Auto Seedance is currently free during Early Access. We reserve the right to introduce paid tiers in
            the future; existing free functionality during Early Access is provided on an "as-is" basis.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">5. No warranty</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            The service is provided "as-is" without warranty of any kind. We do not guarantee uninterrupted
            service or that generated content will meet your expectations.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">6. Limitation of liability</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            To the maximum extent permitted by law, Auto Seedance shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of the service.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">7. Termination</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We may suspend or terminate accounts that violate these terms. You can delete your account at any time.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">8. Changes</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We may update these terms. Continued use after changes means you accept the updated terms.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">9. Contact</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Questions? Reach us via the <a href="/contact" className="text-primary hover:underline">contact page</a>.
          </p>
        </article>
      </section>
      <Footer />
    </div>
  );
}
