import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Github } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Us — Support & Partnership Inquiries | Auto Seedance" },
      { name: "description", content: "Get in touch with the Auto Seedance team for support, feedback, bug reports, or partnership inquiries. We respond within 24 hours. Contact us about AI image and video generation." },
      { name: "keywords", content: "contact Auto Seedance, AI generation support, AI tool feedback, AI partnership, AI tool help" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Contact Us — Auto Seedance" },
      { property: "og:description", content: "Get in touch with the Auto Seedance team for support, feedback, or partnership inquiries." },
      { property: "og:url", content: "https://autoseedance.site/contact" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://autoseedance.site/og-image.png" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Contact Us — Auto Seedance" },
      { name: "twitter:description", content: "Get in touch with the Auto Seedance team." },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Auto Seedance",
          description: "Contact page for Auto Seedance AI image and video generation platform.",
          url: "https://autoseedance.site/contact",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://autoseedance.site/" },
            { "@type": "ListItem", position: 2, name: "Contact", item: "https://autoseedance.site/contact" },
          ],
        }),
      },
    ],
  }),
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-40 pb-24 grid-bg">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Badge variant="outline" className="border-border bg-muted/50">Contact</Badge>
          <h1 className="mt-4 font-display text-5xl font-bold">Get in touch.</h1>
          <p className="mt-3 text-muted-foreground">We'd love to hear from you — feedback, bug reports, partnership ideas, anything.</p>

          <div className="mt-12 grid sm:grid-cols-2 gap-4 text-left">
            <Card className="glass border-0 p-6">
              <Mail className="size-6 text-primary" />
              <h2 className="font-display font-semibold mt-3">Email support</h2>
              <p className="text-sm text-muted-foreground mt-1">For account questions, billing, or general help.</p>
              <a href="mailto:paultonai26@gmail.com" className="text-primary text-sm hover:underline mt-3 inline-block">paultonai26@gmail.com</a>
            </Card>
            <Card className="glass border-0 p-6">
              <MessageSquare className="size-6 text-blue-400" />
              <h2 className="font-display font-semibold mt-3">Feedback &amp; feature requests</h2>
              <p className="text-sm text-muted-foreground mt-1">Tell us what you'd love to see next in Auto Seedance.</p>
              <a href="mailto:paultonai26@gmail.com" className="text-blue-400 text-sm hover:underline mt-3 inline-block">paultonai26@gmail.com</a>
            </Card>
          </div>

          <p className="mt-10 text-xs text-muted-foreground inline-flex items-center gap-2">
            <Github className="size-3.5" /> Issues and feature requests are reviewed weekly.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
