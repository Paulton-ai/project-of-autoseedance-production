import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { aspectToRatio, buildFalPayload, resolveModelEndpoint } from "./fal-models.ts";


const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type Scene = { id: number; duration: number; visual: string; voiceover: string };

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

    const { reel_id, scenes: overrideScenes, scene_ids } = await req.json();
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

    const existingAssets: Array<Record<string, unknown>> = Array.isArray(reel.scene_assets)
      ? reel.scene_assets
      : [];

    const allScenes: Scene[] = overrideScenes ?? reel.script?.scenes ?? [];
    if (!allScenes.length) throw new Error("No scenes in script");

    // Retry mode: only (re)generate the requested scene ids.
    // Scenes that already completed are NEVER resubmitted and NEVER re-charged.
    const completedIds = new Set(
      existingAssets.filter((a) => a.status === "completed" && a.video_url).map((a) => a.id),
    );
    const requestedIds: number[] | null = Array.isArray(scene_ids) && scene_ids.length
      ? scene_ids.map((n: number) => Number(n))
      : null;

    const scenes: Scene[] = allScenes.filter((s) => {
      if (completedIds.has(s.id)) return false;
      if (requestedIds) return requestedIds.includes(s.id);
      return true;
    });

    if (!scenes.length) {
      return new Response(JSON.stringify({
        success: true,
        reel_id,
        scenes: existingAssets,
        credits_debited: 0,
        note: "All requested scenes already completed",
      }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Check admin role for credit bypass
    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    const isAdmin = !!roleRow;

    // Credit cost: base per scene by quality — only for scenes actually submitted now
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
    const resolution = reel.quality === "premium" ? "1080p" : "720p";
    const style = stylePrefix(reel.style);

    // Submit scene clips in parallel
    const submissions = await Promise.all(scenes.map(async (scene) => {
      const body = buildFalPayload({
        model: reel.model,
        quality: reel.quality,
        aspect: reel.aspect,
        prompt: `${style}${scene.visual}`,
        duration: scene.duration,
      });
      console.log(`[generate-reel-clips] scene ${scene.id} -> ${endpoint} ${JSON.stringify(body)}`);

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

    // Merge submissions into existing assets so completed scenes keep their state
    const byId = new Map<number, Record<string, unknown>>();
    for (const a of existingAssets) byId.set(Number(a.id), a);
    for (const s of submissions) byId.set(s.id, s);
    // Include scenes from the script that have no asset yet (e.g. targeted retry)
    for (const s of allScenes) {
      if (!byId.has(s.id)) {
        byId.set(s.id, {
          id: s.id, duration: s.duration, visual: s.visual, voiceover: s.voiceover,
          model_id: endpoint, status: "pending",
        });
      }
    }
    const merged = Array.from(byId.values()).sort((a, b) => Number(a.id) - Number(b.id));

    const anyFailed = merged.some((s) => s.status === "failed");

    await admin.from("reel_generations").update({
      status: anyFailed ? "clips_partial_failed" : "clips_generating",
      scene_assets: merged,
      script: { scenes: allScenes },
      credits_used: (reel.credits_used ?? 0) + (isAdmin ? 0 : totalCredits),
    }).eq("id", reel_id);


    return new Response(JSON.stringify({
      success: true,
      reel_id,
      endpoint,
      aspect_ratio,
      resolution,
      scenes: merged,
      submitted_scene_ids: scenes.map((s) => s.id),
      credits_debited: isAdmin ? 0 : totalCredits,
    }), { headers: { ...cors, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("[generate-reel-clips]", err);
    return new Response(JSON.stringify({ error: String(err instanceof Error ? err.message : err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
