import fs from "fs";
import path from "path";

const SITE_URL = "https://www.autoseedance.site";
const SANITY_PROJECT_ID = "wazk28tf";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2024-01-01";

const STATIC_PAGES = [
  "/",
  "/tools/image",
  "/tools/video",
  "/tools/reel-studio",
  "/pricing",
  "/blog",
  "/contact",
  "/privacy",
  "/terms",
];

interface SanityPost {
  slug: string;
  publishedAt?: string;
  updatedAt?: string;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

async function fetchSanityPosts(): Promise<SanityPost[]> {
  const query = encodeURIComponent(
    `*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))]{"slug": slug.current, publishedAt, "updatedAt": _updatedAt}`,
  );
  const url = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Sanity fetch failed: HTTP ${res.status}`);
  const json = (await res.json()) as { result?: SanityPost[] };
  if (!Array.isArray(json.result)) throw new Error("Sanity returned an invalid posts result");
  return json.result;
}

function buildUrlset(urls: Array<{ loc: string; lastmod?: string }>): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>` : ""}\n  </url>`).join("\n")}
</urlset>\n`;
}

async function main() {
  const posts = await fetchSanityPosts();
  const publishedPosts = posts.filter((post) => post.slug);
  if (publishedPosts.length === 0) throw new Error("Sanity returned zero published blog posts; refusing to generate a potentially destructive empty blog sitemap");

  const mainUrls = STATIC_PAGES.map((pagePath) => ({ loc: `${SITE_URL}${pagePath}` }));
  const blogUrls = publishedPosts.map((post) => ({
    loc: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
    lastmod: normalizeDate(post.updatedAt || post.publishedAt),
  }));

  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), buildUrlset([...mainUrls, ...blogUrls]), "utf-8");

  for (const filename of ["sitemap-main.xml", "sitemap-blog.xml", "sitemap-index.xml"]) {
    const filePath = path.join(publicDir, filename);
    if (fs.existsSync(filePath)) fs.rmSync(filePath);
  }

  console.log("✓ sitemap generated");
  console.log(`  - ${STATIC_PAGES.length} static pages`);
  console.log(`  - ${blogUrls.length} published Sanity blog posts`);
}

main().catch((e) => {
  console.error("✗ sitemap generation failed:", e?.stack || e);
  process.exit(1);
});
