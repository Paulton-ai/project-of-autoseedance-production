import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET");
    const PAYPAL_MODE = Deno.env.get("PAYPAL_MODE") || "live";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const BASE_URL = PAYPAL_MODE === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      return new Response(JSON.stringify({ error: "PayPal credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { order_id, user_id } = await req.json();

    if (!order_id || !user_id) {
      return new Response(JSON.stringify({ error: "order_id and user_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if this order was already processed (duplicate protection)
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id, status")
      .eq("paypal_order_id", order_id)
      .maybeSingle();

    if (existingPayment?.status === "completed") {
      return new Response(JSON.stringify({
        success: true,
        message: "Payment already processed",
        plan: null,
        credits_added: 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get PayPal access token
    const tokenRes = await fetch(`${BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to authenticate with PayPal" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { access_token } = await tokenRes.json();

    // Capture the PayPal order
    const captureRes = await fetch(`${BASE_URL}/v2/checkout/orders/${order_id}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    const captureData = await captureRes.json();

    if (!captureRes.ok || captureData.status !== "COMPLETED") {
      console.error("PayPal capture failed:", captureData);
      // Record failed payment attempt
      await supabase.from("payments").insert({
        user_id,
        paypal_order_id: order_id,
        amount: 0,
        currency: "USD",
        status: "failed",
        plan_name: null,
        credits_granted: 0,
      });
      return new Response(JSON.stringify({ error: captureData.message || "Payment not completed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract custom_id: "userId|planName"
    const customId: string = captureData.purchase_units?.[0]?.custom_id ?? "";
    const [capturedUserId, planName] = customId.split("|");
    const resolvedUserId = capturedUserId || user_id;

    const amountStr: string = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? "0";
    const amount = parseFloat(amountStr);

    // Resolve plan credits from DB
    const { data: planRow } = await supabase
      .from("plans")
      .select("monthly_credits, name")
      .ilike("name", planName ?? "")
      .maybeSingle();

    const credits = planRow?.monthly_credits ?? 0;
    const resolvedPlanName = planRow?.name ?? planName ?? "starter";

    // Update subscription
    await supabase.from("subscriptions").upsert({
      user_id: resolvedUserId,
      plan: resolvedPlanName.toLowerCase() as any,
      status: "active",
      paypal_subscription_id: order_id,
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "user_id" });

    // Grant credits via new transaction system (add_credits)
    if (credits > 0) {
      const { data: creditData, error: creditError } = await supabase.rpc("add_credits", {
        _user_id: resolvedUserId,
        _amount: credits,
        _reason: `${planName} plan purchase`,
        _reference_id: null,
        _metadata: { source: "paypal", order_id: order_id },
      });
      if (creditError) {
        console.error("add_credits error:", creditError);
      } else {
        console.log("add_credits result:", creditData);
      }
    }

    // Record successful payment
    await supabase.from("payments").insert({
      user_id: resolvedUserId,
      paypal_order_id: order_id,
      amount,
      currency: "USD",
      status: "completed",
      plan_name: resolvedPlanName,
      credits_granted: credits,
    });

    return new Response(JSON.stringify({
      success: true,
      plan: resolvedPlanName,
      credits_added: credits,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("verify-paypal-payment error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
