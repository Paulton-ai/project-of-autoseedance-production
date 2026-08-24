import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service — User Agreement | Auto Seedance" },
      { name: "description", content: "Auto Seedance terms of service: Review account responsibilities, fair-use requirements, credits, payments, generated content, and legal terms for our AI creation platform." },
      { name: "keywords", content: "Auto Seedance terms, terms of service, AI platform terms, user agreement, service terms" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Terms of Service — Auto Seedance" },
      { property: "og:description", content: "Terms governing your use of the Auto Seedance AI image, video, and reel creation platform." },
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
            Welcome to Auto Seedance. By using our website, AI generation tools, creator dashboard, or related services,
            you agree to these terms.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">1. The service</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Auto Seedance provides AI-powered tools for generating images, video clips, and short-form reels. Features,
            supported models, output formats, and availability may change as the service develops and third-party model
            providers update their systems.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">2. Your account &amp; usage</h2>
          <ul className="mt-3 list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>You are responsible for maintaining the security of your Auto Seedance account.</li>
            <li>You must not use the service to violate any law, third-party rights, or applicable platform policies.</li>
            <li>You must not attempt to bypass credit limits, abuse generation systems, or interfere with service availability.</li>
            <li>You are responsible for reviewing generated content before publishing or using it commercially.</li>
          </ul>

          <h2 className="mt-8 font-display text-2xl font-semibold">3. Third-party services</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Auto Seedance may rely on third-party AI models, cloud infrastructure, payment processors, analytics, and
            storage providers. Their availability and terms may affect parts of the service. Auto Seedance is not
            affiliated with third-party model providers unless explicitly stated.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">4. Credits &amp; pricing</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Auto Seedance uses credit-based access for generation features. New accounts may receive a promotional credit
            balance, currently 30 free credits. Credit costs vary by generation type and may change with notice. Paid
            purchases, refunds, and plan terms are governed by the pricing information shown at the time of purchase.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">5. Generated content</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            You are responsible for the prompts and inputs you submit and for ensuring that your use of generated output
            complies with applicable law and the rights of others. AI-generated output may be inaccurate, duplicated,
            or unsuitable for a particular purpose, and you should review it before use.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">6. No warranty</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            The service is provided "as-is" without warranty of any kind. We do not guarantee uninterrupted service,
            specific model availability, or that generated content will meet your expectations.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">7. Limitation of liability</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            To the maximum extent permitted by law, Auto Seedance shall not be liable for indirect, incidental, or
            consequential damages arising from your use of the service.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">8. Termination</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We may suspend or terminate accounts that violate these terms or abuse the service. You may stop using the
            service and request account deletion subject to applicable retention requirements.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">9. Changes</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We may update these terms from time to time. The updated version will be published on this page with a revised
            effective date.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">10. Contact</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Questions? Reach us via the <a href="/contact" className="text-primary hover:underline">contact page</a>.
          </p>
        </article>
      </section>
      <Footer />
    </div>
  );
}
