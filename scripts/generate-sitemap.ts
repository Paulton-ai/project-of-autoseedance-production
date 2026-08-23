import fs from "fs";
import path from "path";

const SITE_URL = "https://www.autoseedance.site";
const SANITY_PROJECT_ID = "wazk28tf";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2024-01-01";

const STATIC_PAGES = [
  { path: "/", title: "Auto Seedance", description: "AI image, video, and short-form content creation platform." },
  { path: "/tools/image", title: "AI Image Generator", description: "Generate AI images from text prompts and reference images." },
  { path: "/tools/video", title: "AI Video Generator", description: "Generate AI video clips from text prompts with supported models and output settings." },
  { path: "/tools/reel-studio", title: "AI Reel Studio", description: "Turn an idea into a short-form video with scenes, voiceover, captions, and export." },
  { path: "/pricing", title: "Pricing", description: "Credit-based pricing for Auto Seedance generation tools." },
  { path: "/blog", title: "Auto Seedance Blog", description: "AI image and video tutorials, prompt guides, tool explainers, and case studies." },
  { path: "/contact", title: "Contact", description: "Support, feedback, bug reports, and partnership inquiries." },
  { path: "/privacy", title: "Privacy Policy", description: "How Auto Seedance handles information and privacy." },
  { path: "/terms", title: "Terms of Service", description: "Terms governing use of Auto Seedance services." },
];

interface PortableTextSpan {
  text?: string;
}

interface PortableTextBlock {
  _type?: string;
  style?: string;
  children?: PortableTextSpan[];
}

