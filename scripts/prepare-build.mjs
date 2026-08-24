import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const routeDir = path.join(root, "src/routes");
const routeFiles = (await fs.readdir(routeDir)).filter((file) => file.endsWith(".tsx"));

// Normalize public SEO metadata at build time so the prerendered HTML always
// uses one canonical host, one valid image asset, and one free-credit value.
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

// The public landing page does not need Framer Motion to be interactive. Keep
// the same semantic elements and styling while replacing the animation layer
// with tiny static wrappers. This prevents the animation library from being
// pulled into the initial homepage bundle.
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

// Keep the public navbar animation-free as well. Authentication is already
// dynamically imported in Navbar.tsx, so Supabase stays out of the common
// initial public bundle until an authenticated navbar actually needs it.
const navbarPath = path.join(root, "src/components/site/Navbar.tsx");
let navbarSource = await fs.readFile(navbarPath, "utf8");
navbarSource = navbarSource
  .replace('import { motion } from "framer-motion";\n', "")
  .replace('<motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className=', '<header className=')
  .replace('</motion.header>', '</header>');
await fs.writeFile(navbarPath, navbarSource, "utf8");

// Give Reel Studio a complete crawlable head and schema in the initial HTML.
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
}

console.log("✓ Prepared SEO-safe prerendered HTML, 30-credit messaging, valid assets, fixed Features anchor, and a lighter public JS entry.");
