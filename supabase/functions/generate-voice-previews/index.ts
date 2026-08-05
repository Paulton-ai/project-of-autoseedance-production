import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { VOICE_GROUPS, DEMO_SENTENCES, voiceValue, voiceSlug } from "../_shared/inworld-voices.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, x-setup-key",
};

const INWORLD_TTS = "https://fal.run/fal-ai/inworld-tts";
const SAMPLE_RATE_HERTZ = 48000;
const BUCKET = "voice-previews";

/**
 * ONE-TIME setup function. Generates one short branded demo sample per Inworld
 * voice and stores it in the "voice-previews" bucket. Already-uploaded voices
 * are skipped, so re-running is free and idempotent. Nothing calls this at
 * deploy time or from the app UI — it must be triggered manually by an admin.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (!FAL_API_KEY) throw new Error("FAL_API_KEY missing");

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(url, svc, { auth: { persistSession: false } });

    // Auth: either a one-time setup key (service-role script / manual trigger)
    // or a logged-in admin's JWT.
    const setupKey = Deno.env.get("VOICE_PREVIEW_SETUP_KEY");
    const providedKey = req.headers.get("x-setup-key");
    const viaSetupKey = !!setupKey && providedKey === setupKey;

    if (!viaSetupKey) {
      const authHeader = req.headers.get("Authorization") || "";
      const token = authHeader.replace(/^Bearer\s+/i, "");
      if (!token) throw new Error("Missing Authorization (send a user token or x-setup-key)");
      const userClient = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
      const { data: userData, error: userErr } = await userClient.auth.getUser(token);
      if (userErr || !userData.user) throw new Error("Not authenticated");
      const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
      if (!isAdmin) throw new Error("Admin only");
    }

    const body = await req.json().catch(() => ({}));
    const force: boolean = body?.force === true;

    // Existing files -> skip (keeps this a one-time cost)
    const { data: existingList } = await admin.storage.from(BUCKET).list("", { limit: 1000 });
    const existing = new Set((existingList ?? []).map((f) => f.name));

    const allTargets: { slug: string; voice: string; text: string }[] = [];
    for (const g of VOICE_GROUPS) {
      const text = DEMO_SENTENCES[g.code] ?? DEMO_SENTENCES.en;
      for (const n of g.names) {
        const slug = voiceSlug(n, g.code);
        if (!force && existing.has(`${slug}.wav`)) continue;
        allTargets.push({ slug, voice: voiceValue(n, g.code), text });
      }
    }
    // Process in chunks so a single invocation stays well inside the request timeout.
    const limit: number = Number.isFinite(body?.limit) ? Math.max(1, Math.min(60, body.limit)) : 20;
    const targets = allTargets.slice(0, limit);
    const remaining = Math.max(0, allTargets.length - targets.length);

    const results: { slug: string; ok: boolean; error?: string }[] = [];
    const CONCURRENCY = 6;
    for (let i = 0; i < targets.length; i += CONCURRENCY) {
      const batch = targets.slice(i, i + CONCURRENCY);
      const done = await Promise.all(batch.map(async (t) => {
        try {
          const res = await fetch(INWORLD_TTS, {
            method: "POST",
            headers: { Authorization: `Key ${FAL_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ text: t.text, voice: t.voice, sample_rate_hertz: SAMPLE_RATE_HERTZ }),
          });
          const raw = await res.text();
          if (!res.ok) throw new Error(`${res.status}: ${raw.slice(0, 200)}`);
          const audioUrl = JSON.parse(raw)?.audio?.url;
          if (!audioUrl) throw new Error("No audio URL in TTS result");
          const bytes = new Uint8Array(await (await fetch(audioUrl)).arrayBuffer());
          const { error: upErr } = await admin.storage.from(BUCKET)
            .upload(`${t.slug}.wav`, bytes, { contentType: "audio/wav", upsert: true });
          if (upErr) throw new Error(upErr.message);
          return { slug: t.slug, ok: true };
        } catch (e) {
          return { slug: t.slug, ok: false, error: String(e instanceof Error ? e.message : e) };
        }
      }));
      results.push(...done);
    }

    const failed = results.filter((r) => !r.ok);
    return new Response(JSON.stringify({
      success: true,
      skipped: existing.size,
      generated: results.length - failed.length,
      failed: failed.length,
      failures: failed.slice(0, 20),
      remaining,
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[generate-voice-previews]", err);
    return new Response(JSON.stringify({ error: String(err instanceof Error ? err.message : err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
