import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role key for privileged operations
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Parse request body
    const { user_id, new_plan_name } = await req.json();

    if (!user_id || !new_plan_name) {
      return new Response(JSON.stringify({ error: "user_id and new_plan_name are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize plan name (handle display_name variations)
    const planNameMap: Record<string, string> = {
      "free": "free",
      "starter": "starter",
      "basic": "starter",
      "standard": "pro",
      "pro": "pro",
      "business": "business",
    };
    const normalizedPlan = planNameMap[new_plan_name.toLowerCase()] || new_plan_name.toLowerCase();

    // 1. Look up the plan details to get monthly_credits
    const { data: planData, error: planError } = await supabaseAdmin
      .from("plans")
      .select("id, name, monthly_credits, display_name")
      .eq("name", normalizedPlan)
      .maybeSingle();

    // For free plan, it might not exist in plans table - use default credits
    let monthlyCredits = 50; // Default for free plan
    let planId = null;

    if (planData) {
      monthlyCredits = planData.monthly_credits || 0;
      planId = planData.id;
    } else if (normalizedPlan === "free") {
      // Free plan might not be in plans table
      const { data: settingsData } = await supabaseAdmin
        .from("site_settings")
        .select("free_signup_credits")
        .eq("id", 1)
        .maybeSingle();
      monthlyCredits = settingsData?.free_signup_credits || 50;
    }

    // 2. Update the subscriptions table
    const now = new Date().toISOString();
    const { error: subError } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id: user_id,
          plan: normalizedPlan,
          status: "active",
          updated_at: now,
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        },
        { onConflict: "user_id" }
      );

    if (subError) {
      console.error("Subscription update error:", subError);
      return new Response(JSON.stringify({ error: "Failed to update subscription: " + subError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Get current balance for the ledger record
    const { data: currentWallet } = await supabaseAdmin
      .from("credit_wallets")
      .select("balance")
      .eq("user_id", user_id)
      .maybeSingle();

    const currentBalance = currentWallet?.balance || 0;

    // 4. Update the credit_wallets table with the new balance AND monthly_grant
    const { error: walletError } = await supabaseAdmin
      .from("credit_wallets")
      .upsert(
        {
          user_id: user_id,
          balance: monthlyCredits,
          monthly_grant: monthlyCredits,
          updated_at: now,
        },
        { onConflict: "user_id" }
      );

    if (walletError) {
      console.error("Wallet update error:", walletError);
      return new Response(JSON.stringify({ error: "Failed to update credit wallet: " + walletError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Add a record to credit_ledger
    const creditDiff = monthlyCredits - currentBalance;
    const { error: ledgerError } = await supabaseAdmin
      .from("credit_ledger")
      .insert({
        user_id: user_id,
        amount: creditDiff,
        balance_after: monthlyCredits,
        reason: `Plan changed to ${normalizedPlan}${planData?.display_name ? ` (${planData.display_name})` : ""} by admin`,
        tool: "admin",
      });

    if (ledgerError) {
      console.error("Ledger insert error:", ledgerError);
      // Don't fail the whole operation for ledger error, but log it
    }

    return new Response(JSON.stringify({
      success: true,
      user_id: user_id,
      new_plan: normalizedPlan,
      monthly_credits: monthlyCredits,
      previous_balance: currentBalance,
      new_balance: monthlyCredits,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Admin update plan error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
