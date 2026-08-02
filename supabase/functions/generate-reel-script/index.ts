import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type Scene = { id: number; duration: number; visual: string; voiceover: string };

interface Body {
  topic: string;
  niche?: string;
  video_length: 30 | 60 | 90;
  style?: string;
  aspect?: string;
  model?: string;
  quality?: "budget" | "premium";
  voiceover?: boolean;
  voice?: string;
  music?: boolean;
  music_mood?: string;
  captions?: boolean;
  caption_style?: string;
  reference_image_url?: string | null;
}

function buildPrompt(b: Body) {
  const sceneCount = b.video_length === 30 ? 4 : b.video_length === 60 ? 6 : 8;
  const perScene = Math.round(b.video_length / sceneCount);
  return `You are a short-form video scriptwriter. Write a ${b.video_length}-second vertical reel script for the ${b.niche ?? "general"} niche in a ${b.style ?? "cinematic"} visual style.

Topic / idea:
"""${b.topic}"""

Return STRICT JSON only (no markdown, no commentary) matching:
{"scenes":[{"id":1,"duration":${perScene},"visual":"...","voiceover":"..."}, ...]}

Rules:
- Exactly ${sceneCount} scenes, each ~${perScene}s.
- Scene 1 is a strong hook (<= 12 words voiceover).
- Last scene ends with a clear call-to-action.
- "visual" describes ONE concrete shot the video model should render (subject, action, camera, lighting). No brand names.
- "voiceover" is spoken narration (natural, punchy). Keep to what fits in ${perScene}s (~${perScene * 2.5} words max).
- Do not repeat imagery scene to scene.`;
}

async function callAnthropic(prompt: string): Promise<{ scenes: Scene[] }> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY missing");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Anthropic ${res.status}: ${txt}`);
  }
  const data = await res.json();
  console.log("[generate-reel-script] FULL DATA:", JSON.stringify(data));
  console.log("[generate-reel-script] stop_reason:", data?.stop_reason);
  console.log("[generate-reel-script] content.length:", Array.isArray(data?.content) ? data.content.length : `not-array (${typeof data?.content})`);
  console.log("[generate-reel-script] usage:", JSON.stringify(data?.usage));
  const textBlock = Array.isArray(data?.content)
    ? data.content.find((c: { type?: string; text?: string }) => c?.type === "text")
    : null;
  const text: string = textBlock?.text ?? data?.content?.[0]?.text ?? "";
  console.log("[generate-reel-script] Raw Claude response:", text);
  // Extract JSON (strip fences if the model still adds them)
  const jsonStr = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const match = jsonStr.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Model did not return JSON. stop_reason=${data?.stop_reason}`);
  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed?.scenes)) throw new Error("Invalid script shape");

  return parsed as { scenes: Scene[] };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) throw new Error("Missing Authorization");

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) throw new Error("Not authenticated");
    const user = userData.user;

    const body = (await req.json()) as Body;
    if (!body?.topic || body.topic.trim().length < 10) {
      throw new Error("Topic is required (min 10 chars)");
    }
    if (![30, 60, 90].includes(body.video_length)) {
      throw new Error("video_length must be 30, 60 or 90");
    }

    const prompt = buildPrompt(body);
    const script = await callAnthropic(prompt);

    // Persist as draft with service role (bypass RLS but stamp real user_id)
    const admin = createClient(url, svc, { auth: { persistSession: false } });
    const { data: row, error: insErr } = await admin
      .from("reel_generations")
      .insert({
        user_id: user.id,
        status: "script_ready",
        topic: body.topic.trim(),
        niche: body.niche ?? null,
        video_length: body.video_length,
        style: body.style ?? null,
        aspect: body.aspect ?? "portrait",
        model: body.model ?? null,
        quality: body.quality ?? "budget",
        voiceover: body.voiceover ?? true,
        voice: body.voice ?? null,
        music: body.music ?? false,
        music_mood: body.music_mood ?? null,
        captions: body.captions ?? true,
        caption_style: body.caption_style ?? null,
        reference_image_url: body.reference_image_url ?? null,
        script,
      })
      .select("id")
      .single();

    if (insErr) throw new Error(insErr.message);

    return new Response(JSON.stringify({ success: true, reel_id: row.id, scenes: script.scenes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[generate-reel-script]", err);
    return new Response(JSON.stringify({ error: String(err instanceof Error ? err.message : err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
