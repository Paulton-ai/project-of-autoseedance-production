import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { aspectToRatio, buildFalPayload, resolveModelEndpoint } from "../_shared/fal-models.ts";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey" };
type Scene = { id: number; duration: number; visual: string; voiceover: string };
function stylePrefix(style: string | null): string { return style ? `${style} style. ` : ""; }
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY"); if (!FAL_API_KEY) throw new Error("FAL_API_KEY missing");
    const authHeader = req.headers.get("Authorization") || ""; if (!authHeader) throw new Error("Missing Authorization");
    const url = Deno.env.get("SUPABASE_URL")!; const anon = Deno.env.get("SUPABASE_ANON_KEY")!; const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser(); if (userErr || !userData.user) throw new Error("Not authenticated");
    const user = userData.user; const { reel_id, scenes: overrideScenes, scene_ids } = await req.json(); if (!reel_id) throw new Error("reel_id required");
    const admin = createClient(url, svc, { auth: { persistSession: false } });
    const { data: reel, error: reelErr } = await admin.from("reel_generations").select("*").eq("id", reel_id).single(); if (reelErr || !reel) throw new Error("Reel not found"); if (reel.user_id !== user.id) throw new Error("Forbidden");
    const existingAssets: Array<Record<string, unknown>> = Array.isArray(reel.scene_assets) ? reel.scene_assets : [];
    const allScenes: Scene[] = overrideScenes ?? reel.script?.scenes ?? []; if (!allScenes.length) throw new Error("No scenes in script");
    const completedIds = new Set(existingAssets.filter((a) => a.status === "completed" && a.video_url).map((a) => a.id));
    const requestedIds: number[] | null = Array.isArray(scene_ids) && scene_ids.length ? scene_ids.map((n: number) => Number(n)) : null;
    const scenes: Scene[] = allScenes.filter((s) => !completedIds.has(s.id) && (!requestedIds || requestedIds.includes(s.id)));
    if (!scenes.length) return new Response(JSON.stringify({ success: true, reel_id, scenes: existingAssets, credits_debited: 0, note: "All requested scenes already completed" }), { headers: { ...cors, "Content-Type": "application/json" } });
    // Reel Studio has one fixed 40-credit charge at the Generate button. Scene generation and retries are included and never deduct again.
    const endpoint = resolveModelEndpoint(reel.model, reel.quality); const aspect_ratio = aspectToRatio(reel.aspect); const resolution = reel.quality === "premium" ? "1080p" : "720p"; const style = stylePrefix(reel.style);
    const submissions = await Promise.all(scenes.map(async (scene) => {
      const body = buildFalPayload({ model: reel.model, quality: reel.quality, aspect: reel.aspect, prompt: `${style}${scene.visual}`, duration: scene.duration });
      try {
        const res = await fetch(`https://queue.fal.run/${endpoint}`, { method: "POST", headers: { "Authorization": `Key ${FAL_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const text = await res.text(); if (!res.ok) return { id: scene.id, duration: scene.duration, visual: scene.visual, voiceover: scene.voiceover, model_id: endpoint, status: "failed", error: `${res.status}: ${text.slice(0, 200)}` };
        const data = JSON.parse(text); return { id: scene.id, duration: scene.duration, visual: scene.visual, voiceover: scene.voiceover, model_id: endpoint, request_id: data.request_id, status_url: data.status_url, response_url: data.response_url, status: "processing" };
      } catch (e) { return { id: scene.id, duration: scene.duration, visual: scene.visual, voiceover: scene.voiceover, model_id: endpoint, status: "failed", error: String(e instanceof Error ? e.message : e) }; }
    }));
    const byId = new Map<number, Record<string, unknown>>(); for (const a of existingAssets) byId.set(Number(a.id), a); for (const s of submissions) byId.set(s.id, s);
    for (const s of allScenes) if (!byId.has(s.id)) byId.set(s.id, { id: s.id, duration: s.duration, visual: s.visual, voiceover: s.voiceover, model_id: endpoint, status: "pending" });
    const merged = Array.from(byId.values()).sort((a, b) => Number(a.id) - Number(b.id)); const anyFailed = merged.some((s) => s.status === "failed");
    await admin.from("reel_generations").update({ status: anyFailed ? "clips_partial_failed" : "clips_generating", scene_assets: merged, script: { scenes: allScenes }, credits_used: reel.credits_used ?? 40 }).eq("id", reel_id);
    return new Response(JSON.stringify({ success: true, reel_id, endpoint, aspect_ratio, resolution, scenes: merged, submitted_scene_ids: scenes.map((s) => s.id), credits_debited: 0, credit_cost: 40 }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) { console.error("[generate-reel-clips]", err); return new Response(JSON.stringify({ error: String(err instanceof Error ? err.message : err) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } }); }
});
