function toWebHeaders(headers: Record<string, string | string[] | undefined>) {
  const result = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    result.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  return result;
}

export default async function handler(req: any, res: any) {
  try {
    // The SSR entry is produced by Vite during `npm run build`.
    // Building it with Vite resolves the project's TS path aliases and
    // bundles application source correctly for Vercel's server runtime.
    const { render } = await import("../dist/server/entry-server.js");

    const forwardedProto = req.headers?.["x-forwarded-proto"] || "https";
    const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
    const host = req.headers?.host || "autoseedance.site";
    const requestUrl = new URL(req.url || "/", `${proto}://${host}`);

    const request = new Request(requestUrl, {
      method: req.method || "GET",
      headers: toWebHeaders(req.headers || {}),
    });

    const response = await render({ request });

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    res.end(await response.text());
  } catch (error) {
    console.error("SSR render failed:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Internal Server Error");
  }
}
