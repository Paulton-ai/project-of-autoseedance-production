// TEMPORARY diagnostic function — submits one real clip per model and polls to completion.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { buildFalPayload, resolveModelEndpoint } from "../_shared/fal-models.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, x-client-info, apikey",
};

const PROMPT =
  "Cinematic style. Close-up of a barista pouring steamed milk into a latte cup on a wooden cafe counter, warm morning light";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const KEY = Deno.env.get("FAL_API_KEY");
  if (!KEY) return new Response("no key", { status: 500, headers: cors });

  const models = ["seedance-2", "wan-2.6", "kling-2.6", "veo-3"];
  const results = await Promise.all(models.map(async (model) => {
    const endpoint = resolveModelEndpoint(model, "budget");
    const body = buildFalPayload({
      model, quality: "budget", aspect: "portrait", prompt: PROMPT, duration: 6,
    });
    try {
      const res = await fetch(`https://queue.fal.run/${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Key ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      if (!res.ok) return { model, endpoint, body, stage: "submit", error: `${res.status}: ${text.slice(0, 300)}` };
      const sub = JSON.parse(text);

      // poll up to ~4 minutes
      for (let i = 0; i < 48; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const st = await fetch(sub.status_url, { headers: { Authorization: `Key ${KEY}` } });
        const stText = await st.text();
        if (!st.ok) return { model, endpoint, stage: "status", error: `${st.status}: ${stText.slice(0, 300)}` };
        const sd = JSON.parse(stText);
        if (sd.status === "COMPLETED") {
          const rr = await fetch(sub.response_url, { headers: { Authorization: `Key ${KEY}` } });
          const rt = await rr.text();
          if (!rr.ok) return { model, endpoint, stage: "result", error: `${rr.status}: ${rt.slice(0, 400)}` };
          const r = JSON.parse(rt);
          return { model, endpoint, ok: true, video_url: r.video?.url || r.videos?.[0]?.url || null };
        }
        if (sd.status === "FAILED" || sd.error) {
          return { model, endpoint, stage: "generation", error: JSON.stringify(sd).slice(0, 400) };
        }
      }
      return { model, endpoint, stage: "timeout", request_id: sub.request_id };
    } catch (e) {
      return { model, endpoint, stage: "exception", error: String(e) };
    }
  }));

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
