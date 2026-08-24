import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "src/routes/index.tsx");
let source = await fs.readFile(indexPath, "utf8");

if (!source.includes('from "@/integrations/supabase/client"')) {
  source = source.replace(
    'import { fetchAllPosts, type PostListItem } from "@/lib/sanity";',
    'import { fetchAllPosts, type PostListItem } from "@/lib/sanity";\nimport { supabase } from "@/integrations/supabase/client";'
  );
}

const start = source.indexOf("function PricingPreview() {");
const end = source.indexOf("\nfunction Comparison() {", start);
if (start === -1 || end === -1) throw new Error("PricingPreview boundaries not found");

const replacement = String.raw`function PricingPreview() {
  const fallbackPlans = [
    { name: 'Standard', label: 'For growing output', text: 'More monthly credits plus priority generation and support.', price_monthly: 24.90, monthly_credits: 1600, features: ['1,600 credits/month', 'AI image generation', 'AI video generation', 'Multiple AI models', 'Priority generation', 'No watermark', 'Private generation', 'Priority customer support', 'Commercial Use License'], featured: false },
    { name: 'Pro', label: 'For active creators', text: 'The recommended plan for creators producing content frequently.', price_monthly: 49.90, monthly_credits: 4000, features: ['4,000 credits/month', 'AI image generation', 'AI video generation', 'Multiple AI models', 'Fastest generation speed', 'No watermark', 'Private generation', 'Expert team support', 'Commercial Use License'], featured: true },
    { name: 'Basic', label: 'For regular creators', text: 'A practical credit allowance for creators making content every week.', price_monthly: 7.95, monthly_credits: 500, features: ['500 credits/month', 'AI image generation', 'AI video generation', 'Multiple AI models', 'Standard generation speed', 'No watermark', 'Private generation', 'Customer support', 'Commercial Use License'], featured: false },
  ];

  const { data: plans = fallbackPlans } = useQuery({
    queryKey: ['pricing', 'active-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('name, display_name, price_monthly, monthly_credits, features, is_active, sort_order')
        .eq('is_active', true)
        .neq('name', 'Free');
      if (error) throw error;
      const preferredOrder = ['Standard', 'Pro', 'Basic'];
      return (data ?? [])
        .sort((a, b) => {
          const ai = preferredOrder.indexOf(a.name);
          const bi = preferredOrder.indexOf(b.name);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || (a.sort_order ?? 0) - (b.sort_order ?? 0);
        })
        .slice(0, 3)
        .map((plan) => ({
          name: plan.display_name ?? plan.name,
          label: plan.name === 'Pro' ? 'For active creators' : plan.name === 'Standard' ? 'For growing output' : 'For regular creators',
          text: plan.name === 'Pro' ? 'The recommended plan for creators producing content frequently.' : plan.name === 'Standard' ? 'More monthly credits plus priority generation and support.' : 'A practical credit allowance for creators making content every week.',
          price_monthly: Number(plan.price_monthly ?? 0),
          monthly_credits: Number(plan.monthly_credits ?? 0),
          features: Array.isArray(plan.features) ? plan.features : [],
          featured: plan.name === 'Pro',
        }));
    },
    initialData: fallbackPlans,
    staleTime: 60_000,
  });

  return <section id="pricing" className="border-y border-border bg-gradient-to-r from-[#f3eef8] via-[#faf5f1] to-[#f5edf6] py-24 md:py-28">
    <div className="mx-auto max-w-6xl px-4">
      <SectionIntro eyebrow="Plans for different creation needs" title="Choose the plan that fits your content volume" description="Auto Seedance uses one credit balance across its creation tools. Start with the right plan, then scale when you need more monthly generation capacity." />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {plans.map((plan, i) => <motion.div key={plan.name} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * .07 }} whileHover={{ y: -5 }}>
          <Card className={"relative h-full border-border bg-white/80 p-7 shadow-sm backdrop-blur transition-all " + (plan.featured ? "border-primary/60 ring-2 ring-primary/50 shadow-xl shadow-primary/20 before:absolute before:-inset-px before:-z-10 before:rounded-2xl before:bg-primary/20 before:blur-xl" : "")}>
            {plan.featured && <Badge className="absolute -top-3 left-6 border-0 bg-primary text-primary-foreground shadow-lg shadow-primary/30">Most popular</Badge>}
            <div className="flex items-start justify-between gap-3">
              <div><div className="text-xs font-bold uppercase tracking-[.16em] text-primary">{plan.label}</div><h3 className="mt-2 font-display text-2xl font-bold">{plan.name}</h3></div>
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Sparkles className="size-5" /></div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{plan.text}</p>
            <div className="mt-5 text-3xl font-display font-bold">\${Number(plan.price_monthly).toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary">{Number(plan.monthly_credits).toLocaleString()} credits/month</div>
            <div className="mt-5 space-y-3">{plan.features.map((point) => <div key={point} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{point}</div>)}</div>
            <Link to="/pricing" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">{plan.featured ? 'Choose Pro' : 'View plan'} <ArrowRight className="size-4" /></Link>
          </Card>
        </motion.div>)}
      </div>
    </div>
  </section>;
}`;

source = source.slice(0, start) + replacement + source.slice(end);
await fs.writeFile(indexPath, source, "utf8");
console.log("✓ Prepared home pricing preview: Standard / Pro / Basic with live Supabase plan sync.");

// Normalize SEO metadata at build time across every public route so emitted
// HTML, canonicals, Open Graph URLs, sitemap generation and robots all use
// the same canonical host and current free-credit amount.
const routeDir = path.join(root, "src/routes");
const routeFiles = (await fs.readdir(routeDir)).filter((file) => file.endsWith(".tsx"));
const seoFiles = [
  path.join(root, "index.html"),
  path.join(root, "src/lib/seo.ts"),
  path.join(root, "scripts/generate-sitemap.ts"),
  path.join(root, "public/robots.txt"),
  ...routeFiles.map((file) => path.join(routeDir, file)),
];

