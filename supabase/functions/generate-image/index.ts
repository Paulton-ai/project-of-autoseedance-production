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
        _tool: "image",
        _amount: 5,
      });
      if (creditError || !creditResult?.success) {
        throw new Error(creditResult?.error || creditError?.message || "Failed to deduct credits");
      }
    }

    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (!FAL_API_KEY) throw new Error("FAL_API_KEY missing");
    const body = await req.json();
    const { prompt, image_size, style, num_images, reference_images } = body;
    if (!prompt) throw new Error("Prompt required");
    const STYLES: Record<string, string> = {
      realistic: "photorealistic, high quality",
      illustration: "digital illustration, vibrant",
      vector: "vector art, flat design",
      "3d": "3D render, cinematic",
      anime: "anime style, manga art",
      oil: "oil painting",
      watercolor: "watercolor painting",
    };
    const finalPrompt = style && STYLES[style] ? `${prompt}, ${STYLES[style]}` : prompt;
    const hasRef = reference_images && reference_images.length > 0;
    let modelId: string;
    let falBody: Record<string, unknown>;
    if (hasRef) {
      modelId = "fal-ai/bytedance/seedream/v4.5/edit";
      falBody = {
        prompt: finalPrompt,
        image_size: image_size || "auto_4K",
        num_images: num_images || 1,
        max_images: 1,
        enable_safety_checker: true,
        image_urls: reference_images,
      };
    } else {
      modelId = "fal-ai/bytedance/seedream/v4.5/text-to-image";
      falBody = {
        prompt: finalPrompt,
        image_size: image_size || "auto_2K",
        num_images: num_images || 1,
        max_images: 1,
        enable_safety_checker: true,
        seed: Math.floor(Math.random() * 999999),
      };
    }
    console.log("[generate-image] Submitting to:", modelId);
    console.log("[generate-image] Body:", JSON.stringify(falBody));
    const submitRes = await fetch(`https://queue.fal.run/${modelId}`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(falBody),
    });
    const submitText = await submitRes.text();
    console.log("[generate-image] Submit response:", submitRes.status, submitText);
    if (!submitRes.ok) throw new Error(`Fal.ai submit error: ${submitRes.status} - ${submitText}`);
    const submitData = JSON.parse(submitText);

    // Insert generation record
    await supabase.from("generations").insert({
      user_id: user.id,
      tool_type: "image",
      prompt: prompt.trim(),
      settings: { style, image_size, num_images, hasRef },
      external_id: submitData.request_id,
      status: "pending",
      credits_used: isAdmin ? 0 : 5,
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
    console.error("[generate-image] Error:", String(err));
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
