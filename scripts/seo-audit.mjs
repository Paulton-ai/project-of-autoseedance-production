import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const SITE_URL = "https://www.autoseedance.site";

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function routeFromFile(file) {
  const rel = path.relative(DIST, file).replaceAll(path.sep, "/");
  if (rel === "index.html") return "/";
  if (rel === "404.html") return null;
  return `/${rel.replace(/\/index\.html$/, "")}`;
}

function attr(html, tag, name) {
  const pattern = new RegExp(`<${tag}\\b[^>]*\\b${name}=["']([^"']+)["'][^>]*>`, "i");
  return html.match(pattern)?.[1] || "";
}

function count(html, pattern) {
  return (html.match(pattern) || []).length;
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const files = await walk(DIST);
  const htmlFiles = files.filter((file) => routeFromFile(file));
  if (!htmlFiles.length) throw new Error("SEO audit found no prerendered public HTML files");

  const sitemap = await fs.readFile(path.join(DIST, "sitemap.xml"), "utf8");
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!sitemapUrls.length) throw new Error("SEO audit found an empty sitemap");

  const failures = [];
  const warnings = [];
  const renderedRoutes = new Set();

  for (const file of htmlFiles) {
    const route = routeFromFile(file);
    const html = await fs.readFile(file, "utf8");
    const canonical = attr(html, "link", "rel") === "canonical" ? attr(html, "link", "href") : (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || "");
    const robots = attr(html, "meta", "name") === "robots" ? attr(html, "meta", "content") : (html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)?.[1] || "");
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || "";
    const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] || "";
    const h1s = count(html, /<h1\b/gi);
    const textLength = visibleText(html).length;
    const isNoindex = /(^|[,\s])noindex([,\s]|$)/i.test(robots);

    renderedRoutes.add(route);
    if (isNoindex) continue;

    if (!title) failures.push(`${route}: missing <title>`);
    if (!description) failures.push(`${route}: missing meta description`);
    if (!h1s) failures.push(`${route}: missing H1`);
    if (h1s > 1) warnings.push(`${route}: ${h1s} H1 elements`);
    if (!canonical) failures.push(`${route}: missing canonical`);
    else if (!canonical.startsWith(`${SITE_URL}/`) && canonical !== SITE_URL) failures.push(`${route}: non-canonical host ${canonical}`);
    if (textLength < 300) warnings.push(`${route}: only ${textLength} visible text characters; review for thin content`);
    if (html.includes("AggregateRating")) failures.push(`${route}: AggregateRating structured data remains in prerendered HTML`);
    if (html.includes("50 free credits") || html.includes("50 Free Credits") || html.includes("50 credits")) warnings.push(`${route}: stale 50-credit wording remains; update the source article/content in Sanity`);
    if (html.includes("https://autoseedance.site")) failures.push(`${route}: non-www canonical/metadata URL remains in prerendered HTML`);
    if (html.includes("/og-image.png")) failures.push(`${route}: missing/legacy /og-image.png reference remains in prerendered HTML`);
  }

  for (const url of sitemapUrls) {
    const pathname = new URL(url).pathname || "/";
    if (pathname === "/") {
      if (!renderedRoutes.has("/")) failures.push("sitemap: / has no prerendered HTML");
      continue;
    }
    if (!renderedRoutes.has(pathname)) failures.push(`sitemap: ${pathname} has no prerendered HTML`);
  }

  const sitemapSet = new Set(sitemapUrls.map((url) => new URL(url).pathname || "/"));
  for (const route of renderedRoutes) {
    const html = await fs.readFile(path.join(DIST, route === "/" ? "index.html" : route.slice(1), "index.html").replaceAll("//", "/"), "utf8").catch(() => null);
    if (!html) continue;
    if (!route || route === "/") continue;
    const robots = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)?.[1] || "";
    if (!/noindex/i.test(robots) && !sitemapSet.has(route)) warnings.push(`${route}: indexable prerendered page is not present in sitemap`);
  }

  if (warnings.length) {
    console.log("\nSEO audit warnings:");
    for (const warning of warnings) console.log(`  - ${warning}`);
  }

  if (failures.length) {
    console.error("\nSEO audit failures:");
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }

  console.log(`✓ SEO audit passed: ${htmlFiles.length} prerendered public HTML routes checked`);
  console.log(`✓ Sitemap checked: ${sitemapUrls.length} canonical URLs`);
  console.log("✓ Titles, descriptions, H1s, canonicals, thin-content warnings, stale credit claims, ratings, and legacy hosts checked");
}

main().catch((error) => {
  console.error("✗ SEO audit failed:", error?.stack || error);
  process.exit(1);
});