const fakeRatingPattern = /\s*aggregateRating:\s*\{\s*["']@type["']:\s*["']AggregateRating["'],\s*ratingValue:\s*["'][^"']+["'],\s*ratingCount:\s*["'][^"']+["'],?\s*\},?/g;

for (const filePath of seoFiles) {
  let text;
  try {
    text = await fs.readFile(filePath, "utf8");
  } catch {
    continue;
  }

  const normalized = text
    .replaceAll("https://autoseedance.site", "https://www.autoseedance.site")
    .replaceAll("50 free credits", "30 free credits")
    .replaceAll("50 Free Credits", "30 Free Credits")
    .replaceAll("50 credits", "30 credits")
    .replaceAll("50 Credits", "30 Credits")
    .replaceAll("/og-image.png", "/web-app-manifest-512x512.png")
    .replaceAll("/android-chrome-512x512.png", "/web-app-manifest-512x512.png")
    .replaceAll("/#features", "/#tools")
    .replace(fakeRatingPattern, "");

  if (normalized !== text) await fs.writeFile(filePath, normalized, "utf8");
}

// Remove the Framer Motion dependency from the public landing bundle at build
// time. The page keeps the same semantic HTML and visual styling, but the
// animation library is not needed for the first public page load.
const landingPath = path.join(routeDir, "index.tsx");
let landingSource = await fs.readFile(landingPath, "utf8");
landingSource = landingSource.replace('import { motion } from "framer-motion";\n', `
const stripMotionProps = ({ initial, animate, transition, whileInView, viewport, whileHover, ...props }: any) => props;
const motion = {
  div: ({ children, ...props }: any) => <div {...stripMotionProps(props)}>{children}</div>,
  h1: ({ children, ...props }: any) => <h1 {...stripMotionProps(props)}>{children}</h1>,
  p: ({ children, ...props }: any) => <p {...stripMotionProps(props)}>{children}</p>,
};
`);
await fs.writeFile(landingPath, landingSource, "utf8");

// The navbar is present on every public page. Remove its animation dependency
// from the shared public bundle while preserving the header markup.
const navbarPath = path.join(root, "src/components/site/Navbar.tsx");
let navbarSource = await fs.readFile(navbarPath, "utf8");
navbarSource = navbarSource
  .replace('import { motion } from "framer-motion";\n', "")
  .replace('<motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className=', '<header className=')
  .replace('</motion.header>', '</header>');
await fs.writeFile(navbarPath, navbarSource, "utf8");

console.log("✓ Removed Framer Motion from the public landing/navbar bundle; animation-heavy dashboard/tool routes remain code-split.");

// The Reel Studio was the one public tool page with only a minimal head.
// Give it the same crawlable metadata and entity/schema signals as the other
// public tools. This is intentionally done before SSR so crawlers receive it
// in the initial HTML rather than after hydration.
const reelPath = path.join(routeDir, "tools.reel-studio.tsx");
let reelSource = await fs.readFile(reelPath, "utf8");
const minimalReelHead = `  head: () => ({
    meta: [
      { title: "AI Reel Studio — Generate Short Videos with Voiceover | Auto Seedance" },
      {
        name: "description",
        content:
          "Turn any idea into a ready-to-publish short video. Pick a style, model, voiceover, captions, and get a finished 30s/60s/90s reel in minutes.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.autoseedance.site/tools/reel-studio" }],
  }),`;
const richReelHead = `  head: () => ({
    meta: [
      { title: "AI Reel Studio — Generate Short Videos with Voiceover | Auto Seedance" },
      {
        name: "description",
        content:
          "Turn any idea into a ready-to-publish short video. Pick a style, model, voiceover, captions, and get a finished 30s/60s/90s reel in minutes.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1" },
      { property: "og:site_name", content: "Auto Seedance" },
      { property: "og:title", content: "AI Reel Studio — Generate Short Videos with Voiceover" },
      { property: "og:description", content: "Turn an idea into a short-form video with scenes, voiceover, captions, and export." },
      { property: "og:url", content: "https://www.autoseedance.site/tools/reel-studio" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.autoseedance.site/web-app-manifest-512x512.png" },
      { property: "og:image:alt", content: "Auto Seedance AI Reel Studio" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AI Reel Studio — Auto Seedance" },
      { name: "twitter:description", content: "Create short-form videos with AI scenes, voiceover and captions." },
      { name: "twitter:image", content: "https://www.autoseedance.site/web-app-manifest-512x512.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.autoseedance.site/tools/reel-studio" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Auto Seedance AI Reel Studio",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          url: "https://www.autoseedance.site/tools/reel-studio",
          description: "Create short-form videos from an idea using AI-generated scenes, voiceover and captions.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.autoseedance.site/" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://www.autoseedance.site/tools" },
            { "@type": "ListItem", position: 3, name: "Reel Studio", item: "https://www.autoseedance.site/tools/reel-studio" },
          ],
        }),
      },
    ],
  }),`;
if (reelSource.includes(minimalReelHead)) {
  reelSource = reelSource.replace(minimalReelHead, richReelHead);
  await fs.writeFile(reelPath, reelSource, "utf8");
  console.log("✓ Added full initial-HTML SEO metadata and schema to Reel Studio.");
} else if (!reelSource.includes("@type: \"SoftwareApplication\"")) {
  console.warn("⚠ Reel Studio head did not match the expected template; no rich head rewrite applied.");
}

console.log("✓ Normalized public SEO metadata: canonical www host, 30 free credits, no fabricated ratings.");
