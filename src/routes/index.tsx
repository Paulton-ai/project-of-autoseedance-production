import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PostCard } from "@/components/blog/PostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  Check,
  Coins,
  Image as ImageIcon,
  Layers3,
  Play,
  Rocket,
  Sparkles,
  WandSparkles,
  Video,
  Workflow,
  Zap,
} from "lucide-react";
import { fetchAllPosts, type PostListItem } from "@/lib/sanity";

const SITE_URL = "https://autoseedance.site";
const HERO_VIDEO =
  "https://vcercajwtbjbvjhzivjb.supabase.co/storage/v1/object/sign/uploads/Untitled%20design.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ZTVlNzIxOC0yZGFlLTRhNTEtODRkNS0yN2JjNGI0MzQ5MTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ1cGxvYWRzL1VudGl0bGVkIGRlc2lnbi5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgxOTM1Mzg1LCJleHAiOjIwOTcyOTUzODV9.wKr8TxfhrTfRlUzrE2FAI6K9bmmz-5I-ut6i5qVXWtg";

export const Route = createFileRoute("/")({
  loader: async () => ({ posts: await fetchAllPosts() }),
  component: Landing,
  head: ({ loaderData }) => {
    const posts = (loaderData?.posts || []).slice(0, 6);
    const blogItems = posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: post.title,
      url: `${SITE_URL}/blog/${post.slug.current}`,
    }));

    return {
      meta: [
        {
          title: "Free AI Image & Video Generator | Auto Seedance",
        },
        {
          name: "description",
          content:
            "Create AI images and videos from text prompts with Auto Seedance. Explore AI image generation, AI video generation, creative workflows, and practical guides in one platform.",
        },
        {
          name: "robots",
          content: "index, follow, max-image-preview:large, max-video-preview:-1",
        },
        {
          property: "og:title",
          content: "Auto Seedance — AI Image & Video Generator",
        },
        {
          property: "og:description",
          content:
            "Create AI images and videos from text prompts with a focused creative workflow for images, video, and short-form content.",
        },
        { property: "og:url", content: `${SITE_URL}/` },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${SITE_URL}/og-image.png` },
        {
          property: "og:image:alt",
          content: "Auto Seedance AI image and video generator",
        },
        { property: "og:locale", content: "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Auto Seedance — AI Image & Video Generator",
        },
        {
          name: "twitter:description",
          content:
            "Create AI images and videos from text prompts with Auto Seedance.",
        },
        { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Auto Seedance",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Web Browser",
            url: SITE_URL,
            description:
              "Web-based AI image and video generation tools for creating visual content from prompts.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Auto Seedance",
            url: SITE_URL,
            description:
              "AI image and video generation tools, workflows, and educational guides.",
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Latest Auto Seedance guides",
            itemListElement: blogItems,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is Auto Seedance?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Auto Seedance is a web-based AI content creation platform for generating images and videos from prompts, with tools for image generation, video generation, and short-form content workflows.",
                },
              },
              {
                "@type": "Question",
                name: "Can I generate AI images with Auto Seedance?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. The AI image generator turns text prompts into visual content and provides options for different styles, aspect ratios, and output settings.",
                },
              },
              {
                "@type": "Question",
                name: "Can I generate AI videos with Auto Seedance?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. The AI video generator creates short video clips from prompts with configurable output settings supported by the current video tool.",
                },
              },
              {
                "@type": "Question",
                name: "Who can use Auto Seedance?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Auto Seedance is designed for creators, marketers, social media teams, educators, and anyone who needs AI-generated visual content without building a complex production workflow from scratch.",
                },
              },
            ],
          }),
        },
      ],
    };
  },
});

function Landing() {
  const { posts: initialPosts } = Route.useLoaderData();
  const { data: posts = initialPosts } = useQuery({
    queryKey: ["sanity", "posts", "home"],
    queryFn: fetchAllPosts,
    initialData: initialPosts,
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <TrustStrip />
      <CreationTools />
      <HowItWorks />
      <UseCases />
      <WhyAutoSeedance />
      <Comparison />
      <BlogSection posts={posts} />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 grid-bg">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Badge variant="outline" className="border-border bg-white/70 backdrop-blur">
            <Sparkles className="mr-1.5 size-3.5 text-primary" />
            AI image &amp; video creation
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mx-auto mt-6 max-w-5xl font-display text-5xl font-bold tracking-tight leading-[1.03] md:text-7xl"
        >
          Create AI images and videos
          <br />
          <span className="gradient-text">without a complicated workflow.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg"
        >
          Auto Seedance brings AI image generation, AI video generation, and creator-focused tools into one simple workspace. Turn a prompt into visuals, experiment with ideas, and move from concept to publish-ready content faster.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.25 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Link to="/signup">
            <Button size="lg" className="btn-gradient h-12 border-0 px-7 text-white shadow-lg shadow-primary/20">
              Start creating free <ArrowRight className="ml-1.5 size-4" />
            </Button>
          </Link>
          <Link to="/tools/image">
            <Button size="lg" variant="outline" className="h-12 bg-white/70 px-7">
              Try AI Image Generator
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mx-auto mt-14 max-w-5xl"
        >
          <div className="glass glow-purple overflow-hidden rounded-3xl p-2 md:p-3">
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="aspect-video w-full object-cover"
                src={HERO_VIDEO}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-5 pb-5 pt-16 text-left md:px-7 md:pb-7">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <span className="grid size-8 place-items-center rounded-full bg-white/15 backdrop-blur">
                    <Play className="ml-0.5 size-3.5 fill-current" />
                  </span>
                  See the kind of AI visual workflow Auto Seedance is built for.
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="mx-auto mt-5 max-w-2xl text-xs text-muted-foreground">
          Generate images and videos from prompts, then explore practical guides for getting better results from modern AI creation tools.
        </p>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { value: "Image", label: "AI image generation", icon: ImageIcon },
    { value: "Video", label: "AI video generation", icon: Video },
    { value: "Workflow", label: "Creator-focused tools", icon: Workflow },
    { value: "Guides", label: "Practical AI tutorials", icon: WandSparkles },
  ];

  return (
    <section className="border-y border-border bg-white/70">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border md:grid-cols-4">
        {items.map((item) => (
          <div key={item.value} className="flex items-center justify-center gap-3 px-4 py-5 text-center md:py-6">
            <item.icon className="hidden size-5 text-primary sm:block" />
            <div>
              <div className="font-display text-sm font-bold md:text-base">{item.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CreationTools() {
  const tools = [
    {
      icon: ImageIcon,
      eyebrow: "TEXT TO IMAGE",
      title: "AI Image Generator",
      description:
        "Turn natural-language prompts into original images for thumbnails, concepts, social posts, illustrations, product ideas, and creative experiments.",
      bullets: [
        "Prompt-based image creation",
        "Multiple visual styles and output settings",
        "Designed for fast creative iteration",
      ],
      href: "/tools/image",
    },
    {
      icon: Video,
      eyebrow: "TEXT TO VIDEO",
      title: "AI Video Generator",
      description:
        "Create short AI-generated video clips from a scene description. Build cinematic concepts, social visuals, motion ideas, and storytelling shots from text.",
      bullets: [
        "Prompt-driven video creation",
        "Configurable video output options",
        "Built for short-form creative workflows",
      ],
      href: "/tools/video",
    },
    {
      icon: Zap,
      eyebrow: "SHORT-FORM WORKFLOW",
      title: "AI Reel Studio",
      description:
        "Go beyond a single generation with a workflow for turning an idea into short-form content using script, voice, clips, captions, and video assembly tools.",
      bullets: [
        "Script and clip workflow",
        "Voice and caption tools",
        "Designed around short-form publishing",
      ],
      href: "/tools/reel-studio",
    },
  ];

  return (
    <section className="py-24 md:py-28" id="ai-tools">
      <div className="mx-auto max-w-6xl px-4">
        <SectionIntro
          eyebrow="AI creation tools"
          title="Everything you need to start creating with AI"
          description="Use one tool or combine them into a complete content workflow. Each tool has its own focused workspace so you can get from idea to output without unnecessary steps."
        />

        <div className="mt-12 space-y-5">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
            >
              <Card className="group overflow-hidden border-border bg-white p-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="grid items-stretch md:grid-cols-[1.05fr_.95fr]">
                  <div className="p-7 md:p-9">
                    <div className="flex items-center gap-3">
                      <div className="grid size-11 place-items-center rounded-2xl btn-gradient">
                        <tool.icon className="size-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold tracking-[0.18em] text-primary">{tool.eyebrow}</span>
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-bold md:text-3xl">{tool.title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">{tool.description}</p>
                    <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                      {tool.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={tool.href} className="mt-7 inline-flex items-center text-sm font-semibold text-primary">
                      Explore {tool.title} <ArrowRight className="ml-1.5 size-4 transition group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <div className="relative min-h-56 overflow-hidden bg-gradient-to-br from-amber-50 via-white to-rose-50 p-6 md:min-h-72">
                    <ToolVisual type={index} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ToolVisual({ type }: { type: number }) {
  if (type === 0) {
    return (
      <div className="absolute inset-5 rounded-2xl border border-white/80 bg-white/85 p-4 shadow-xl backdrop-blur md:inset-8 md:p-5">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-24 rounded-full bg-muted" />
          <div className="h-7 w-16 rounded-lg btn-gradient" />
        </div>
        <div className="mt-5 rounded-xl bg-gradient-to-br from-orange-100 via-rose-100 to-slate-100 p-5">
          <div className="mx-auto aspect-[4/3] max-w-xs rounded-xl bg-gradient-to-br from-slate-900 via-indigo-700 to-rose-400 shadow-lg" />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-2 flex-1 rounded-full bg-muted" />
          <div className="h-2 w-16 rounded-full bg-primary/30" />
        </div>
      </div>
    );
  }

  if (type === 1) {
    return (
      <div className="absolute inset-5 overflow-hidden rounded-2xl border border-white/80 bg-slate-950 p-3 shadow-xl md:inset-8 md:p-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="size-2 rounded-full bg-white/30" />
          <span className="size-2 rounded-full bg-white/30" />
          <span className="size-2 rounded-full bg-white/30" />
          <span className="ml-auto h-2 w-20 rounded-full bg-white/10" />
        </div>
        <div className="mt-3 grid h-[calc(100%-2rem)] place-items-center rounded-xl bg-gradient-to-br from-indigo-950 via-purple-900 to-rose-700">
          <div className="rounded-full border border-white/30 bg-white/10 px-5 py-3 text-xs font-semibold text-white backdrop-blur">
            Prompt → Motion → Video
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-5 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xl md:inset-8 md:p-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <div className="size-8 rounded-lg bg-primary/15" />
          <div className="size-8 rounded-lg bg-secondary/15" />
          <div className="size-8 rounded-lg bg-slate-200" />
        </div>
        <div className="h-7 w-20 rounded-lg btn-gradient" />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {["Script", "Voice", "Clips"].map((label, index) => (
          <div key={label} className="rounded-xl bg-muted p-3 text-center">
            <div className="mx-auto grid size-8 place-items-center rounded-lg bg-white shadow-sm">
              {index === 0 ? <WandSparkles className="size-4 text-primary" /> : index === 1 ? <Zap className="size-4 text-secondary" /> : <Video className="size-4" />}
            </div>
            <div className="mt-2 text-[10px] font-semibold">{label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 h-14 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10" />
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { number: "01", icon: WandSparkles, title: "Describe your idea", text: "Write what you want to see. Clear prompts help you control the subject, style, scene, camera, mood, and motion." },
    { number: "02", icon: Sparkles, title: "Generate", text: "Choose the right AI creation tool and turn your prompt into an image or video without a traditional editing workflow." },
    { number: "03", icon: Layers3, title: "Refine your result", text: "Iterate on the concept, experiment with variations, and use the output as the starting point for your next creative step." },
    { number: "04", icon: Rocket, title: "Publish or reuse", text: "Use your generated visuals for social content, creative concepts, thumbnails, campaigns, presentations, and more." },
  ];

  return (
    <section className="border-y border-border bg-muted/25 py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionIntro
          eyebrow="Simple workflow"
          title="From prompt to visual in four steps"
          description="You do not need a complex production stack to start experimenting with AI visuals. Auto Seedance keeps the workflow focused and approachable."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.07 }}
              className="relative rounded-2xl border border-border bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </div>
                <span className="font-display text-4xl font-bold text-muted">{step.number}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  const cases = [
    ["Social media creators", "Create visual hooks, short clips, concepts, and supporting assets for TikTok, Reels, Shorts, and social posts."],
    ["YouTube creators", "Generate thumbnail concepts, visual scenes, B-roll ideas, and supporting graphics for videos and documentaries."],
    ["Marketers", "Explore campaign concepts, product visuals, ad creative directions, and social variations before committing to production."],
    ["Storytellers", "Turn written ideas into visual scenes, characters, environments, and short cinematic experiments."],
    ["Educators", "Build visual examples and explainers that make abstract ideas easier to demonstrate and understand."],
    ["AI workflow builders", "Use generation tools as building blocks inside a larger content-production process instead of switching between many unrelated apps."],
  ];

  return (
    <section className="py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionIntro
          eyebrow="Built for creators"
          title="What can you create with Auto Seedance?"
          description="AI generation is useful far beyond one-off experiments. The platform is designed around practical content tasks where visual iteration matters."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map(([title, text], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-5 grid size-9 place-items-center rounded-xl bg-primary/10 font-display text-sm font-bold text-primary">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyAutoSeedance() {
  const benefits = [
    ["Focused creation workflow", "Image, video, and short-form tools are organized around the jobs creators actually need to complete."],
    ["Prompt-first experience", "Start from an idea instead of learning a complicated timeline, node graph, or production interface."],
    ["Learn while you create", "The Auto Seedance blog adds prompt guides, tutorials, comparisons, and practical AI workflow articles alongside the tools."],
    ["Built for iteration", "AI creation is rarely one-and-done. The workflow is designed to make trying another prompt or direction feel lightweight."],
  ];

  return (
    <section className="py-24 md:py-28 grid-bg">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div>
          <Badge variant="outline" className="border-border bg-white/70">Why Auto Seedance</Badge>
          <h2 className="mt-5 font-display text-4xl font-bold tracking-tight md:text-5xl">
            One place to explore the AI visual creation workflow.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            There are many AI generators, but the hard part is often the workflow around them: knowing which tool to use, how to prompt it, how to iterate, and where to learn what works. Auto Seedance combines the creation tools with educational content so the product and the learning loop live together.
          </p>
          <Link to="/blog" className="mt-7 inline-flex items-center text-sm font-semibold text-primary">
            Explore the AI guides <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map(([title, text], index) => (
            <Card key={title} className="border-border bg-white p-6 shadow-sm">
              <div className="grid size-10 place-items-center rounded-xl btn-gradient text-white">
                {index === 0 ? <Workflow className="size-5" /> : index === 1 ? <WandSparkles className="size-5" /> : index === 2 ? <Sparkles className="size-5" /> : <Zap className="size-5" />}
              </div>
              <h3 className="mt-5 font-display font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const rows = [
    ["AI image generation", true, true, "Auto Seedance"],
    ["AI video generation", true, true, "Auto Seedance"],
    ["Creator-focused workflow", true, false, "Auto Seedance"],
    ["Short-form content workflow", true, false, "Auto Seedance"],
    ["Learning guides alongside tools", true, false, "Auto Seedance"],
    ["Single-purpose generation only", false, true, "Depends on platform"],
  ];

  return (
    <section className="py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionIntro
          eyebrow="Choosing an AI generator"
          title="How Auto Seedance fits into the AI generator landscape"
          description="Different AI platforms solve different problems. Instead of claiming every tool is the same, this comparison shows the workflow Auto Seedance is designed to cover."
        />

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="grid grid-cols-[1.5fr_.55fr_.55fr_.85fr] border-b border-border bg-muted/50 px-4 py-4 text-xs font-semibold md:px-6">
            <span>Capability</span>
            <span>Auto Seedance</span>
            <span>Typical generator</span>
            <span>Focus</span>
          </div>
          {rows.map(([label, auto, typical, focus], index) => (
            <div key={label} className="grid grid-cols-[1.5fr_.55fr_.55fr_.85fr] items-center border-b border-border px-4 py-4 text-sm last:border-0 md:px-6">
              <span className="pr-3 font-medium">{label}</span>
              <span>{auto ? <Check className="size-4 text-primary" /> : <span className="text-muted-foreground">—</span>}</span>
              <span>{typical ? <Check className="size-4 text-muted-foreground" /> : <span className="text-muted-foreground">—</span>}</span>
              <span className="text-xs text-muted-foreground">{focus}</span>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-5 text-muted-foreground">
          This is a workflow comparison, not a claim that every competing product lacks a specific feature. Individual AI platforms change frequently, so verify current model and pricing details on their respective product pages before making a purchasing decision.
        </p>
      </div>
    </section>
  );
}

function BlogSection({ posts }: { posts: PostListItem[] }) {
  const latest = posts.slice(0, 4);

  return (
    <section className="border-y border-border bg-muted/25 py-24 md:py-28" id="guides">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Badge variant="outline" className="border-border bg-white/70">Latest guides</Badge>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">Learn how to get better AI results.</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Prompt guides, AI workflow tutorials, trend explainers, and practical articles designed to help you use image and video generators more effectively.
            </p>
          </div>
          <Link to="/blog">
            <Button variant="outline" className="bg-white">
              View all blogs <ArrowRight className="ml-1.5 size-4" />
            </Button>
          </Link>
        </div>

        {latest.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((post, index) => (
              <PostCard key={post._id} post={post} priority={index === 0} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-white p-10 text-center">
            <Sparkles className="mx-auto size-8 text-primary" />
            <h3 className="mt-4 font-display text-xl font-bold">AI guides are coming soon.</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">New articles will appear here automatically as they are published in Sanity.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "What is an AI image generator?",
      a: "An AI image generator creates images from natural-language instructions, often called prompts. You describe the subject, scene, style, composition, or mood and the model generates a visual interpretation of that description.",
    },
    {
      q: "What is an AI video generator?",
      a: "An AI video generator creates short video clips from text prompts and, depending on the tool, reference images or other inputs. It is useful for visual storytelling, social content, concept videos, and creative experimentation.",
    },
    {
      q: "Is Auto Seedance an AI image generator and AI video generator?",
      a: "Yes. Auto Seedance provides dedicated image and video generation tools, plus a short-form content workflow and educational guides for creators who want to build a repeatable AI content process.",
    },
    {
      q: "What can I use AI-generated images and videos for?",
      a: "Common uses include social media posts, short-form videos, thumbnails, visual concepts, storyboards, campaign ideas, educational visuals, product concepts, and other creative projects. Always check the terms of the specific model and service for commercial-use requirements.",
    },
    {
      q: "How do I learn better AI prompting?",
      a: "Start with a clear subject and goal, then add useful details such as setting, composition, visual style, camera direction, lighting, mood, and motion. The Auto Seedance blog provides practical guides and examples for different AI creation workflows.",
    },
  ];

  return (
    <section className="py-24 md:py-28" id="faq">
      <div className="mx-auto max-w-4xl px-4">
        <SectionIntro
          eyebrow="FAQ"
          title="Questions about AI image and video generation"
          description="Clear answers to common questions people have before choosing or using an AI generator."
          centered
        />
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q} className="border-border">
              <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
              <AccordionContent className="leading-7 text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="pb-24 md:pb-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl p-8 text-center text-white md:p-14" style={{ background: "linear-gradient(135deg, #F59E0B, #FB7185)" }}>
          <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-white/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 size-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <Badge className="border-white/30 bg-white/15 text-white">Start creating</Badge>
            <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">Turn your next idea into an AI-generated visual.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/85 md:text-base">Explore the image generator, video generator, and creator workflow — then use the blog to learn how to get more from your prompts.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/signup">
                <Button size="lg" className="h-12 border-0 bg-white px-7 text-foreground hover:bg-white/90">Start creating free <ArrowRight className="ml-1.5 size-4" /></Button>
              </Link>
              <Link to="/blog">
                <Button size="lg" variant="outline" className="h-12 border-white/40 bg-white/10 px-7 text-white hover:bg-white/20 hover:text-white">Read the guides</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <Badge variant="outline" className="border-border bg-white/70">{eyebrow}</Badge>
      <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">{description}</p>
    </div>
  );
}
