import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const KEY = () => Deno.env.get("FAL_API_KEY")!;

async function tts(text: string, voice: string) {
  const res = await fetch("https://fal.run/fal-ai/inworld-tts", {
    method: "POST",
    headers: { Authorization: `Key ${KEY()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, sample_rate_hertz: 48000 }),
  });
  const raw = await res.text();
  return { ok: res.ok, status: res.status, body: raw.slice(0, 400), url: res.ok ? JSON.parse(raw).audio?.url : undefined };
}

async function head(url: string) {
  const r = await fetch(url, { method: "HEAD" });
  return { status: r.status, len: r.headers.get("content-length"), type: r.headers.get("content-type") };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const out: Record<string, unknown> = {};
  const en = await tts("Welcome to Auto Seedance. This is an English voiceover test.", "Sarah (en)");
  const hi = await tts("ऑटो सीडांस में आपका स्वागत है। यह हिंदी आवाज़ का परीक्षण है।", "Riya (hi)");
  out.en = en;
  out.hi = hi;
  if (en.url) out.en_head = await head(en.url);
  if (hi.url) out.hi_head = await head(hi.url);

  // Compose a merged clip using a sample silent video + both narrations back to back
  if (en.url && hi.url) {
    const video = "https://storage.googleapis.com/falserverless/model_tests/video_models/robot.mp4";
    const tracks = [
      { id: "video", type: "video", keyframes: [
        { url: video, timestamp: 0, duration: 5000 },
        { url: video, timestamp: 5000, duration: 5000 },
      ] },
      { id: "voiceover", type: "audio", keyframes: [
        { url: en.url, timestamp: 0, duration: 5000 },
        { url: hi.url, timestamp: 5000, duration: 5000 },
      ] },
    ];
    const res = await fetch("https://fal.run/fal-ai/ffmpeg-api/compose", {
      method: "POST",
      headers: { Authorization: `Key ${KEY()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ tracks }),
    });
    const raw = await res.text();
    out.compose = { status: res.status, body: raw.slice(0, 500) };
  }

  return new Response(JSON.stringify(out, null, 2), { headers: { ...cors, "Content-Type": "application/json" } });
});
