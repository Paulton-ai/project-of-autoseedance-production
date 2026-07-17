import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SITE_URL = "https://autoseedance.site";

const STATIC_PAGES = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/tools/image", priority: 0.9, changefreq: "weekly" },
  { path: "/tools/video", priority: 0.9, changefreq: "weekly" },
  { path: "/pricing", priority: 0.8, changefreq: "monthly" },
  { path: "/blog", priority: 0.8, changefreq: "weekly" },
  { path: "/contact", priority: 0.6, changefreq: "monthly" },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
];

interface BlogPost {
  slug: string;
  date: string;
}

function parseFrontmatter(raw: string): BlogPost | null {
  try {
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!match) return null;
    const [, fmBlock] = match;
    const data: Record<string, string> = {};
    const lines = fmBlock.split("\n");
    for (const line of lines) {
      const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
      if (kv) {
        const [, key, val] = kv;
        data[key] = val.replace(/^["']|["']$/g, "").trim();
      }
    }
    return { slug: "", date: data.date || new Date().toISOString().split("T")[0] };
  } catch {
    return null;
  }
}

function getBlogPosts(): Array<{ slug: string; date: string }> {
  const postsDir = path.join(process.cwd(), "content/posts");
  if (!fs.existsSync(postsDir)) return [];

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const filePath = path.join(postsDir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = parseFrontmatter(raw);
      return { slug, date: parsed?.date || new Date().toISOString().split("T")[0] };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSitemap(): string {
  const posts = getBlogPosts();
  const today = new Date().toISOString().split("T")[0];
  const urls: Array<{
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: number;
  }> = [];

  for (const page of STATIC_PAGES) {
    urls.push({
      loc: `${SITE_URL}${page.path}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  }

  for (const post of posts) {
    urls.push({
      loc: `${SITE_URL}/blog/${escapeXml(post.slug)}`,
      lastmod: post.date,
      changefreq: "monthly",
      priority: 0.7,
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  return sitemap;
}

function main() {
  const sitemap = generateSitemap();
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf-8");
  console.log("✓ sitemap.xml generated successfully");

  const posts = getBlogPosts();
  console.log(`  - ${STATIC_PAGES.length} static pages`);
  console.log(`  - ${posts.length} blog posts`);
  console.log(`  - Total: ${STATIC_PAGES.length + posts.length} URLs`);
}

main();
