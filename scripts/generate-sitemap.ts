import fs from "fs";
import path from "path";

const SITE_URL = "https://autoseedance.site";
const SANITY_PROJECT_ID = "wazk28tf";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2024-01-01";

// Only include canonical, publicly indexable URLs here.
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
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sanity fetch failed: ${res.status}`);
    const json = (await res.json()) as { result?: SanityPost[] };
    return json.result || [];
  } catch (err) {
    console.warn(
      "⚠ Failed to fetch Sanity posts for sitemap:",
      (err as Error).message,
    );
    return [];
  }
}

function buildUrlset(
  urls: Array<{ loc: string; lastmod?: string }>,
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${
      u.lastmod ? `\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>` : ""
    }
  </url>`,
  )
  .join("\n")}
</urlset>
`;
}

async function main() {
  const posts = await fetchSanityPosts();

  // Do not invent a "last modified" date for static pages. A sitemap should
  // only expose dates that represent a real content change.
  const mainUrls = STATIC_PAGES.map((pagePath) => ({
    loc: `${SITE_URL}${pagePath}`,
  }));

  const blogUrls = posts
    .filter((post) => post.slug)
    .map((post) => ({
      loc: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
      lastmod: normalizeDate(post.updatedAt || post.publishedAt),
    }));

  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // Keep one authoritative sitemap URL. robots.txt and Search Console can
  // consistently point to /sitemap.xml without duplicate sitemap variants.
  const sitemap = buildUrlset([...mainUrls, ...blogUrls]);
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf-8");

  // Remove obsolete generated sitemap variants from previous builds.
  for (const filename of ["sitemap-main.xml", "sitemap-blog.xml", "sitemap-index.xml"]) {
    const filePath = path.join(publicDir, filename);
    if (fs.existsSync(filePath)) fs.rmSync(filePath);
  }

  console.log("✓ sitemap generated");
  console.log(`  - ${STATIC_PAGES.length} static pages`);
  console.log(`  - ${blogUrls.length} Sanity blog posts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
