import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Sparkles, ArrowRight, Check, Image as ImageIcon, Video, Coins, Clock, Zap, ShieldCheck, Image as LucideImage } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Free AI Image & Video Generator — Auto Seedance" },
      { name: "description", content: "Create stunning AI images and videos for free with Auto Seedance. Professional AI generation platform powered by Seedream, Veo 3, Meta AI, and Grok. Start with 50 free credits, no credit card required." },
      { name: "keywords", content: "AI Image Generator, AI Video Generator, Free AI Image Generator, AI Art Generator, AI Photo Generator, Seedream AI, Veo 3, Meta AI, Grok AI, Higgsfield AI, text to image, text to video, AI Video Creator" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-video-preview:-1" },
      { name: "google-site-verification", content: "MktAdEwJLh_fCrckaz6WQtpgSdQ1NIw2ZzBrPDD6cKo" },
      { property: "og:title", content: "Auto Seedance — Free AI Image & Video Generator" },
      { property: "og:description", content: "Create stunning AI images and videos for free. Powered by Seedream, Veo 3, and more. 50 free credits to start." },
      { property: "og:url", content: "https://autoseedance.site/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://autoseedance.site/og-image.png" },
      { property: "og:image:alt", content: "Auto Seedance - Free AI Image & Video Generator" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@AutoSeedance" },
      { name: "twitter:title", content: "Auto Seedance — Free AI Image & Video Generator" },
      { name: "twitter:description", content: "Create stunning AI images and videos for free. Powered by Seedream, Veo 3, and more." },
      { name: "twitter:image", content: "https://autoseedance.site/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Auto Seedance",
          applicationCategory: "MultimediaApplication",
          description: "Professional AI image and video generation platform powered by advanced AI models like Seedream, Veo 3, and more.",
          url: "https://autoseedance.site/",
          operatingSystem: "Web Browser",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "1250" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "What is Auto Seedance?", acceptedAnswer: { "@type": "Answer", text: "Auto Seedance is a free AI image and video generation platform that lets you create professional visuals using advanced AI models like Seedream, Veo 3, Meta AI, and Grok." } },
            { "@type": "Question", name: "How does the free AI image generator work?", acceptedAnswer: { "@type": "Answer", text: "Enter a text prompt describing your desired image, choose a style (realistic, anime, 3D, etc.) and resolution (up to 4K), and the AI generates high-quality images in seconds. You can also use reference images to guide the output." } },
            { "@type": "Question", name: "How does AI video generation work?", acceptedAnswer: { "@type": "Answer", text: "Describe your video scene with a text prompt, set duration (1-10s), resolution (720p-1080p), and aspect ratio. The AI creates cinematic videos with optional AI-generated audio in 2-3 minutes." } },
            { "@type": "Question", name: "Is the AI image generator really free?", acceptedAnswer: { "@type": "Answer", text: "Yes, you start with 50 free credits. Image generation costs 5 credits and video generation costs 30 credits. No credit card required to start." } },
            { "@type": "Question", name: "What AI models does Auto Seedance support?", acceptedAnswer: { "@type": "Answer", text: "Auto Seedance supports Seedream AI for image generation, Veo 3 (Google Veo) for video generation, and integrates with Meta AI, Grok AI, and Higgsfield AI models." } },
            { "@type": "Question", name: "Can I use AI generated images and videos commercially?", acceptedAnswer: { "@type": "Answer", text: "Yes, all content you generate with Auto Seedance is yours to use for personal or commercial purposes." } },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "AI Image Generation",
          description: "Generate high-quality AI images from text prompts in various styles and resolutions up to 4K.",
          url: "https://autoseedance.site/tools/image",
          provider: { "@type": "Organization", name: "Auto Seedance" },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "AI Video Generation",
          description: "Create cinematic AI videos from text prompts with resolutions up to 1080p and AI-generated audio.",
          url: "https://autoseedance.site/tools/video",
          provider: { "@type": "Organization", name: "Auto Seedance" },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Features />
      <StatsSection />
      <AIToolsSection />
      <PricingTeaser />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative pt-40 pb-28 grid-bg overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge variant="outline" className="border-border bg-muted/50 backdrop-blur text-xs">
            <Sparkles className="size-3 mr-1 text-primary" /> AI Image &amp; Video Generation
          </Badge>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-6 font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]"
        >
          Create Stunning AI Images
          <br />
          <span className="gradient-text">&amp; Videos</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Professional AI generation tools powered by advanced models. Generate, download, and share — no limits on creativity.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-9 flex flex-wrap justify-center gap-3"
        >
          <Link to="/signup">
            <Button size="lg" className="btn-gradient text-white border-0 h-12 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition">
              Start Free
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline" className="h-12 px-6 border-border bg-muted/50 backdrop-blur hover:bg-muted transition">
              View Pricing <ArrowRight className="ml-1 size-4" />
            </Button>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 mx-auto max-w-5xl"
        >
          <div className="glass rounded-2xl p-2 glow-purple overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full rounded-xl aspect-[16/9] object-cover"
              src="https://vcercajwtbjbvjhzivjb.supabase.co/storage/v1/object/sign/uploads/Untitled%20design.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ZTVlNzIxOC0yZGFlLTRhNTEtODRkNS0yN2JjNGI0MzQ5MTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ1cGxvYWRzL1VudGl0bGVkIGRlc2lnbi5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgxOTM1Mzg1LCJleHAiOjIwOTcyOTUzODV9.wKr8TxfhrTfRlUzrE2FAI6K9bmmz-5I-ut6i5qVXWtg"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: LucideImage, title: "AI Image Generation", desc: "Generate stunning 2K/4K images from text prompts using Seedream AI" },
    { icon: Video, title: "AI Video Generation", desc: "Create cinematic videos up to 15 seconds with audio using Seedance AI" },
    { icon: Zap, title: "Bulk Chrome Extension", desc: "Automate bulk generation directly in your browser — coming soon", badge: "Coming Soon" },
  ];
  return (
    <section id="features" className="py-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="outline" className="border-border bg-muted/50">Features</Badge>
          <h2 className="mt-4 font-display text-4xl font-bold">Powerful AI generation at your fingertips</h2>
          <p className="mt-3 text-muted-foreground">Create professional images and videos with cutting-edge AI models.</p>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {items.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="glass border-0 p-6 h-full hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/10 transition relative">
                {f.badge && (
                  <Badge className="absolute top-4 right-4 bg-amber-500/20 text-amber-400 border-amber-500/30 border text-xs">
                    {f.badge}
                  </Badge>
                )}
                <div className="size-10 rounded-xl btn-gradient grid place-items-center">
                  <f.icon className="size-5 text-white" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-lg">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "2K-4K", label: "Resolution" },
    { value: "15s", label: "Max Video" },
    { value: "50+", label: "AI Models" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <section className="py-16 border-t border-border bg-muted/10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold gradient-text">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AIToolsSection() {
  const tools = [
    {
      icon: LucideImage,
      title: "Image Generation",
      desc: "Create stunning AI images from text prompts. Choose from realistic, digital illustration, vector, or icon styles.",
      credits: 5,
      href: "/tools/image",
      features: ["1024x1024 to 4K resolution", "4 style presets", "Realistic or stylized output"],
    },
    {
      icon: Video,
      title: "Video Generation",
      desc: "Generate cinematic AI videos with text prompts. 720p and 1080p resolution with optional audio.",
      credits: 30,
      href: "/tools/video",
      features: ["7-second clips", "Multiple aspect ratios", "AI-generated audio"],
    },
  ];

  return (
    <section id="ai-tools" className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="outline" className="border-border bg-muted/50">AI Tools</Badge>
          <h2 className="mt-4 font-display text-4xl font-bold">Generate with credits, not subscriptions</h2>
          <p className="mt-3 text-muted-foreground">
            Use credits across all AI tools. Start with 50 free credits, no credit card required.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link to={tool.href}>
                <Card className="glass border-0 p-6 h-full hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/10 transition group cursor-pointer glow-purple">
                  <div className="flex items-start justify-between">
                    <div className="size-12 rounded-xl btn-gradient grid place-items-center">
                      <tool.icon className="size-6 text-white" />
                    </div>
                    <Badge className="btn-gradient text-white border-0 flex items-center gap-1">
                      <Coins className="size-3" /> {tool.credits} credits
                    </Badge>
                  </div>

                  <h3 className="mt-4 font-display font-semibold text-xl">{tool.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{tool.desc}</p>

                  <ul className="mt-4 space-y-2">
                    {tool.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="size-4 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex items-center text-primary text-sm font-medium group-hover:gap-3 transition-all">
                    <span>Try it now</span>
                    <ArrowRight className="size-4 ml-1 group-hover:translate-x-1 transition" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Credit costs: <span className="font-medium text-foreground">Image 5</span> · <span className="font-medium text-foreground">Video 30</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function PricingTeaser() {
  const features = [
    "50 free credits to start",
    "AI image & video generation",
    "Multiple styles and resolutions",
    "No credit card required",
  ];
  return (
    <section id="pricing" className="py-24 border-t border-border">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Badge variant="outline" className="border-border bg-muted/50">Pricing</Badge>
        <h2 className="mt-4 font-display text-4xl font-bold">Start with 50 free credits</h2>
        <p className="mt-3 text-muted-foreground">No credit card required. Upgrade when you need more.</p>
        <Card className="glass border-0 p-8 mt-10 glow-purple text-left">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-display font-semibold text-xl">Free Plan</h3>
              <p className="text-sm text-muted-foreground mt-1">Everything you need to start creating with AI.</p>
            </div>
            <Badge className="btn-gradient text-white border-0">Free</Badge>
          </div>
          <ul className="mt-6 grid sm:grid-cols-2 gap-2 text-sm">
            {features.map((f) => (
              <li key={f} className="flex gap-2"><Check className="size-4 text-primary shrink-0 mt-0.5" />{f}</li>
            ))}
          </ul>
          <Link to="/signup" className="block mt-7">
            <Button size="lg" className="w-full btn-gradient text-white border-0">
              Start Free <ArrowRight className="ml-1 size-4" />
            </Button>
          </Link>
        </Card>
      </div>
    </section>
  );
}

export const plans: Array<{
  name: string; price: string; suffix: string; badge: string | null; featured: boolean; features: string[]; cta: string;
}> = [];

function FAQ() {
  const faqs = [
    { q: "What is Auto Seedance?", a: "Auto Seedance is an AI generation platform that lets you create professional images and videos from text prompts using advanced AI models like Seedream and Seedance." },
    { q: "How does AI image generation work?", a: "Enter a text prompt describing your desired image, choose a style and size, and the AI generates high-quality images in seconds. You can also use reference images to guide the output." },
    { q: "How does AI video generation work?", a: "Describe your video scene with a text prompt, set duration, resolution, and aspect ratio. The AI creates cinematic videos with optional audio in 2-3 minutes." },
    { q: "Is Auto Seedance free to use?", a: "Yes, you start with 50 free credits. Image generation costs 5 credits and video generation costs 30 credits. You can upgrade to a paid plan for more credits." },
    { q: "What AI models does Auto Seedance use?", a: "Auto Seedance uses Seedream v4.5 for image generation and Seedance 2.0 for video generation, providing professional-quality output." },
  ];
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <Badge variant="outline" className="border-border bg-muted/50">FAQ</Badge>
          <h2 className="mt-4 font-display text-4xl font-bold">Questions, answered.</h2>
        </div>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border-border">
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="glass rounded-3xl p-12 text-center grid-bg">
          <ShieldCheck className="size-10 mx-auto text-primary" />
          <h2 className="mt-4 font-display text-4xl font-bold">Start creating with AI today.</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            50 free credits, no credit card required. Generate images and videos in seconds.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/signup"><Button size="lg" className="btn-gradient text-white border-0 h-12 px-6"><Sparkles className="size-4 mr-2" /> Start Free</Button></Link>
            <Link to="/pricing"><Button size="lg" variant="outline" className="h-12 px-6 border-border bg-muted/50">View Pricing</Button></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