interface SanityPost {
  slug: string;
  title?: string;
  excerpt?: string;
  category?: string;
  publishedAt?: string;
  updatedAt?: string;
  body?: PortableTextBlock[];
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function cleanText(value?: string): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function portableTextToPlainText(body?: PortableTextBlock[]): string {
  if (!Array.isArray(body)) return "";

  return body
    .map((block) => {
      if (!Array.isArray(block.children)) return "";
      const text = block.children.map((span) => span?.text || "").join("").trim();
      if (!text) return "";
      if (block.style && /^h[1-6]$/i.test(block.style)) return `${text}\n`;
      return text;
    })
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

async function fetchSanityPosts(): Promise<SanityPost[]> {
  const query = encodeURIComponent(
    `*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))]{"slug": slug.current, title, excerpt, category, publishedAt, "updatedAt": _updatedAt, body}`,
  );
  const url = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Sanity fetch failed: HTTP ${res.status}`);
  const json = (await res.json()) as { result?: SanityPost[] };
  if (!Array.isArray(json.result)) throw new Error("Sanity returned an invalid posts result");
  return json.result;
}

function buildUrlset(urls: Array<{ loc: string; lastmod?: string }>): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>` : ""}\n  </url>`).join("\n")}\n</urlset>\n`;
}

function buildLlmsIndex(posts: SanityPost[]): string {
  const lines: string[] = [
    "# Auto Seedance",
    "",
    "> Auto Seedance is an AI content creation platform for generating images, videos, and short-form reels from one creator workflow.",
    "",
    "## Public tools",
    "",
  ];

  for (const page of STATIC_PAGES.slice(0, 4)) {
    lines.push(`- [${page.title}](${SITE_URL}${page.path}) — ${page.description}`);
  }

  lines.push("", "## Public site pages", "");
  for (const page of STATIC_PAGES.slice(4)) {
    lines.push(`- [${page.title}](${SITE_URL}${page.path}) — ${page.description}`);
  }

  lines.push("", "## Blog", "");
  for (const post of posts) {
    const title = cleanText(post.title) || post.slug;
    const description = cleanText(post.excerpt) || "Auto Seedance AI content creation guide.";
    lines.push(`- [${title}](${SITE_URL}/blog/${encodeURIComponent(post.slug)}) — ${description}`);
  }

  lines.push(
    "",
    "## Retrieval notes",
    "",
    "- Public URLs are intended to be directly retrievable over HTTPS GET without login, cookies, CAPTCHA, browser challenges, or client-side interaction.",
    "- The sitemap lists the same canonical public URLs used by the site.",
    `- Detailed article text is available in [llms-full.txt](${SITE_URL}/llms-full.txt).`,
    "",
  );

  return `${lines.join("\n")}\n`;
}

function buildLlmsFull(posts: SanityPost[]): string {
  const lines: string[] = [
    "# Auto Seedance — Detailed LLM Content Index",
    "",
    "> This file exposes the public site structure and published blog content in plain text for retrieval systems.",
    "",
  ];

  for (const page of STATIC_PAGES) {
    lines.push(`## ${page.title}`, "", `URL: ${SITE_URL}${page.path}`, `Summary: ${page.description}`, "");
  }

  for (const post of posts) {
    const title = cleanText(post.title) || post.slug;
    const url = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
    const summary = cleanText(post.excerpt);
    const body = portableTextToPlainText(post.body);

    lines.push(`## ${title}`, "", `URL: ${url}`);
    if (post.category) lines.push(`Category: ${cleanText(post.category)}`);
    if (post.publishedAt) lines.push(`Published: ${post.publishedAt}`);
    if (post.updatedAt) lines.push(`Updated: ${post.updatedAt}`);
    if (summary) lines.push(`Summary: ${summary}`);
    if (body) lines.push("", body);
    lines.push("");
  }

  return `${lines.join("\n").replace(/\n{4,}/g, "\n\n\n").trim()}\n`;
}

async function main() {
  const posts = await fetchSanityPosts();
  const publishedPosts = posts.filter((post) => post.slug);
  if (publishedPosts.length === 0) throw new Error("Sanity returned zero published blog posts; refusing to generate a potentially destructive empty blog sitemap");

  const mainUrls = STATIC_PAGES.map((page) => ({ loc: `${SITE_URL}${page.path}` }));
  const blogUrls = publishedPosts.map((post) => ({
    loc: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
    lastmod: normalizeDate(post.updatedAt || post.publishedAt),
  }));

  const allUrls = [...mainUrls, ...blogUrls];
  const duplicateUrls = allUrls.filter((item, index) => allUrls.findIndex((candidate) => candidate.loc === item.loc) !== index);
  if (duplicateUrls.length) throw new Error(`Sitemap contains duplicate canonical URLs: ${duplicateUrls.map((x) => x.loc).join(", ")}`);
  if (allUrls.some((item) => /[#?]/.test(item.loc))) throw new Error("Sitemap contains a URL with a fragment or query parameter; only clean canonical URLs are allowed");
  if (allUrls.some((item) => !item.loc.startsWith(`${SITE_URL}/`) && item.loc !== SITE_URL)) throw new Error("Sitemap contains a non-canonical host");

  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), buildUrlset(allUrls), "utf-8");
  fs.writeFileSync(path.join(publicDir, "llms.txt"), buildLlmsIndex(publishedPosts), "utf-8");
  fs.writeFileSync(path.join(publicDir, "llms-full.txt"), buildLlmsFull(publishedPosts), "utf-8");

  for (const filename of ["sitemap-main.xml", "sitemap-blog.xml", "sitemap-index.xml"]) {
    const filePath = path.join(publicDir, filename);
    if (fs.existsSync(filePath)) fs.rmSync(filePath);
  }

  console.log("✓ sitemap generated");
  console.log(`  - ${STATIC_PAGES.length} static pages`);
  console.log(`  - ${blogUrls.length} published Sanity blog posts`);
  console.log("✓ llms.txt generated with the complete public URL map");
  console.log("✓ llms-full.txt generated with published article text");
}

main().catch((e) => {
  console.error("✗ sitemap/LLM resource generation failed:", e?.stack || e);
  process.exit(1);
});
