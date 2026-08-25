import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service | Auto Seedance" },
      { name: "description", content: "Terms governing your use of Auto Seedance, including AI generation, accounts, credits, payments, content, acceptable use, and service limitations." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Terms of Service | Auto Seedance" },
      { property: "og:description", content: "Terms governing use of the Auto Seedance AI image, video, and reel creation platform." },
      { property: "og:url", content: "https://autoseedance.site/terms" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Terms of Service | Auto Seedance" },
      { name: "twitter:description", content: "Terms governing your use of Auto Seedance." },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/terms" }],
  }),
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-40 pb-24">
        <article className="mx-auto max-w-3xl px-4 prose prose-invert prose-sm md:prose-base">
          <h1 className="font-display text-4xl font-bold">Terms of Service</h1>
          <p className="text-xs text-muted-foreground">Last updated: August 25, 2026</p>

          <p className="mt-6 text-muted-foreground">
            Welcome to Auto Seedance. These Terms of Service ("Terms") govern your access to and use of the Auto Seedance
            website, AI generation tools, creator dashboard, account features, and related services (collectively, the
            "Service"). By accessing or using the Service, you agree to these Terms. If you do not agree, please do not use
            the Service.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">1. The Service</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Auto Seedance provides AI-powered tools for creating images, video clips, short-form reels, and related digital
            content. Features, supported models, generation methods, output formats, pricing, and availability may change as
            the Service develops or as third-party providers update their systems.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">2. Eligibility and Accounts</h2>
          <ul className="mt-3 list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>You must be legally permitted to use the Service under the laws applicable to you.</li>
            <li>You are responsible for providing accurate account information and keeping your login credentials secure.</li>
            <li>You are responsible for activity performed through your account.</li>
            <li>You must not use another person's account without authorization or create accounts through deceptive means.</li>
            <li>If you use Auto Seedance for an organization, you represent that you have authority to accept these Terms for that organization.</li>
          </ul>

          <h2 className="mt-8 font-display text-2xl font-semibold">3. User Inputs</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            You may submit prompts, text, images, videos, audio, references, or other materials to the Service ("User
            Inputs"). You are responsible for your User Inputs and represent that you have the rights and permissions
            necessary to submit them and use them with the Service.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Do not upload or submit material that infringes another person's intellectual property, privacy, publicity, or
            other rights, or that violates applicable law.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">4. AI-Generated Content</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            AI-generated output can be inaccurate, incomplete, unexpected, similar to output generated for other users, or
            unsuitable for a particular purpose. You are responsible for reviewing generated content before publishing,
            distributing, or relying on it.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Subject to applicable law, the plan or feature terms presented to you, and any applicable third-party model
            restrictions, Auto Seedance generally permits you to use eligible generated output for the purposes allowed by
            your plan. We do not guarantee that an AI-generated work will qualify for copyright protection or that you will
            receive exclusive rights to similar output.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">5. Third-Party Services</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Auto Seedance may rely on third-party AI models, APIs, cloud infrastructure, storage, analytics, payment
            processing, and other services. These services may have separate terms, policies, limitations, and availability
            requirements. We may add, remove, replace, or modify third-party services as the platform evolves.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">6. Credits, Pricing, and Payments</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Some features require credits or paid access. Credit costs, plans, limits, generation availability, and prices
            are displayed through the Service and may change over time. You agree to provide accurate billing information and
            authorize the applicable payment provider to process charges you initiate.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            New accounts may receive promotional credits where offered. Promotional credits and purchased credits may be
            subject to the limits, expiration rules, and generation costs displayed with the applicable offer. We may correct
            obvious pricing or billing errors when reasonably necessary.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">7. Refunds and Cancellations</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Cancellation and refund eligibility, if offered, is determined by the purchase terms shown at checkout and any
            applicable refund policy. Because generation consumes computing resources, credits that have already been used
            may not be refundable except where required by law or expressly stated by Auto Seedance. If you believe you were
            charged incorrectly, please contact us through the Contact page with the relevant transaction information.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">8. Acceptable Use</h2>
          <p className="mt-3 text-sm text-muted-foreground">You agree not to use the Service to:</p>
          <ul className="mt-3 list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Violate applicable laws, regulations, or third-party rights.</li>
            <li>Infringe or misappropriate copyrights, trademarks, privacy rights, publicity rights, or other intellectual property.</li>
            <li>Generate or distribute material intended to facilitate fraud, harassment, abuse, or other unlawful activity.</li>
            <li>Upload malware, viruses, malicious code, or other harmful material.</li>
            <li>Attempt unauthorized access to accounts, systems, APIs, or infrastructure.</li>
            <li>Circumvent credits, payment requirements, rate limits, security controls, or other usage restrictions.</li>
            <li>Use bots, scrapers, automated extraction, or similar systems to abuse or overload the Service.</li>
            <li>Reverse engineer, decompile, or attempt to extract proprietary source code or models except where applicable law permits it.</li>
            <li>Resell, sublicense, or redistribute access to the Service without authorization.</li>
            <li>Impersonate another person or organization in a deceptive or harmful manner.</li>
            <li>Interfere with the operation, security, or availability of the Service.</li>
            <li>Use generated content in a way that violates applicable law or the rights of another person.</li>
          </ul>

          <h2 className="mt-8 font-display text-2xl font-semibold">9. Intellectual Property</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            The Auto Seedance website, software, interface, branding, logos, documentation, text, graphics, and other original
            materials provided by Auto Seedance are owned by or licensed to Auto Seedance and are protected by applicable
            intellectual property laws. These Terms do not transfer ownership of our proprietary materials to you.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">10. Service Availability and Changes</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We aim to provide a reliable Service but cannot guarantee uninterrupted or error-free availability. Maintenance,
            technical problems, security issues, network failures, third-party outages, model availability, and events beyond
            our reasonable control may cause interruptions. We may modify, suspend, limit, or discontinue features when reasonably necessary.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">11. AI Accuracy Disclaimer</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            AI systems may produce incorrect, outdated, incomplete, or misleading results. Auto Seedance does not guarantee
            the accuracy, reliability, originality, legality, or suitability of generated content. You should independently
            verify important information and obtain professional advice where appropriate.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">12. Disclaimer of Warranties</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            To the maximum extent permitted by applicable law, the Service is provided on an "as is" and "as available"
            basis. We do not warrant that the Service will always be available, secure, accurate, uninterrupted, or free from
            errors, or that generated output will meet your requirements.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">13. Limitation of Liability</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            To the maximum extent permitted by law, Auto Seedance and its operators, affiliates, licensors, and service
            providers will not be liable for indirect, incidental, special, consequential, or punitive damages arising from
            or related to your use of the Service. Nothing in these Terms excludes liability that cannot legally be excluded
            or limited under applicable law.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">14. Suspension and Termination</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            You may stop using the Service at any time. We may suspend or terminate access when we reasonably believe an
            account has violated these Terms, abused the Service, attempted to bypass security or payment controls, or created
            a material risk to the Service, users, or third parties. We may also take action where required by law.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">15. Privacy</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> explains how we collect,
            use, protect, and share information. By using the Service, you acknowledge that you have reviewed the Privacy Policy.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">16. Changes to These Terms</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We may update these Terms to reflect changes to the Service, business practices, or applicable law. The updated
            version will be posted on this page with a revised effective date. Continued use of the Service after an update
            becomes effective constitutes acceptance of the revised Terms to the extent permitted by law.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">17. Severability and Entire Agreement</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            If any provision of these Terms is found unenforceable, the remaining provisions will continue in effect. These
            Terms and policies expressly referenced in them constitute the agreement governing your use of the Service,
            subject to any feature-specific terms presented to you.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold">18. Contact Us</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            If you have questions about these Terms, billing, your account, or the Service, please contact us through the
            <a href="/contact" className="text-primary hover:underline"> Contact page</a>.
          </p>
        </article>
      </section>
      <Footer />
    </div>
  );
}
