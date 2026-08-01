import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type SceneAsset = {
  id: number;
  duration: number;
  status: string;
  video_url?: string;
  audio_url?: string;
};

const COMPOSE = "fal-ai/ffmpeg-api/compose";

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

    const { reel_id, action = "submit" } = await req.json();
    if (!reel_id) throw new Error("reel_id required");

    const admin = createClient(url, svc, { auth: { persistSession: false } });
    const { data: reel, error: reelErr } = await admin
      .from("reel_generations").select("*").eq("id", reel_id).single();
    if (reelErr || !reel) throw new Error("Reel not found");
    if (reel.user_id !== user.id) throw new Error("Forbidden");

    const assets: SceneAsset[] = reel.scene_assets ?? [];
    const clips = assets.filter((a) => a.status === "completed" && a.video_url);
    if (!clips.length) throw new Error("No completed scene clips to merge");

    // ---- POLL ----
    if (action === "poll") {
      const requestId = reel.merge_request_id ?? null;
      if (!requestId) throw new Error("No merge in progress");
      const statusRes = await fetch(
        `https://queue.fal.run/fal-ai/ffmpeg-api/requests/${requestId}/status`,
        { headers: { Authorization: `Key ${FAL_API_KEY}` } },
      );
      const statusRaw = await statusRes.text();
      if (!statusRes.ok) throw new Error(`merge status ${statusRes.status}: ${statusRaw.slice(0, 200)}`);
      const statusData = JSON.parse(statusRaw);

      if (statusData.status === "COMPLETED") {
        const resRes = await fetch(
          `https://queue.fal.run/fal-ai/ffmpeg-api/requests/${requestId}`,
          { headers: { Authorization: `Key ${FAL_API_KEY}` } },
        );
        const resRaw = await resRes.text();
        if (!resRes.ok) throw new Error(`merge result ${resRes.status}: ${resRaw.slice(0, 200)}`);
        const result = JSON.parse(resRaw);
        const final_video_url = result.video_url ?? result.video?.url ?? result.url;
        if (!final_video_url) throw new Error("No final video URL in merge result");
        await admin.from("reel_generations").update({
          final_video_url, status: "completed",
        }).eq("id", reel_id);
        return new Response(JSON.stringify({ success: true, status: "completed", final_video_url }), {
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      if (statusData.status === "FAILED" || statusData.error) {
        const message = statusData.error ?? "Merge failed";
        await admin.from("reel_generations").update({ status: "merge_failed", error: String(message) }).eq("id", reel_id);
        return new Response(JSON.stringify({ success: true, status: "failed", error: message }), {
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, status: "processing" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // ---- SUBMIT ----
    const videoKeyframes: Array<Record<string, unknown>> = [];
    const audioKeyframes: Array<Record<string, unknown>> = [];
    let cursorMs = 0;
    for (const clip of clips) {
      const durMs = Math.max(1, Number(clip.duration) || 5) * 1000;
      videoKeyframes.push({ url: clip.video_url, timestamp: cursorMs, duration: durMs });
      if (clip.audio_url) {
        audioKeyframes.push({ url: clip.audio_url, timestamp: cursorMs, duration: durMs });
      }
      cursorMs += durMs;
    }

    const tracks: Array<Record<string, unknown>> = [
      { id: "video", type: "video", keyframes: videoKeyframes },
    ];
    if (audioKeyframes.length) {
      tracks.push({ id: "voiceover", type: "audio", keyframes: audioKeyframes });
    }

    const submitRes = await fetch(`https://queue.fal.run/${COMPOSE}`, {
      method: "POST",
      headers: { Authorization: `Key ${FAL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ tracks }),
    });
    const submitRaw = await submitRes.text();
    if (!submitRes.ok) throw new Error(`merge submit ${submitRes.status}: ${submitRaw.slice(0, 300)}`);
    const submitData = JSON.parse(submitRaw);

    await admin.from("reel_generations").update({
      status: "merging",
      merge_request_id: submitData.request_id,
    }).eq("id", reel_id);

    return new Response(JSON.stringify({
      success: true,
      status: "processing",
      request_id: submitData.request_id,
      total_duration_seconds: cursorMs / 1000,
      has_voiceover: audioKeyframes.length > 0,
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[merge-reel-video]", err);
    return new Response(JSON.stringify({ error: String(err instanceof Error ? err.message : err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
