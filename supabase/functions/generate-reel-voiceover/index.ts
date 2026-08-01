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
  status: string;
  video_url?: string;
  audio_url?: string;
  audio_error?: string;
};

// Dashboard voice → PlayAI voice name
function resolveVoice(voice: string | null): string {
  switch (voice) {
    case "male-us":
      return "Dexter (English (US)/American)";
    case "female-uk":
      return "Charlotte (Advertising) (English (US)/American)";
    case "male-uk":
      return "Angelo (English (US)/American)";
    case "female-us":
    default:
      return "Jennifer (English (US)/American)";
  }
}

async function ttsOne(key: string, text: string, voice: string): Promise<{ url?: string; error?: string }> {
  try {
    const res = await fetch("https://fal.run/fal-ai/playai/tts/v3", {
      method: "POST",
      headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ input: text, voice, response_format: "url" }),
    });
    const raw = await res.text();
    if (!res.ok) return { error: `${res.status}: ${raw.slice(0, 200)}` };
    const data = JSON.parse(raw);
    const url = data.audio?.url ?? data.audio_url?.url ?? data.url;
    if (!url) return { error: "No audio URL in TTS result" };
    return { url };
  } catch (e) {
    return { error: String(e instanceof Error ? e.message : e) };
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
    if (!assets.length) throw new Error("No scenes to narrate");

    if (!reel.voiceover) {
      await admin.from("reel_generations").update({ status: "voiceover_ready" }).eq("id", reel_id);
      return new Response(JSON.stringify({ success: true, skipped: true, scenes: assets }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const voiceName = resolveVoice(reel.voice);

    const narrated = await Promise.all(assets.map(async (a) => {
      if (a.audio_url) return a;
      const text = (a.voiceover || "").trim();
      if (!text) return a;
      const { url: audio_url, error } = await ttsOne(FAL_API_KEY, text, voiceName);
      return audio_url ? { ...a, audio_url } : { ...a, audio_error: error };
    }));

    const failed = narrated.filter((a) => a.audio_error).length;

    await admin.from("reel_generations").update({
      scene_assets: narrated,
      status: failed ? "voiceover_partial_failed" : "voiceover_ready",
    }).eq("id", reel_id);

    return new Response(JSON.stringify({
      success: true,
      reel_id,
      voice: voiceName,
      failed,
      scenes: narrated,
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[generate-reel-voiceover]", err);
    return new Response(JSON.stringify({ error: String(err instanceof Error ? err.message : err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
