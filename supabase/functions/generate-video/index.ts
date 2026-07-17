import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, x-client-info, apikey",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function getSupabaseClient(authHeader: string) {
  const url = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
  return createClient(url, key, {
    global: { headers: { Authorization: authHeader } },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabase = getSupabaseClient(authHeader);

    // Get user from auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Check admin status
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    const isAdmin = !!roleData;

    // Only consume credits if not admin
    if (!isAdmin) {
      const { data: creditResult, error: creditError } = await supabase.rpc("consume_credits", {
        _tool: "video",
        _amount: 30,
      });
      if (creditError || !creditResult?.success) {
        throw new Error(creditResult?.error || creditError?.message || "Failed to deduct credits");
      }
    }

    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (!FAL_API_KEY) throw new Error("FAL_API_KEY missing");
    const body = await req.json();
    const { prompt, resolution, duration, aspect_ratio, generate_audio, image_urls, video_urls, audio_urls } = body;
    if (!prompt) throw new Error("Prompt required");
    const hasRef = (image_urls?.length > 0) || (video_urls?.length > 0);
    let modelId: string;
    let falBody: Record<string, unknown>;
    if (hasRef) {
      modelId = "bytedance/seedance-2.0/reference-to-video";
      falBody = {
        prompt,
        image_urls: image_urls || [],
        video_urls: video_urls || [],
        audio_urls: audio_urls || [],
        resolution: resolution || "720p",
        duration: duration || "auto",
        aspect_ratio: aspect_ratio || "auto",
        generate_audio: generate_audio ?? true,
        bitrate_mode: "standard",
      };
    } else {
      modelId = "bytedance/seedance-2.0/text-to-video";
      falBody = {
        prompt,
        resolution: resolution || "720p",
        duration: duration || "10",
        aspect_ratio: aspect_ratio || "auto",
        generate_audio: generate_audio ?? true,
        bitrate_mode: "standard",
        seed: Math.floor(Math.random() * 999999),
      };
    }
    console.log("[generate-video] Submitting to:", modelId);
    console.log("[generate-video] Body:", JSON.stringify(falBody));
    const submitRes = await fetch(`https://queue.fal.run/${modelId}`, {
      method: "POST",
      headers: { "Authorization": `Key ${FAL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(falBody),
    });
    if (!submitRes.ok) throw new Error(`Submit failed: ${await submitRes.text()}`);
    const submitData = await submitRes.json();
    console.log("[generate-video] Submit response:", JSON.stringify(submitData));

    // Insert generation record
    await supabase.from("generations").insert({
      user_id: user.id,
      tool_type: "video",
      prompt: prompt.trim(),
      settings: { resolution, duration, aspect_ratio, generate_audio, hasRef },
      external_id: submitData.request_id,
      status: "pending",
      credits_used: isAdmin ? 0 : 30,
    });

    return new Response(JSON.stringify({
      success: true,
      request_id: submitData.request_id,
      status_url: submitData.status_url,
      response_url: submitData.response_url,
      model_id: modelId,
      status: "queued",
      is_admin: isAdmin,
    }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[generate-video] Error:", String(err));
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
