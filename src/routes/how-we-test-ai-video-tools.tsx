import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

const SITE_URL = "https://www.autoseedance.site";

export const Route = createFileRoute("/how-we-test-ai-video-tools")({
  component: HowWeTestPage,
  head: () => ({
    meta: [
      { title: "How We Test AI Video Tools — Auto Seedance" },
      {
        name: "description",
        content:
          "Learn the evaluation framework Auto Seedance uses when publishing AI video tool tests and comparisons, including prompt adherence, motion, consistency, audio, speed, cost, and usability.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { property: "og:title", content: "How We Test AI Video Tools — Auto Seedance" },
      { property: "og:description", content: "Our framework for transparent AI video testing and comparisons." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/how-we-test-ai-video-tools` },
      { property: "og:image", content: `${SITE_URL}/web-app-manifest-512x512.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "How We Test AI Video Tools" },
      { name: "twitter:description", content: "The evaluation framework behind transparent AI video comparisons." },
      { name: "twitter:image", content: `${SITE_URL}/web-app-manifest-512x512.png` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/how-we-test-ai-video-tools` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "How We Test AI Video Tools", item: `${SITE_URL}/how-we-test-ai-video-tools` },
          ],
        }),
      },
    ],
  }),
});

function HowWeTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <article className="mx-auto max-w-5xl px-4">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground hover:underline">Home</Link><span className="mx-2">/</span><span>How We Test AI Video Tools</span>
          </nav>

          <header className="mt-8 max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Editorial methodology</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">How We Test AI Video Tools</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              AI video comparisons are easy to make badly. A single impressive clip does not prove that one model is better for every job. This page defines the evaluation framework Auto Seedance uses when an article makes a genuine testing or comparison claim. If a published article has not actually run a test, it should be presented as analysis or research rather than as first-hand testing.
            </p>
          </header>

          <section className="mt-16 rounded-3xl border border-border bg-card p-7 md:p-10">
            <h2 className="font-display text-3xl font-bold">1. Keep the test comparable</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              When comparing models or tools, the first goal is a fair setup. Use the same or closely matched prompt intent, the same target aspect ratio where possible, and the same creative goal. Record the model name, version when available, settings, date, prompt, reference inputs, duration, and output format so a reader can understand what was actually tested.
            </p>
          </section>

          <section className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              ["Prompt adherence", "Does the output follow the important parts of the prompt, including the subject, action, environment, composition, and requested style?"],
              ["Motion quality", "Does movement look coherent from frame to frame? Check camera motion, body movement, object motion, and transitions."],
              ["Character consistency", "When the task requires a recurring character, does the appearance remain recognizable across shots and generations?"],
              ["Image-to-video behavior", "When an image is supplied, does the model preserve the important subject, composition, and identity while adding useful motion?"],
              ["Audio", "Where audio is part of the workflow, check dialogue, music, sound effects, synchronization, intelligibility, and unwanted artifacts."],
              ["Text rendering", "Test visible text separately. AI video models can struggle with exact spelling, logos, labels, and other typography."],
              ["Speed and reliability", "Record meaningful generation time and failures when they are part of the comparison. Do not turn one unusually fast or slow attempt into a universal claim."],
              ["Cost", "Compare the actual credits, subscriptions, generation limits, or other costs relevant to the task. Pricing changes should be dated and sourced."],
              ["Usability", "Evaluate the workflow itself: prompting, references, model selection, iteration, review, export, and how much manual work remains."],
              ["Limitations", "A useful review must document failure cases and constraints, not only successful outputs."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
              </div>
            ))}
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">What a published test should show</h2>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-muted/50"><tr><th className="p-4 font-semibold">Field</th><th className="p-4 font-semibold">Evidence to record</th><th className="p-4 font-semibold">Why it matters</th></tr></thead>
                <tbody>
                  {[
                    ["Model", "Provider, model/version when available", "Model behavior changes over time."],
                    ["Prompt", "Exact or clearly documented prompt", "Readers need to know what was asked."],
                    ["Settings", "Aspect ratio, duration, quality and references", "Settings can change the result."],
                    ["Result", "Output example or screenshot where rights permit", "Shows what the claim is based on."],
                    ["Failure", "What went wrong and how often it mattered", "Limitations are part of the product experience."],
                    ["Verdict", "Best-fit use case, not a universal winner", "Different tools solve different problems."],
                  ].map(([field, evidence, why]) => <tr key={field} className="border-t border-border"><td className="p-4 font-medium">{field}</td><td className="p-4 text-muted-foreground">{evidence}</td><td className="p-4 text-muted-foreground">{why}</td></tr>)}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-16 rounded-3xl border border-border p-7 md:p-10">
            <h2 className="font-display text-3xl font-bold">What we will not claim</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
              <p>We will not say we tested a tool when the article is based only on documentation, public examples, or third-party reporting.</p>
              <p>We will not invent benchmark scores, generation times, costs, user counts, ratings, or success rates.</p>
              <p>We will not declare Auto Seedance the winner of a comparison simply because it is our product.</p>
              <p>We will distinguish current product behavior from historical behavior when model versions or features change.</p>
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">How this connects to our articles</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              Articles that contain genuine tests should expose enough methodology for a reader to understand the conclusion. Articles that use official documentation or public information without first-hand testing should say so. This distinction helps readers separate product facts, editorial analysis, and direct experience.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link to="/blog" className="text-primary hover:underline">Browse the AI creation blog</Link>
              <Link to="/ai-video-generator" className="text-primary hover:underline">AI video generator</Link>
              <Link to="/ai-reel-generator" className="text-primary hover:underline">AI reel generator</Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
