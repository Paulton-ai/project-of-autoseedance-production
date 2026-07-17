import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const BASE_URL = PAYPAL_MODE === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      return new Response(JSON.stringify({ error: "PayPal credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { plan_name, price, user_id } = await req.json();

    if (!plan_name || price == null || !user_id) {
      return new Response(JSON.stringify({ error: "plan_name, price, and user_id are required" }), {
        status: 400,
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
      const errText = await tokenRes.text();
      console.error("PayPal token error:", errText);
      return new Response(JSON.stringify({ error: "Failed to authenticate with PayPal" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Create PayPal order
    const orderRes = await fetch(`${BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: { currency_code: "USD", value: price.toString() },
          description: `Auto Seedance - ${plan_name} Plan`,
          custom_id: `${user_id}|${plan_name}`,
        }],
        application_context: {
          return_url: "https://autoseedance.site/payment/success",
          cancel_url: "https://autoseedance.site/payment/cancel",
          brand_name: "Auto Seedance",
          user_action: "PAY_NOW",
        },
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      console.error("PayPal order error:", orderData);
      return new Response(JSON.stringify({ error: orderData.message || "Failed to create PayPal order" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const approvalUrl = orderData.links?.find((l: any) => l.rel === "approve")?.href;

    return new Response(JSON.stringify({
      success: true,
      order_id: orderData.id,
      approval_url: approvalUrl,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-paypal-order error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
