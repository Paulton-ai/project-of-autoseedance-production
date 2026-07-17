import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Data Protection & User Privacy | Auto Seedance" },
      { name: "description", content: "Auto Seedance privacy policy: We never sell your data, collect passwords, or share personal information. Learn how we protect your privacy with encryption, local storage, and minimal data collection." },
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
            how the Auto Seedance browser extension and dashboard collect, use, and safeguard information.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">1. What we collect</h2>
          <ul className="mt-3 list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Account email (when you create a dashboard account)</li>
            <li>Queue metadata: prompts you submit, job status, generation settings</li>
            <li>Resulting media URLs you choose to sync to your dashboard library</li>
            <li>Anonymous, aggregated usage data to improve the product</li>
          </ul>

          <h2 className="mt-8 font-display text-2xl font-semibold">2. What we do NOT collect</h2>
          <ul className="mt-3 list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>We do <strong>not</strong> collect or store your Dreamina passwords.</li>
            <li>We do <strong>not</strong> collect browsing history outside of Auto Seedance workflows.</li>
            <li>We do <strong>not</strong> sell, rent, or trade your personal information to third parties.</li>
            <li>We do <strong>not</strong> sell user data.</li>
          </ul>

          <h2 className="mt-8 font-display text-2xl font-semibold">3. Local browser storage</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            The extension may use local browser storage (chrome.storage.local) to remember your preferences and
            queue state. This data stays on your device and is never transmitted to our servers unless you
            explicitly sync it to your dashboard.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">4. Extension permissions</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Browser permissions requested by the extension are used <strong>only</strong> to enable workflow
            automation functionality (driving Dreamina with your already-logged-in session). The extension
            automates only user-initiated workflows — nothing runs without your action.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">5. Credentials</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            No passwords are collected by Auto Seedance. Automation runs inside your own logged-in browser
            session — your Dreamina credentials never leave your browser.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">6. Data security</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We use industry-standard encryption (HTTPS/TLS) for all communication between the extension,
            dashboard, and our servers. Dashboard data is stored using Row-Level Security so each user can
            only access their own records.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">7. Your rights</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            You can request export or deletion of your account data at any time by contacting us.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">8. Changes to this policy</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We may update this Privacy Policy from time to time. Continued use of Auto Seedance after changes
            means you accept the updated policy.
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
