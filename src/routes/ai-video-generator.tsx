import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

const SITE_URL = "https://www.autoseedance.site";

export const Route = createFileRoute("/ai-video-generator")({
  component: AIVideoGeneratorPage,
  head: () => ({
    meta: [
      { title: "AI Video Generator — Create Text-to-Video Clips | Auto Seedance" },
      {
        name: "description",
        content:
          "Explore Auto Seedance's AI video generator for text-to-video clips, multiple aspect ratios, 720p and 1080p output, references, and AI-generated audio.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { property: "og:title", content: "AI Video Generator — Auto Seedance" },
      { property: "og:description", content: "Create short AI video clips from scene descriptions with flexible output settings and references." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/ai-video-generator` },
      { property: "og:image", content: `${SITE_URL}/web-app-manifest-512x512.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AI Video Generator — Auto Seedance" },
      { name: "twitter:description", content: "Create AI video clips from text prompts and supported reference inputs." },
      { name: "twitter:image", content: `${SITE_URL}/web-app-manifest-512x512.png` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/ai-video-generator` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "AI Video Generator", item: `${SITE_URL}/ai-video-generator` },
          ],
        }),
      },
    ],
  }),
});

function AIVideoGeneratorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <article className="mx-auto max-w-5xl px-4">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground hover:underline">Home</Link><span className="mx-2">/</span><span>AI Video Generator</span>
          </nav>

          <header className="mt-8 max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Text-to-video creation</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">AI Video Generator for short scenes and creative production</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Auto Seedance's AI Video Generator is built for turning a described scene into a short video clip. Instead of starting with a timeline, you start with the subject, action, environment, camera direction, and visual style you want the model to interpret.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/tools/video" className="rounded-xl btn-gradient px-5 py-3 text-sm font-semibold text-white">Open AI Video Generator</Link>
              <Link to="/ai-reel-generator" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-muted">Build a complete reel</Link>
            </div>
          </header>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">What makes a useful text-to-video prompt?</h2>
            <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">
              Think of the prompt as a compact shot brief. Start with the main subject and action, then add the environment, time of day, camera movement, composition, lighting, mood, and important constraints. You do not need to repeat the same adjective dozens of times. The goal is a clear scene that a video model can interpret.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                ["Subject", "Who or what is visible? Describe the important visual characteristics without unnecessary filler."],
                ["Action", "Explain what changes during the clip. Small, specific movements are easier to review than vague instructions."],
                ["Camera", "Specify a useful camera idea such as a slow push-in, tracking shot, static close-up, or wide establishing shot."],
                ["Environment", "Give the model the location, time, weather, lighting, and key background elements that matter to the scene."],
                ["Style", "Choose a visual direction that matches the project, such as cinematic, documentary, animation, illustration, or another supported style."],
                ["Output goal", "Write for the final destination. Vertical clips suit many short-form feeds, while landscape is often better for standard YouTube or presentations."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-3xl border border-border bg-card p-7 md:p-10">
            <h2 className="font-display text-3xl font-bold">Current generator options</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["720p / 1080p", "Choose between the available HD and Full HD output settings."],
                ["16:9 / 9:16 / 1:1", "Match the frame to landscape video, short-form portrait content, or square layouts."],
                ["Reference inputs", "The current interface supports reference images and other supported media inputs. Upload only material you have the right to use."],
                ["AI audio", "The tool can generate background audio for supported video workflows; review the final result before publishing."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-border p-5">
                  <h3 className="font-display text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">Where AI video generation helps</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              Short generated clips can act as building blocks rather than finished films. Creators can use them for social posts, advertising concepts, visual explainers, story scenes, product concepts, transitions, backgrounds, and prototypes. The strongest workflow is usually iterative: generate a shot, inspect it, revise the prompt, and only keep the result when it serves the larger piece of content.
            </p>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">Review before you publish</h2>
            <div className="mt-7 space-y-4">
              {[
                "Check faces, hands, objects, signs, and other details for visual errors.",
                "Confirm that movement and camera behavior make sense from the first frame to the last.",
                "Listen to generated audio and check for unwanted sounds or timing problems.",
                "Verify any factual, product, price, or advertising claim in the accompanying narration or captions.",
                "Make sure references, logos, music, voices, and other supplied assets are used with the necessary rights.",
              ].map((item) => <div key={item} className="rounded-xl border border-border px-5 py-4 text-sm leading-6">{item}</div>)}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">AI video generator FAQ</h2>
            <div className="mt-6 space-y-5">
              {[
                ["Can I generate vertical videos for Shorts and Reels?", "Yes. The current generator exposes a 9:16 portrait option, alongside 16:9 landscape and 1:1 square output."],
                ["How long can a generated clip be?", "The available duration depends on the current generator settings and selected model. The tool interface is the source of truth for the options available at generation time."],
                ["Is AI video generation free?", "Auto Seedance uses credits. The public pricing page currently presents 30 promotional credits for new users, while individual generation costs and paid plans are shown in the product interface."],
                ["Can I use AI-generated video commercially?", "Commercial use depends on your plan, the applicable model provider terms, the rights to supplied inputs, and applicable law. Review the current Terms before publishing paid or branded work."],
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
              <Link to="/ai-reel-generator" className="text-primary hover:underline">AI reel generator</Link>
              <Link to="/ai-image-generator" className="text-primary hover:underline">AI image generator</Link>
              <Link to="/how-we-test-ai-video-tools" className="text-primary hover:underline">How we test AI video tools</Link>
              <Link to="/blog" className="text-primary hover:underline">AI video tutorials</Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
