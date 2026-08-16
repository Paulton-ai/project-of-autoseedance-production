import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const SERVER_DIR = path.join(DIST, "server");
const ASSETS_DIR = path.join(DIST, "assets");
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

async function resolveClientAssets() {
  const files = await fs.readdir(ASSETS_DIR);
  const css = files.find((file) => /^app-[^/]+\.css$/.test(file));
  const client = files.find((file) => /^entry-client-[^/]+\.js$/.test(file));

  if (!css) throw new Error(`No hashed application CSS found in ${ASSETS_DIR}`);
  if (!client) throw new Error(`No hashed client entry found in ${ASSETS_DIR}`);

  return {
    css: `/assets/${css}`,
    client: `/assets/${client}`,
  };
}

function injectClientAssets(html, assets) {
  const stylesheet = `<link rel="stylesheet" href="${assets.css}" data-autoseedance-client-asset="css" />`;
  const script = `<script type="module" src="${assets.client}" data-autoseedance-client-asset="js"></script>`;

  let output = html;
  if (!output.includes("data-autoseedance-client-asset=\"css\"")) {
    if (!output.includes("</head>")) throw new Error("SSR HTML is missing </head>; cannot inject application CSS");
    output = output.replace("</head>", `${stylesheet}</head>`);
  }

  if (!output.includes("data-autoseedance-client-asset=\"js\"")) {
    if (!output.includes("</body>")) throw new Error("SSR HTML is missing </body>; cannot inject client entry");
    output = output.replace("</body>", `${script}</body>`);
  }

  return output;
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

async function writeRoute(urlString, render, assets) {
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

  const finalHtml = injectClientAssets(html, assets);
  const output = outputPathFor(urlString);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, finalHtml, "utf8");

  return { url: urlString, output, status: response.status, bytes: Buffer.byteLength(finalHtml) };
}

async function main() {
  const entryPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : await resolveServerEntry();
  const entryModule = await import(pathToFileURL(entryPath).href);

  if (typeof entryModule.render !== "function") {
    throw new Error(`Server entry ${entryPath} does not export render()`);
  }

  const assets = await resolveClientAssets();
  console.log(`✓ Client assets: ${assets.css} + ${assets.client}`);

  const sitemapXml = await fs.readFile(SITEMAP, "utf8");
  const urls = [...new Set(extractUrls(sitemapXml))];
  if (urls.length === 0) {
    throw new Error("Sitemap contains no URLs; refusing to deploy an empty prerendered site");
  }

  const results = [];
  for (const url of urls) {
    const result = await writeRoute(url, entryModule.render, assets);
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
  await fs.writeFile(path.join(DIST, "404.html"), injectClientAssets(notFoundHtml, assets), "utf8");

  await fs.rm(SERVER_DIR, { recursive: true, force: true });

  const rootHtml = await fs.readFile(path.join(DIST, "index.html"), "utf8");
  if (rootHtml.match(/<div[^>]+id=["']root["'][^>]*>\s*<\/div>/i)) {
    throw new Error("Prerender verification failed: homepage still contains an empty root div");
  }
  if (!rootHtml.match(/<h1\b[^>]*>/i)) {
    throw new Error("Prerender verification failed: homepage has no H1 in initial HTML");
  }
  if (!rootHtml.match(/data-autoseedance-client-asset=\"css\"/)) {
    throw new Error("Prerender verification failed: homepage is missing the hashed application CSS");
  }
  if (!rootHtml.match(/data-autoseedance-client-asset=\"js\"/)) {
    throw new Error("Prerender verification failed: homepage is missing the hashed client entry");
  }

  console.log(`\n✓ Prerender complete: ${results.length} HTML routes + 404.html`);
  console.log("✓ Initial HTML + client asset verification passed");
}

main().catch((error) => {
  console.error("\n✗ Prerender failed:", error?.stack || error);
  process.exit(1);
});
