import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy | Auto Seedance" },
      { name: "description", content: "Learn how Auto Seedance collects, uses, protects, and shares information when you use our AI image, video, and reel creation services." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Privacy Policy | Auto Seedance" },
      { property: "og:description", content: "How Auto Seedance handles account, generation, technical, cookie, and advertising information." },
      { property: "og:url", content: "https://autoseedance.site/privacy" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Privacy Policy | Auto Seedance" },
      { name: "twitter:description", content: "How Auto Seedance handles information and protects user privacy." },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/privacy" }],
  }),
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-40 pb-24">
        <article className="mx-auto max-w-3xl px-4 prose prose-invert prose-sm md:prose-base">
          <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: August 25, 2026</p>

          <p className="mt-6 text-muted-foreground">
            Auto Seedance ("Auto Seedance," "we," "us," or "our") respects your privacy. This Privacy Policy explains
            what information may be collected when you visit our website, create an account, use our AI generation tools,
            purchase credits or services, contact us, or otherwise interact with Auto Seedance. It also explains how we use,
            protect, and share that information.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">1. Information We Collect</h2>
          <p className="mt-3 text-sm text-muted-foreground">Depending on how you use Auto Seedance, we may collect the following categories of information:</p>
          <ul className="mt-3 list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li><strong>Account information:</strong> such as your email address, display name, and account identifiers.</li>
            <li><strong>Generation information:</strong> prompts, instructions, selected settings, generation status, and related metadata needed to provide AI creation features.</li>
            <li><strong>User-provided content:</strong> images, videos, audio, text, or other files you choose to submit to our tools or save in your account.</li>
            <li><strong>Creation history:</strong> generated media, thumbnails, URLs, metadata, and other information associated with creations you choose to save.</li>
            <li><strong>Billing information:</strong> information needed to process purchases, subscriptions, or credits. Payment card details may be handled directly by our payment provider rather than stored by Auto Seedance.</li>
            <li><strong>Support information:</strong> information you provide when contacting us, including your email address and the contents of your message.</li>
            <li><strong>Technical information:</strong> IP address, browser type, device type, operating system, approximate location derived from IP, pages visited, referring pages, timestamps, and similar diagnostic information.</li>
            <li><strong>Usage information:</strong> feature usage, generation activity, errors, performance information, and aggregated statistics used to operate and improve the Service.</li>
          </ul>

          <h2 className="mt-8 font-display text-2xl font-semibold">2. How We Use Information</h2>
          <p className="mt-3 text-sm text-muted-foreground">We may use information to:</p>
          <ul className="mt-3 list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Provide, operate, maintain, and improve Auto Seedance.</li>
            <li>Create and manage user accounts.</li>
            <li>Process AI generation requests and deliver requested outputs.</li>
            <li>Maintain credit balances, process payments, and provide billing support.</li>
            <li>Save and display creation history when account features allow it.</li>
            <li>Respond to questions, requests, and support inquiries.</li>
            <li>Detect, investigate, and prevent fraud, abuse, security incidents, and violations of our Terms of Service.</li>
            <li>Understand how the Service is used and improve reliability, performance, and user experience.</li>
            <li>Comply with applicable laws, legal processes, and legitimate requests from authorities.</li>
            <li>Deliver advertising and measure advertising performance where advertising is enabled.</li>
          </ul>

          <h2 className="mt-8 font-display text-2xl font-semibold">3. AI Generation and Third-Party Providers</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Auto Seedance may use third-party AI model providers, APIs, cloud infrastructure, storage services, analytics
            providers, payment processors, and other service providers to operate the platform. When you request a
            generation, the information reasonably necessary to fulfill that request may be processed by the applicable
            provider. The providers we use may change as the Service develops.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            We do not intentionally send unrelated account passwords to AI generation providers. You should not submit
            passwords, payment credentials, government identification numbers, or other highly sensitive information in an
            AI prompt or uploaded file unless the feature specifically requires it.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">4. Cookies and Similar Technologies</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Auto Seedance and our service providers may use cookies, local storage, pixels, web beacons, and similar
            technologies. These technologies may be used to keep you signed in, remember preferences, maintain security,
            understand website usage, measure performance, and support advertising.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            You can control or disable cookies through your browser settings. Some features may not function correctly if
            essential cookies are disabled.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">5. Advertising and Google AdSense</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Auto Seedance may display advertisements from third-party advertising partners, including Google, if and when
            advertising is enabled on the Service. Third-party vendors, including Google, may use cookies or similar
            technologies to serve ads based on a user's prior visits to this website or other websites.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Where required, advertising personalization and the use of advertising cookies are subject to applicable user
            consent choices. Users may be able to manage personalized advertising through Google's advertising settings or
            other controls provided by the applicable advertising provider.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Google may use advertising identifiers, cookies, IP addresses, or similar information as described in Google's
            own policies. For more information, please review Google's policies regarding advertising technologies and
            how Google uses information from sites and apps that use its services.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">6. How We Share Information</h2>
          <p className="mt-3 text-sm text-muted-foreground">We may share information with:</p>
          <ul className="mt-3 list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Service providers that host, secure, analyze, store, process, or otherwise support Auto Seedance.</li>
            <li>AI model and API providers when needed to fulfill a requested generation.</li>
            <li>Payment providers when processing purchases or subscriptions.</li>
            <li>Advertising and analytics providers where those services are enabled.</li>
            <li>Authorities or other parties when disclosure is required by law or reasonably necessary to protect rights, safety, or the Service.</li>
            <li>Successors or transaction parties if Auto Seedance is involved in a merger, acquisition, financing, reorganization, or sale of assets.</li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            We do not sell or rent your personal information as a standalone product. We may use aggregated or de-identified
            information for analytics, security, and product improvement where permitted by law.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">7. Data Retention</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We retain information for as long as reasonably necessary to provide the Service, maintain accounts and records,
            provide support, prevent abuse, resolve disputes, comply with legal obligations, and protect our legitimate
            interests. Retention periods may differ depending on the type and purpose of the information.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">8. Data Security</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We use reasonable administrative, technical, and organizational measures designed to protect information from
            unauthorized access, alteration, disclosure, or destruction. No internet service can guarantee absolute security,
            so you should use a strong password and avoid submitting information that you do not need to provide.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">9. Your Choices and Privacy Rights</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Depending on where you live, you may have rights to access, correct, export, delete, or otherwise control certain
            personal information. You may also have rights relating to consent, objection, restriction, or withdrawal of
            consent where applicable.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            To request access, correction, export, or deletion of account information, contact us through the Contact page.
            We may need to verify your request and may retain information where required by law or reasonably necessary for
            security, fraud prevention, billing, dispute resolution, or legal compliance.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">10. Children's Privacy</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Auto Seedance is not directed to children who are not legally permitted to use the Service. We do not knowingly
            collect personal information from children in violation of applicable law. If you believe a child has provided
            personal information to us improperly, please contact us so that we can review the situation and take appropriate action.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">11. International Users</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Auto Seedance and its service providers may process information in countries other than the country in which you
            live. Where required by applicable law, we take appropriate measures for international data transfers.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">12. Third-Party Websites</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Our website may contain links to third-party websites or services. We are not responsible for the privacy practices
            or content of third parties. We encourage you to review the privacy policy of each third-party service you use.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">13. Changes to This Privacy Policy</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We may update this Privacy Policy when our practices, services, or legal requirements change. We will publish the
            updated policy on this page and revise the "Last updated" date. Your continued use of the Service after an update
            becomes effective means that you acknowledge the updated policy to the extent permitted by law.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">14. Contact Us</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            If you have questions or requests regarding this Privacy Policy or your personal information, please contact us
            through the <a href="/contact" className="text-primary hover:underline">Contact page</a>.
          </p>
        </article>
      </section>
      <Footer />
    </div>
  );
}
