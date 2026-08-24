import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Data Protection & User Privacy | Auto Seedance" },
      { name: "description", content: "Auto Seedance privacy policy: Learn how we collect, use, protect, and retain information when you use our AI image, video, and reel creation platform." },
      { name: "keywords", content: "Auto Seedance privacy, data protection, AI privacy policy, user data security, privacy policy" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Privacy Policy — Auto Seedance" },
      { property: "og:description", content: "Read how Auto Seedance respects your privacy and protects your data." },
      { property: "og:url", content: "https://autoseedance.site/privacy" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://autoseedance.site/og-image.png" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Privacy Policy — Auto Seedance" },
      { name: "twitter:description", content: "Learn how Auto Seedance respects your privacy." },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/privacy" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://autoseedance.site/" },
            { "@type": "ListItem", position: 2, name: "Privacy Policy", item: "https://autoseedance.site/privacy" },
          ],
        }),
      },
    ],
  }),
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-40 pb-24">
        <article className="mx-auto max-w-3xl px-4 prose prose-invert prose-sm md:prose-base">
          <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <p className="mt-6 text-muted-foreground">
            Auto Seedance ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains
            how our AI content creation platform collects, uses, and safeguards information when you use our website,
            account, generation tools, and creator dashboard.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">1. What we collect</h2>
          <ul className="mt-3 list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Account information such as your email address and display name.</li>
            <li>Generation inputs such as prompts, settings, job status, and related creation metadata.</li>
            <li>Generated media or media URLs that you choose to save to your account or dashboard library.</li>
            <li>Anonymous or aggregated usage information used to improve reliability and product performance.</li>
          </ul>

          <h2 className="mt-8 font-display text-2xl font-semibold">2. What we do NOT collect</h2>
          <ul className="mt-3 list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>We do <strong>not</strong> collect or store passwords for your third-party accounts.</li>
            <li>We do <strong>not</strong> collect unrelated browsing history.</li>
            <li>We do <strong>not</strong> sell, rent, or trade your personal information to third parties.</li>
          </ul>

          <h2 className="mt-8 font-display text-2xl font-semibold">3. How we use information</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We use information to provide AI generation features, maintain your account and credit balance, process
            requests, store your creation history when enabled, provide support, prevent abuse, and improve the service.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">4. Data security</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We use HTTPS/TLS for communications and access controls to protect account and generation data. Database
            access is restricted using row-level security so users can access only records they are authorized to see.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">5. Third-party AI and infrastructure providers</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Some generation requests are processed through third-party AI or infrastructure providers. Information
            needed to fulfill a requested generation may be sent to those providers according to the applicable service
            configuration. We do not ask for or intentionally transmit unrelated account passwords to generation providers.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">6. Your rights</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            You can request access, export, correction, or deletion of your account data by contacting us. Some records
            may need to be retained where required for security, fraud prevention, billing, or legal obligations.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">7. Changes to this policy</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We may update this Privacy Policy from time to time. The updated version will be published on this page with
            a revised effective date.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">8. Contact</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Questions? Reach us via the <a href="/contact" className="text-primary hover:underline">contact page</a>.
          </p>
        </article>
      </section>
      <Footer />
    </div>
  );
}
