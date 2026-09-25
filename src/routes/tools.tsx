import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ArrowRight, Clapperboard, Image as ImageIcon, Video } from "lucide-react";

const SITE_URL = "https://www.autoseedance.site";

export const Route = createFileRoute("/tools")({
  component: ToolsPage,
  head: () => ({
    meta: [
      { title: "AI Tools — Image, Video & Reel Generators | Auto Seedance" },
      {
        name: "description",
        content:
          "Explore Auto Seedance AI tools for image generation, video generation, and short-form reel creation. Choose the workflow that fits your project.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { property: "og:title", content: "AI Tools — Image, Video & Reel Generators | Auto Seedance" },
      { property: "og:description", content: "Choose an Auto Seedance AI image, video, or reel creation workflow." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/tools` },
      { property: "og:image", content: `${SITE_URL}/web-app-manifest-512x512.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AI Tools — Auto Seedance" },
      { name: "twitter:description", content: "AI image, video, and reel creation tools in one place." },
      { name: "twitter:image", content: `${SITE_URL}/web-app-manifest-512x512.png` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/tools` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Auto Seedance AI Tools",
          url: `${SITE_URL}/tools`,
          description: "AI image, video, and reel creation tools from Auto Seedance.",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "AI Image Generator", url: `${SITE_URL}/tools/image` },
              { "@type": "ListItem", position: 2, name: "AI Video Generator", url: `${SITE_URL}/tools/video` },
              { "@type": "ListItem", position: 3, name: "AI Reel Studio", url: `${SITE_URL}/tools/reel-studio` },
            ],
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools` },
          ],
        }),
      },
    ],
  }),
});

const tools = [
  {
    icon: ImageIcon,
    title: "AI Image Generator",
    text: "Create images from text prompts with supported styles, reference inputs, and output settings.",
    href: "/tools/image" as const,
  },
  {
    icon: Video,
    title: "AI Video Generator",
    text: "Turn scene descriptions into short AI video clips with supported resolution, aspect ratio, and reference controls.",
    href: "/tools/video" as const,
  },
  {
    icon: Clapperboard,
    title: "AI Reel Studio",
    text: "Move from an idea to a structured short-form video workflow with scenes, voiceover, captions, assembly, and export.",
    href: "/tools/reel-studio" as const,
  },
];

function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <article className="mx-auto max-w-6xl px-4">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <span aria-current="page">Tools</span>
          </nav>

          <header className="mt-8 max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Auto Seedance tools</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">AI Tools for Images, Videos, and Reels</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Choose the creation workflow that matches the job. Use the image generator for a single visual, the video generator for a short clip, or Reel Studio when you want to build a complete short-form video from an idea.
            </p>
          </header>

          <section className="mt-14 grid gap-5 md:grid-cols-3" aria-label="Auto Seedance AI tools">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.href} to={tool.href} className="group rounded-2xl border border-border bg-card p-7 transition hover:border-primary/40 hover:shadow-lg">
                  <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h2 className="mt-6 font-display text-2xl font-bold">{tool.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{tool.text}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Open tool <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </section>

          <section className="mt-16 max-w-4xl">
            <h2 className="font-display text-3xl font-bold">How to choose a tool</h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-7">
              <p><strong className="text-foreground">Need one image?</strong> Start with the AI Image Generator and describe the subject, composition, environment, lighting, and visual style.</p>
              <p><strong className="text-foreground">Need one moving scene?</strong> Use the AI Video Generator and write the subject, action, environment, camera direction, and output goal.</p>
              <p><strong className="text-foreground">Need a complete short?</strong> Use AI Reel Studio when you want the workflow to cover script structure, scenes, voiceover, captions, assembly, and export.</p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
