import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const AUTO_CAPTION = "fal-ai/auto-caption";

// Map dashboard caption style -> fal auto-caption styling
function captionParams(style: string, aspect: string) {
  const portrait = aspect !== "landscape";
  const base = {
    font_size: portrait ? 48 : 40,
    stroke_width: 2,
    left_align: false,
    top_align: false,
    bottom_align: true,
    text_color: "white",
  };
  if (style === "simple") {
    return { ...base, txt_font: "Standard", txt_color: "white", highlight_color: "white", font_size: portrait ? 40 : 34 };
  }
  // karaoke (default): word-by-word highlight
  return { ...base, txt_font: "Bold", txt_color: "white", highlight_color: "yellow" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (!FAL_API_KEY) throw new Error("FAL_API_KEY missing");

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) throw new Error("Missing Authorization");

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) throw new Error("Not authenticated");
    const user = userData.user;

    const { reel_id, action = "submit", request_id } = await req.json();
    if (!reel_id) throw new Error("reel_id required");

    const admin = createClient(url, svc, { auth: { persistSession: false } });
    const { data: reel, error: reelErr } = await admin
      .from("reel_generations").select("*").eq("id", reel_id).single();
    if (reelErr || !reel) throw new Error("Reel not found");
    if (reel.user_id !== user.id) throw new Error("Forbidden");

    // ---- POLL ----
    if (action === "poll") {
      if (!request_id) throw new Error("request_id required to poll");
      const statusRes = await fetch(
        `https://queue.fal.run/fal-ai/auto-caption/requests/${request_id}/status`,
        { headers: { Authorization: `Key ${FAL_API_KEY}` } },
      );
      const statusRaw = await statusRes.text();
      if (!statusRes.ok) throw new Error(`caption status ${statusRes.status}: ${statusRaw.slice(0, 200)}`);
      const statusData = JSON.parse(statusRaw);

      if (statusData.status === "COMPLETED") {
        const resRes = await fetch(
          `https://queue.fal.run/fal-ai/auto-caption/requests/${request_id}`,
          { headers: { Authorization: `Key ${FAL_API_KEY}` } },
        );
        const resRaw = await resRes.text();
        if (!resRes.ok) throw new Error(`caption result ${resRes.status}: ${resRaw.slice(0, 200)}`);
        const result = JSON.parse(resRaw);
        const captioned = result.video_url ?? result.video?.url ?? result.url;
        if (!captioned) throw new Error("No captioned video URL in result");
        await admin.from("reel_generations").update({
          final_video_url: captioned, status: "completed",
        }).eq("id", reel_id);
        return new Response(JSON.stringify({ success: true, status: "completed", final_video_url: captioned }), {
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      if (statusData.status === "FAILED" || statusData.error) {
        const message = statusData.error ?? "Captioning failed";
        // Non-fatal: keep the uncaptioned merge as the final video
        await admin.from("reel_generations").update({ status: "completed" }).eq("id", reel_id);
        return new Response(JSON.stringify({ success: true, status: "failed", error: String(message) }), {
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, status: "processing" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // ---- SUBMIT ----
    if (!reel.captions || reel.caption_style === "none") {
      return new Response(JSON.stringify({ success: true, status: "skipped" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const source = reel.final_video_url;
    if (!source) throw new Error("No merged video to caption");

    const body = {
      video_url: source,
      ...captionParams(reel.caption_style ?? "karaoke", reel.aspect ?? "portrait"),
    };

    const submitRes = await fetch(`https://queue.fal.run/${AUTO_CAPTION}`, {
      method: "POST",
      headers: { Authorization: `Key ${FAL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const submitRaw = await submitRes.text();
    if (!submitRes.ok) throw new Error(`caption submit ${submitRes.status}: ${submitRaw.slice(0, 300)}`);
    const submitData = JSON.parse(submitRaw);

    await admin.from("reel_generations").update({ status: "captioning" }).eq("id", reel_id);

    return new Response(JSON.stringify({
      success: true, status: "processing", request_id: submitData.request_id,
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[caption-reel-video]", err);
    return new Response(JSON.stringify({ error: String(err instanceof Error ? err.message : err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
