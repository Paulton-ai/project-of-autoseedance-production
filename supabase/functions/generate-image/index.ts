import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { buildImagePayload, resolveImageModel } from "../_shared/image-models.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function createUserClient(authHeader: string) {
  const url = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) throw new Error("Supabase authentication is unavailable");

  return createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function createAdminClient() {
  const url = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) throw new Error("Supabase service configuration is unavailable");

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let userClient;
  let adminClient;
  let generationId: string | null = null;
  let chargedCredits = 0;

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) throw new Error("Not authenticated");

    userClient = createUserClient(authHeader);
    adminClient = createAdminClient();

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Not authenticated");

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    const isAdmin = !!roleData;

    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (!FAL_API_KEY) throw new Error("Image generation is temporarily unavailable");

    const body = await req.json();
    const { prompt, image_size, style, quality, num_images, reference_images, model } = body;
    if (typeof prompt !== "string" || !prompt.trim()) throw new Error("Prompt required");

    let modelDef;
    try {
      modelDef = resolveImageModel(model);
    } catch {
      return new Response(JSON.stringify({ error: "Unsupported model selected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const referenceImages = Array.isArray(reference_images) ? reference_images : [];
    const STYLES: Record<string, string> = {
      realistic: "photorealistic, high quality",
      illustration: "digital illustration, vibrant",
      vector: "vector art, flat design",
      "3d": "3D render, cinematic",
      anime: "anime style, manga art",
      oil: "oil painting",
      watercolor: "watercolor painting",
    };
    const finalPrompt = style && STYLES[style] ? `${prompt.trim()}, ${STYLES[style]}` : prompt.trim();

    let endpoint: string;
    let falBody: Record<string, unknown>;
    try {
      const built = buildImagePayload({
        model: modelDef,
        prompt: finalPrompt,
        size: image_size,
        quality,
        numImages: num_images,
        referenceImages,
      });
      endpoint = built.endpoint;
      falBody = built.body;
    } catch (validationError) {
      const code = String(validationError);
      const message = code.includes("UNSUPPORTED_REFERENCE_IMAGES")
        ? "GPT Image 2.5 Text to Image does not use reference images. Use Seedream 4.5 for the Reference to Image tab."
        : "Unsupported generation settings";
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    chargedCredits = modelDef.credits;

    // Create the generation before charging so the debit can be tied to a
    // specific generation and safely refunded if provider submission fails.
    const { data: generation, error: generationError } = await adminClient
      .from("generations")
      .insert({
        user_id: user.id,
        tool_type: "image",
        prompt: prompt.trim(),
        settings: {
          model: modelDef.id,
          provider: modelDef.provider,
          image_size,
          quality: quality || "auto",
          style,
          num_images: Number(num_images) || 1,
          has_reference_images: referenceImages.length > 0,
        },
        status: "pending",
        credits_used: isAdmin ? 0 : chargedCredits,
        provider: modelDef.provider,
      })
      .select("id")
      .single();

    if (generationError || !generation) throw new Error("Could not create generation record");
    generationId = generation.id;

    if (!isAdmin) {
      const { data: creditData, error: creditError } = await userClient.rpc("consume_credits", {
        _tool: "image",
        _amount: chargedCredits,
        _generation_id: generationId,
      });
      const result = creditData as { success?: boolean; error?: string; balance?: number } | null;
      if (creditError || !result?.success) {
        await adminClient.from("generations").update({ status: "failed", error: result?.error || creditError?.message || "Insufficient credits" }).eq("id", generationId);
        return new Response(JSON.stringify({
          error: result?.error || creditError?.message || "Insufficient credits",
          balance: result?.balance,
          required: chargedCredits,
          generation_id: generationId,
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const submitRes = await fetch(`https://queue.fal.run/${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(falBody),
    });
    const submitText = await submitRes.text();

    if (!submitRes.ok) {
      console.error(`[generate-image] Fal submit failed [${submitRes.status}] on ${endpoint}: ${submitText}`);
      await adminClient.from("generations").update({ status: "failed", error: "The image service rejected this request." }).eq("id", generationId);

      if (!isAdmin) {
        await userClient.rpc("refund_generation_credits", { _generation_id: generationId });
      }

      const status = submitRes.status === 429 ? 429 : 502;
      return new Response(JSON.stringify({
        error: status === 429
          ? "The image service is busy right now. Your credits were refunded. Please try again in a moment."
          : "The image service rejected this request. Your credits were refunded. Please adjust your prompt or settings and try again.",
        generation_id: generationId,
      }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const submitData = JSON.parse(submitText);
    if (!submitData?.request_id || !submitData?.status_url || !submitData?.response_url) {
      await adminClient.from("generations").update({ status: "failed", error: "The image service returned an invalid queue response." }).eq("id", generationId);
      if (!isAdmin) await userClient.rpc("refund_generation_credits", { _generation_id: generationId });
      throw new Error("Invalid Fal queue response");
    }

    await adminClient
      .from("generations")
      .update({
        status: "pending",
        settings: {
          ...((generation as { id: string }).id ? {} : {}),
          model: modelDef.id,
          provider: modelDef.provider,
          image_size,
          quality: quality || "auto",
          style,
          num_images: Number(num_images) || 1,
          has_reference_images: referenceImages.length > 0,
          request_id: submitData.request_id,
        },
      })
      .eq("id", generationId);

    return new Response(JSON.stringify({
      success: true,
      request_id: submitData.request_id,
      status_url: submitData.status_url,
      response_url: submitData.response_url,
      model: modelDef.id,
      provider: modelDef.provider,
      credits: chargedCredits,
      generation_id: generationId,
      status: "queued",
      is_admin: isAdmin,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[generate-image] Error:", String(err));
    if (generationId && adminClient) {
      await adminClient.from("generations").update({ status: "failed", error: "Image generation failed." }).eq("id", generationId);
      if (userClient && chargedCredits > 0) {
        try { await userClient.rpc("refund_generation_credits", { _generation_id: generationId }); } catch (refundError) { console.error("[generate-image] Refund failed:", String(refundError)); }
      }
    }
    return new Response(JSON.stringify({ error: "Image generation failed. Please try again.", generation_id: generationId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
