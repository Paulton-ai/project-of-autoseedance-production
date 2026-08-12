import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const SERVER_DIR = path.join(DIST, "server");
const SITEMAP = path.join(DIST, "sitemap.xml");

async function resolveServerEntry() {
  const preferred = path.join(SERVER_DIR, "entry-server.js");
  const fallback = path.join(SERVER_DIR, "entry-client.js");

  try {
    await fs.access(preferred);
    return preferred;
  } catch {
    try {
      await fs.access(fallback);
      console.warn("SSR build emitted entry-client.js; using it as the server bundle for prerendering.");
      return fallback;
    } catch {
      throw new Error(`No SSR entry found in ${SERVER_DIR}. Expected entry-server.js or entry-client.js.`);
    }
  }
}

function extractUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1]
      .replaceAll("&amp;", "&")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll("&apos;", "'"),
  );
}

function outputPathFor(urlString) {
  const url = new URL(urlString);
  const pathname = decodeURIComponent(url.pathname || "/");
  const segments = pathname.split("/").filter(Boolean);

  if (segments.some((segment) => segment === "." || segment === "..")) {
    throw new Error(`Unsafe prerender path: ${pathname}`);
  }

  return segments.length === 0
    ? path.join(DIST, "index.html")
    : path.join(DIST, ...segments, "index.html");
}

async function writeRoute(urlString, render) {
  const requestUrl = new URL(urlString);
  const response = await render({
    request: new Request(requestUrl, {
      method: "GET",
      headers: { accept: "text/html" },
    }),
  });

  if (!response || !(response instanceof Response)) {
    throw new Error(`SSR renderer did not return a Response for ${urlString}`);
  }

  const html = await response.text();
  if (!html.includes("<html") || !html.includes("<body")) {
    throw new Error(`Invalid SSR HTML for ${urlString}: document shell is missing`);
  }

  const output = outputPathFor(urlString);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, html, "utf8");

  return { url: urlString, output, status: response.status, bytes: Buffer.byteLength(html) };
}

async function main() {
  const entryPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : await resolveServerEntry();
  const entryModule = await import(pathToFileURL(entryPath).href);

  if (typeof entryModule.render !== "function") {
    throw new Error(`Server entry ${entryPath} does not export render()`);
  }

  const sitemapXml = await fs.readFile(SITEMAP, "utf8");
  const urls = [...new Set(extractUrls(sitemapXml))];
  if (urls.length === 0) {
    throw new Error("Sitemap contains no URLs; refusing to deploy an empty prerendered site");
  }

  const results = [];
  for (const url of urls) {
    const result = await writeRoute(url, entryModule.render);
    if (result.status < 200 || result.status >= 300) {
      throw new Error(`Prerender returned HTTP ${result.status} for ${url}`);
    }
    results.push(result);
    console.log(`✓ ${url} -> ${path.relative(ROOT, result.output)} (${result.bytes} bytes)`);
  }

  const notFound = await entryModule.render({
    request: new Request("https://autoseedance.site/__static_404__", {
      method: "GET",
      headers: { accept: "text/html" },
    }),
  });
  const notFoundHtml = await notFound.text();
  await fs.writeFile(path.join(DIST, "404.html"), notFoundHtml, "utf8");

  await fs.rm(SERVER_DIR, { recursive: true, force: true });

  const rootHtml = await fs.readFile(path.join(DIST, "index.html"), "utf8");
  if (rootHtml.match(/<div[^>]+id=["']root["'][^>]*>\s*<\/div>/i)) {
    throw new Error("Prerender verification failed: homepage still contains an empty root div");
  }
  if (!rootHtml.match(/<h1\b[^>]*>/i)) {
    throw new Error("Prerender verification failed: homepage has no H1 in initial HTML");
  }

  console.log(`\n✓ Prerender complete: ${results.length} HTML routes + 404.html`);
  console.log("✓ Initial HTML verification passed");
}

main().catch((error) => {
  console.error("\n✗ Prerender failed:", error?.stack || error);
  process.exit(1);
});
