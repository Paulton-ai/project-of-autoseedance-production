import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

const SITE_URL = "https://www.autoseedance.site";

export const Route = createFileRoute("/ai-reel-generator")({
  component: AIReelGeneratorPage,
  head: () => ({
    meta: [
      { title: "AI Reel Generator — Create Short Videos From Ideas | Auto Seedance" },
      {
        name: "description",
        content:
          "Use Auto Seedance as an AI reel generator for short-form videos. Turn an idea into a script, scenes, voiceover, captions, assembly, and export.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { property: "og:title", content: "AI Reel Generator — Auto Seedance" },
      { property: "og:description", content: "Turn an idea into a structured short-form video with AI scenes, voiceover, captions, and export." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/ai-reel-generator` },
      { property: "og:image", content: `${SITE_URL}/web-app-manifest-512x512.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AI Reel Generator — Auto Seedance" },
      { name: "twitter:description", content: "Create short-form videos from an idea with script, scenes, voiceover and captions." },
      { name: "twitter:image", content: `${SITE_URL}/web-app-manifest-512x512.png` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/ai-reel-generator` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "AI Reel Generator", item: `${SITE_URL}/ai-reel-generator` },
          ],
        }),
      },
    ],
  }),
});

function AIReelGeneratorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <article className="mx-auto max-w-5xl px-4">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground hover:underline">Home</Link><span className="mx-2">/</span><span>AI Reel Generator</span>
          </nav>

          <header className="mt-8 max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Short-form video workflow</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">AI Reel Generator for ideas, stories, ads, and explainers</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              An AI reel generator is most useful when it helps with more than one isolated clip. Auto Seedance Reel Studio is built around a short-form workflow: start with an idea, turn it into a structured script, generate scenes, add voiceover and captions, assemble the result, and export the finished reel.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/tools/reel-studio" className="rounded-xl btn-gradient px-5 py-3 text-sm font-semibold text-white">Open Reel Studio</Link>
              <Link to="/blog" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-muted">Read AI creation guides</Link>
            </div>
          </header>

          <section className="mt-16 grid gap-5 md:grid-cols-3">
            {[
              ["Idea → script", "Start with a topic, story, lesson, advertisement, or other short-form concept and review the generated structure before spending generation credits."],
              ["Scenes → video", "Generate the visual scenes that make up the story, then inspect continuity, pacing, characters, objects, and text before assembly."],
              ["Voice → export", "Add voiceover and optional music, captions, and final assembly, then review the exported video before publishing it."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-xl font-semibold">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p>
              </div>
            ))}
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">What you can make</h2>
            <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">
              Reel Studio currently exposes niches such as education, documentary, real stories, entertainment, finance, sports, product and advertising, technology, food, travel, and more. The point is not to force every topic into one template; the niche helps keep the script and scene direction focused.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Educational explainers", "Documentary-style shorts", "Product and social ads", "Finance and technology content", "Food and travel videos", "Motivational and entertainment shorts",
              ].map((item) => <div key={item} className="rounded-xl border border-border px-4 py-4 text-sm font-medium">{item}</div>)}
            </div>
          </section>

          <section className="mt-16 rounded-3xl border border-border bg-card p-7 md:p-10">
            <h2 className="font-display text-3xl font-bold">How to get better AI reel results</h2>
            <div className="mt-7 space-y-7">
              {[
                ["Give the script a clear job", "State the audience and the result you want from the reel. A focused educational explanation needs a different structure from a product ad or entertainment story."],
                ["Treat the generated script as a draft", "Read the narration and scene descriptions before generating clips. Fix factual errors, repeated ideas, weak hooks, or claims you cannot support."],
                ["Keep visual direction consistent", "Choose a visual style and aspect ratio that fit the destination. Review scenes for continuity before moving to the final assembly."],
                ["Review audio and captions", "Check pronunciation, caption wording, timing, music levels, and any claims in the voiceover. Automated output still needs editorial review."],
                ["Design for the platform", "Portrait output is useful for short-form feeds. Keep the important visual information and captions inside the safe area so they remain readable on mobile screens."],
              ].map(([title, text]) => (
                <div key={title}>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">Models, length, and workflow controls</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              The current Reel Studio interface offers 30, 60, and 90 second reel lengths, portrait or landscape framing, voiceover, optional background music, caption styles, reference-image input, and multiple video-model choices including Wan, Kling, Veo, and Seedance. Model availability and provider behavior can change, so the generator interface is the source of truth for the options available when you create a reel.
            </p>
            <p className="mt-4 leading-8 text-muted-foreground">
              Auto Seedance uses a credit-based workflow. The public pricing page currently presents 30 promotional credits for new users; generation costs and paid-plan limits are shown in the product and pricing interface and can change over time.
            </p>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">AI reel generator FAQ</h2>
            <div className="mt-6 space-y-5">
              {[
                ["Can I create a complete reel from one idea?", "Reel Studio is designed to take an idea through script and scene planning, generation, voiceover, captions, assembly, and export. Review each stage before publishing."],
                ["Is the AI reel generator free?", "Auto Seedance uses credits. The site currently presents 30 promotional credits for new users; full generation uses credits according to the current product and pricing rules."],
                ["Can I edit the generated script?", "Yes. The workflow is designed so you can review and adjust the generated scene structure and narration before continuing with generation."],
                ["Should I publish an AI-generated reel without checking it?", "No. Check the script, visuals, audio, captions, rights, and factual claims before publishing, especially for advertising, news, finance, health, or other sensitive topics."],
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
              <Link to="/ai-image-generator" className="text-primary hover:underline">AI image generator</Link>
              <Link to="/how-we-test-ai-video-tools" className="text-primary hover:underline">How we test AI video tools</Link>
              <Link to="/blog" className="text-primary hover:underline">AI creation tutorials</Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
