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
  visual: string;
  voiceover: string;
  model_id?: string;
  request_id?: string;
  status_url?: string;
  response_url?: string;
  status: "processing" | "completed" | "failed";
  video_url?: string;
  error?: string;
};

async function pollOne(FAL_API_KEY: string, asset: SceneAsset): Promise<SceneAsset> {
  if (asset.status === "completed" || asset.status === "failed") return asset;
  if (!asset.status_url || !asset.response_url) return asset;
  try {
    const statusRes = await fetch(asset.status_url, {
      headers: { "Authorization": `Key ${FAL_API_KEY}` },
    });
    const statusText = await statusRes.text();
    if (!statusRes.ok) {
      return { ...asset, status: "failed", error: `status ${statusRes.status}: ${statusText.slice(0, 200)}` };
    }
    const statusData = JSON.parse(statusText);
    if (statusData.status === "COMPLETED") {
      const resultRes = await fetch(asset.response_url, {
        headers: { "Authorization": `Key ${FAL_API_KEY}` },
      });
      const resultText = await resultRes.text();
      if (!resultRes.ok) {
        return { ...asset, status: "failed", error: `result ${resultRes.status}: ${resultText.slice(0, 200)}` };
      }
      const result = JSON.parse(resultText);
      const video_url = result.video?.url || result.videos?.[0]?.url;
      if (!video_url) {
        return { ...asset, status: "failed", error: "No video URL in result" };
      }
      return { ...asset, status: "completed", video_url };
    }
    if (statusData.status === "FAILED" || statusData.error) {
      return { ...asset, status: "failed", error: statusData.error || "Generation failed" };
    }
    return asset; // still processing
  } catch (e) {
    return { ...asset, status: "failed", error: String(e instanceof Error ? e.message : e) };
  }
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

    const { reel_id } = await req.json();
    if (!reel_id) throw new Error("reel_id required");

    const admin = createClient(url, svc, { auth: { persistSession: false } });
    const { data: reel, error: reelErr } = await admin
      .from("reel_generations").select("*").eq("id", reel_id).single();
    if (reelErr || !reel) throw new Error("Reel not found");
    if (reel.user_id !== user.id) throw new Error("Forbidden");

    const assets: SceneAsset[] = reel.scene_assets ?? [];
    if (!assets.length) throw new Error("No scene assets to poll");

    const polled = await Promise.all(assets.map((a) => pollOne(FAL_API_KEY, a)));

    const total = polled.length;
    const completed = polled.filter((a) => a.status === "completed").length;
    const failed = polled.filter((a) => a.status === "failed").length;
    const allDone = completed + failed === total;
    const anyFailed = failed > 0;

    let nextStatus = reel.status;
    if (allDone) {
      nextStatus = anyFailed ? "clips_partial_failed" : "clips_ready";
    } else {
      nextStatus = "clips_generating";
    }

    await admin.from("reel_generations").update({
      scene_assets: polled,
      status: nextStatus,
    }).eq("id", reel_id);

    return new Response(JSON.stringify({
      success: true,
      reel_id,
      status: nextStatus,
      progress: { total, completed, failed, processing: total - completed - failed },
      scenes: polled,
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[poll-reel-clips]", err);
    return new Response(JSON.stringify({ error: String(err instanceof Error ? err.message : err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
