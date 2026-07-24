import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type Scene = { id: number; duration: number; visual: string; voiceover: string };

// Map dashboard model + quality → Fal.ai endpoint
function resolveModelEndpoint(model: string, quality: "budget" | "premium"): string {
  const premium = quality === "premium";
  switch (model) {
    case "wan-2.6":
      return "fal-ai/wan/v2.2-a14b/text-to-video";
    case "kling-2.6":
      return premium
        ? "fal-ai/kling-video/v2.1/master/text-to-video"
        : "fal-ai/kling-video/v2.1/standard/text-to-video";
    case "veo-3":
      return premium ? "fal-ai/veo3" : "fal-ai/veo3/fast";
    case "seedance-2":
    default:
      return "bytedance/seedance-2.0/text-to-video";
  }
}

function aspectToRatio(aspect: string): string {
  return aspect === "landscape" ? "16:9" : "9:16";
}

function qualityToResolution(quality: "budget" | "premium"): string {
  return quality === "premium" ? "1080p" : "720p";
}

function stylePrefix(style: string | null): string {
  if (!style) return "";
  return `${style} style. `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

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

    const { reel_id, scenes: overrideScenes } = await req.json();
    if (!reel_id) throw new Error("reel_id required");

    const admin = createClient(url, svc, { auth: { persistSession: false } });

    // Load reel, verify ownership
    const { data: reel, error: reelErr } = await admin
      .from("reel_generations")
      .select("*")
      .eq("id", reel_id)
      .single();
    if (reelErr || !reel) throw new Error("Reel not found");
    if (reel.user_id !== user.id) throw new Error("Forbidden");

    const scenes: Scene[] = overrideScenes ?? reel.script?.scenes ?? [];
    if (!scenes.length) throw new Error("No scenes in script");

    // Check admin role for credit bypass
    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    const isAdmin = !!roleRow;

    // Credit cost: base per scene by quality
    const perScene = reel.quality === "premium" ? 15 : 8;
    const totalCredits = perScene * scenes.length;

    if (!isAdmin) {
      const { data: creditResult, error: creditError } = await userClient.rpc("consume_credits", {
        _tool: "reel_clips",
        _amount: totalCredits,
        _generation_id: reel_id,
      });
      if (creditError || !creditResult?.success) {
        throw new Error(creditResult?.error || creditError?.message || "Failed to deduct credits");
      }
    }

    const endpoint = resolveModelEndpoint(reel.model, reel.quality);
    const aspect_ratio = aspectToRatio(reel.aspect);
    const resolution = qualityToResolution(reel.quality);
    const style = stylePrefix(reel.style);

    // Submit ALL scene clips in parallel
    const submissions = await Promise.all(scenes.map(async (scene) => {
      const body: Record<string, unknown> = {
        prompt: `${style}${scene.visual}`,
        aspect_ratio,
        resolution,
        duration: String(scene.duration),
        enable_safety_checker: true,
      };
      try {
        const res = await fetch(`https://queue.fal.run/${endpoint}`, {
          method: "POST",
          headers: {
            "Authorization": `Key ${FAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const text = await res.text();
        if (!res.ok) {
          console.error(`[generate-reel-clips] scene ${scene.id} submit failed:`, res.status, text);
          return {
            id: scene.id, duration: scene.duration, visual: scene.visual, voiceover: scene.voiceover,
            model_id: endpoint, status: "failed", error: `${res.status}: ${text.slice(0, 200)}`,
          };
        }
        const data = JSON.parse(text);
        return {
          id: scene.id,
          duration: scene.duration,
          visual: scene.visual,
          voiceover: scene.voiceover,
          model_id: endpoint,
          request_id: data.request_id,
          status_url: data.status_url,
          response_url: data.response_url,
          status: "processing",
        };
      } catch (e) {
        return {
          id: scene.id, duration: scene.duration, visual: scene.visual, voiceover: scene.voiceover,
          model_id: endpoint, status: "failed", error: String(e instanceof Error ? e.message : e),
        };
      }
    }));

    const anyFailed = submissions.some((s) => s.status === "failed");

    await admin.from("reel_generations").update({
      status: anyFailed ? "clips_partial_failed" : "clips_generating",
      scene_assets: submissions,
      credits_used: (reel.credits_used ?? 0) + (isAdmin ? 0 : totalCredits),
    }).eq("id", reel_id);

    return new Response(JSON.stringify({
      success: true,
      reel_id,
      endpoint,
      aspect_ratio,
      resolution,
      scenes: submissions,
      credits_debited: isAdmin ? 0 : totalCredits,
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[generate-reel-clips]", err);
    return new Response(JSON.stringify({ error: String(err instanceof Error ? err.message : err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
