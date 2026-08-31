import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const SERVER_DIR = path.join(DIST, "server");
const ASSETS_DIR = path.join(DIST, "assets");
const SITEMAP = path.join(DIST, "sitemap.xml");
const SITE_URL = "https://www.autoseedance.site";
const ADSENSE_CLIENT = "ca-pub-2817573116229045";
const ADSENSE_SCRIPT = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>`;
const GA_MEASUREMENT_ID = "G-KFFD4XT5W6";
const GA_SCRIPT = `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>\n    <script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_MEASUREMENT_ID}');</script>`;

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
  const [assetFiles, distFiles] = await Promise.all([
    fs.readdir(ASSETS_DIR),
    fs.readdir(DIST),
  ]);

  const css = assetFiles.find((file) => /^app-[^/]+\.css$/.test(file));
  const client = distFiles.find((file) => /^entry-client-[^/]+\.js$/.test(file));

  if (!css) throw new Error(`No hashed application CSS found in ${ASSETS_DIR}`);
  if (!client) throw new Error(`No hashed client entry found in ${DIST}`);

  return {
    css: `/assets/${css}`,
    client: `/${client}`,
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

function injectAdSense(html) {
  if (html.includes(ADSENSE_CLIENT) || html.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js")) {
    return html;
  }

  if (!html.includes("</head>")) {
    throw new Error("HTML is missing </head>; cannot inject Google AdSense Auto Ads script");
  }

  return html.replace("</head>", `\n    <!-- Google AdSense Auto Ads: site-wide script -->\n    ${ADSENSE_SCRIPT}\n  </head>`);
}

function injectGoogleAnalytics(html) {
  if (html.includes(GA_MEASUREMENT_ID) || html.includes("googletagmanager.com/gtag/js")) {
    return html;
  }

  if (!html.includes("</head>")) {
    throw new Error("HTML is missing </head>; cannot inject Google Analytics tag");
  }

  return html.replace("</head>", `\n    <!-- Google Analytics 4: site-wide measurement -->\n    ${GA_SCRIPT}\n  </head>`);
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

function assertPublicHtml(html, urlString) {
  if (!html.includes("<html") || !html.includes("<body")) {
    throw new Error(`Invalid SSR HTML for ${urlString}: document shell is missing`);
  }

  if (html.match(/<div[^>]+id=["']root["'][^>]*>\s*<\/div>/i)) {
    throw new Error(`Prerender verification failed for ${urlString}: empty root div remains in initial HTML`);
  }

  if (!html.match(/<h1\b[^>]*>/i)) {
    throw new Error(`Prerender verification failed for ${urlString}: no H1 in initial HTML`);
  }

  if (!html.match(/<title>[^<]+<\/title>/i)) {
    throw new Error(`Prerender verification failed for ${urlString}: missing title`);
  }

  if (!html.match(/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+[^>]*>/i)) {
    throw new Error(`Prerender verification failed for ${urlString}: missing meta description`);
  }

  if (!html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/www\.autoseedance\.site[^"']*["'][^>]*>/i)) {
    throw new Error(`Prerender verification failed for ${urlString}: missing canonical www URL`);
  }

  if (!html.match(/data-autoseedance-client-asset=\"css\"/)) {
    throw new Error(`Prerender verification failed for ${urlString}: missing hashed application CSS`);
  }

  if (!html.match(/data-autoseedance-client-asset=\"js\"/)) {
    throw new Error(`Prerender verification failed for ${urlString}: missing hashed client entry`);
  }

  if (!html.includes(ADSENSE_CLIENT) || !html.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js")) {
    throw new Error(`Prerender verification failed for ${urlString}: missing Google AdSense Auto Ads script`);
  }

  if (!html.includes(GA_MEASUREMENT_ID) || !html.includes("googletagmanager.com/gtag/js")) {
    throw new Error(`Prerender verification failed for ${urlString}: missing Google Analytics tag ${GA_MEASUREMENT_ID}`);
  }
}

async function writeRoute(urlString, render, assets) {
  const requestUrl = new URL(urlString);
  if (requestUrl.origin !== SITE_URL) {
    throw new Error(`Refusing to prerender non-canonical origin: ${urlString}`);
  }
  if (requestUrl.hash || requestUrl.search) {
    throw new Error(`Refusing to prerender URL with fragment/query: ${urlString}`);
  }

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
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`SSR returned HTTP ${response.status} for public URL ${urlString}`);
  }

  let finalHtml = injectClientAssets(html, assets);
  finalHtml = injectAdSense(finalHtml);
  finalHtml = injectGoogleAnalytics(finalHtml);
  assertPublicHtml(finalHtml, urlString);

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
    results.push(result);
    console.log(`✓ ${url} -> ${path.relative(ROOT, result.output)} (${result.bytes} bytes, AdSense ✓, GA ✓)`);
  }

  const notFound = await entryModule.render({
    request: new Request(`${SITE_URL}/__static_404__`, {
      method: "GET",
      headers: { accept: "text/html" },
    }),
  });

  if (!(notFound instanceof Response)) {
    throw new Error("404 renderer did not return a Response");
  }
  if (notFound.status !== 404) {
    throw new Error(`404 verification failed: unknown URL returned HTTP ${notFound.status}, expected 404`);
  }

  const notFoundHtml = await notFound.text();
  let final404 = injectClientAssets(notFoundHtml, assets);
  final404 = injectAdSense(final404);
  final404 = injectGoogleAnalytics(final404);
  if (!final404.match(/<h1\b[^>]*>/i)) {
    throw new Error("404 verification failed: 404 page has no H1");
  }
  if (!final404.includes(GA_MEASUREMENT_ID) || !final404.includes("googletagmanager.com/gtag/js")) {
    throw new Error(`404 verification failed: missing Google Analytics tag ${GA_MEASUREMENT_ID}`);
  }
  await fs.writeFile(path.join(DIST, "404.html"), final404, "utf8");

  await fs.rm(SERVER_DIR, { recursive: true, force: true });

  const rootHtml = await fs.readFile(path.join(DIST, "index.html"), "utf8");
  let rootFinal = injectAdSense(rootHtml);
  rootFinal = injectGoogleAnalytics(rootFinal);
  assertPublicHtml(rootFinal, SITE_URL);
  if (rootFinal !== rootHtml) {
    await fs.writeFile(path.join(DIST, "index.html"), rootFinal, "utf8");
  }

  console.log(`\n✓ Prerender complete: ${results.length} HTML routes + 404.html`);
  console.log("✓ Initial HTML, metadata, canonical, H1, assets, AdSense and Google Analytics verification passed");
  console.log("✓ Unknown-route verification passed with HTTP 404");
}

main().catch((error) => {
  console.error("\n✗ Prerender failed:", error?.stack || error);
  process.exit(1);
});
