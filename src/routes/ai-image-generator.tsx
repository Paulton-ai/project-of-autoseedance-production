import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

const SITE_URL = "https://www.autoseedance.site";

export const Route = createFileRoute("/ai-image-generator")({
  component: AIImageGeneratorPage,
  head: () => ({
    meta: [
      { title: "AI Image Generator — Create Images From Text | Auto Seedance" },
      {
        name: "description",
        content:
          "Create AI images from text prompts with Auto Seedance. Explore supported styles, reference images, 2K and 4K output, and practical prompt guidance.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { property: "og:title", content: "AI Image Generator — Auto Seedance" },
      { property: "og:description", content: "Generate visual assets from text prompts with style controls, reference images, and multiple output options." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/ai-image-generator` },
      { property: "og:image", content: `${SITE_URL}/web-app-manifest-512x512.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AI Image Generator — Auto Seedance" },
      { name: "twitter:description", content: "Create AI images from text prompts with practical style and reference controls." },
      { name: "twitter:image", content: `${SITE_URL}/web-app-manifest-512x512.png` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/ai-image-generator` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "AI Image Generator", item: `${SITE_URL}/ai-image-generator` },
          ],
        }),
      },
    ],
  }),
});

function AIImageGeneratorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <article className="mx-auto max-w-5xl px-4">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground hover:underline">Home</Link><span className="mx-2">/</span><span>AI Image Generator</span>
          </nav>

          <header className="mt-8 max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Text-to-image creation</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">AI Image Generator for thumbnails, concepts, social content, and visual ideas</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Auto Seedance's AI Image Generator turns a written description into a visual asset. The current workflow supports several visual styles, reference images, and multiple output settings so you can create a draft, inspect it, and iterate toward the result you actually need.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/tools/image" className="rounded-xl btn-gradient px-5 py-3 text-sm font-semibold text-white">Open Image Generator</Link>
              <Link to="/blog" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-muted">Read prompt guides</Link>
            </div>
          </header>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">A practical image prompt structure</h2>
            <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">
              A strong prompt usually gives the model a clear subject and enough visual context to make useful decisions. You can describe the subject, composition, environment, lighting, camera perspective, color direction, style, and the purpose of the image. Start with what matters most instead of filling the prompt with generic adjectives.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                ["Subject", "Describe the person, object, product, animal, scene, or concept that must be visible."],
                ["Composition", "Explain framing, camera angle, perspective, foreground/background relationships, and where the main subject should sit."],
                ["Environment", "Add the setting and important contextual details that make the image understandable."],
                ["Lighting and mood", "Specify natural light, studio light, dramatic contrast, soft light, time of day, or another meaningful direction."],
                ["Visual style", "The current generator offers realistic photo, digital illustration, vector art, 3D render, anime/manga, oil painting, and watercolor styles."],
                ["Output goal", "Choose an aspect ratio or resolution that fits the destination, such as a social post, thumbnail, presentation, or concept board."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-3xl border border-border bg-card p-7 md:p-10">
            <h2 className="font-display text-3xl font-bold">Current image-generation controls</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["2K and 4K", "The current interface includes Auto 2K and Auto 4K output options alongside other preset sizes."],
                ["Reference images", "You can provide reference images to guide visual direction and composition. Upload only assets you have permission to use."],
                ["Multiple styles", "Switch between supported visual styles when a realistic photograph, illustration, vector, 3D, anime, oil, or watercolor direction is more appropriate."],
                ["Iterative workflow", "Generate, inspect, revise the prompt or settings, and generate again rather than expecting every first result to be perfect."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-border p-5">
                  <h3 className="font-display text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">Useful applications</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              AI images can act as finished assets or as inputs to a larger production workflow. Common applications include YouTube thumbnails, social posts, product concepts, advertising ideas, storyboards, mood boards, educational illustrations, and visual experiments. For commercial projects, review the rights and terms that apply to your plan, the model provider, and any reference material you supply.
            </p>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">Review the output like a designer</h2>
            <div className="mt-7 space-y-4">
              {[
                "Check faces, hands, text, logos, products, and other high-attention details for generation errors.",
                "Make sure the composition leaves enough space for the real use case, especially when text will be added later.",
                "If the image will become a video reference, choose a composition that gives the later motion model enough visual context.",
                "Do not assume generated facts, labels, prices, product claims, or realistic-looking details are accurate without checking them.",
                "Keep a copy of the prompt and important settings when a result is worth reproducing or refining later.",
              ].map((item) => <div key={item} className="rounded-xl border border-border px-5 py-4 text-sm leading-6">{item}</div>)}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">AI image generator FAQ</h2>
            <div className="mt-6 space-y-5">
              {[
                ["Can I create images from text prompts?", "Yes. The main workflow is prompt-based generation, with supported reference inputs and style/output controls."],
                ["What styles are available?", "The current interface lists realistic photo, digital illustration, vector art, 3D render, anime/manga, oil painting, and watercolor."],
                ["Can I use reference images?", "Yes. The current tool supports multiple reference images to guide the generation. Make sure you have the necessary rights to anything you upload."],
                ["Is the AI image generator free?", "Auto Seedance uses credits. The public pricing page currently presents 30 promotional credits for new users, while generation costs and paid plans are shown in the product interface."],
              ].map(([q, a]) => (
                <div key={q} className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-semibold">{q}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 border-t border-border pt-10">
            <h2 className="font-display text-2xl font-bold">Continue exploring</h2>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <Link to="/ai-video-generator" className="text-primary hover:underline">AI video generator</Link>
              <Link to="/ai-reel-generator" className="text-primary hover:underline">AI reel generator</Link>
              <Link to="/how-we-test-ai-video-tools" className="text-primary hover:underline">How we test AI video tools</Link>
              <Link to="/blog" className="text-primary hover:underline">AI image tutorials</Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
