import fs from "fs";
import path from "path";

const SITE_URL = "https://autoseedance.site";
const SANITY_PROJECT_ID = "wazk28tf";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2024-01-01";

const STATIC_PAGES = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/tools/image", priority: 0.9, changefreq: "weekly" },
  { path: "/tools/video", priority: 0.9, changefreq: "weekly" },
  { path: "/tools/reel-studio", priority: 0.9, changefreq: "weekly" },
  { path: "/pricing", priority: 0.8, changefreq: "monthly" },
  { path: "/blog", priority: 0.8, changefreq: "weekly" },
  { path: "/contact", priority: 0.6, changefreq: "monthly" },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
];

interface SanityPost {
  slug: string;
  publishedAt: string;
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

async function fetchSanityPosts(): Promise<SanityPost[]> {
  const query = encodeURIComponent(
    `*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))]{"slug": slug.current, publishedAt, "updatedAt": _updatedAt}`,
  );
  const url = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sanity fetch failed: ${res.status}`);
    const json = (await res.json()) as { result: SanityPost[] };
    return json.result || [];
  } catch (err) {
    console.warn("⚠ Failed to fetch Sanity posts for sitemap:", (err as Error).message);
    return [];
  }
}

function buildUrlset(urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: number }>) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
}

async function main() {
  const today = new Date().toISOString().split("T")[0];
  const posts = await fetchSanityPosts();

  const mainUrls = STATIC_PAGES.map((p) => ({
    loc: `${SITE_URL}${p.path}`,
    lastmod: today,
    changefreq: p.changefreq,
    priority: p.priority,
  }));
  const mainSitemap = buildUrlset(mainUrls);

  const blogUrls = posts.map((p) => ({
    loc: `${SITE_URL}/blog/${escapeXml(p.slug)}`,
    lastmod: (p.updatedAt || p.publishedAt || today).split("T")[0],
    changefreq: "monthly",
    priority: 0.7,
  }));
  const blogSitemap = buildUrlset(blogUrls);

  const combined = buildUrlset([...mainUrls, ...blogUrls]);

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-main.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-blog.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;

  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), combined, "utf-8");
  fs.writeFileSync(path.join(publicDir, "sitemap-main.xml"), mainSitemap, "utf-8");
  fs.writeFileSync(path.join(publicDir, "sitemap-blog.xml"), blogSitemap, "utf-8");
  fs.writeFileSync(path.join(publicDir, "sitemap-index.xml"), sitemapIndex, "utf-8");

  console.log("✓ sitemaps generated");
  console.log(`  - ${STATIC_PAGES.length} static pages`);
  console.log(`  - ${posts.length} Sanity blog posts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
