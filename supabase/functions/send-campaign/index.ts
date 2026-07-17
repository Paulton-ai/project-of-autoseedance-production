import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { subject, body: emailBody, target } = body;

    if (!subject || !emailBody) {
      return new Response(JSON.stringify({ error: "Subject and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch target users' emails
    let query = supabase.from("profiles").select("id, display_name");

    if (target === "paid") {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("user_id")
        .neq("plan", "free");
      const paidUserIds = subs?.map((s) => s.user_id) || [];
      if (paidUserIds.length === 0) {
        return new Response(JSON.stringify({ success: true, sent: 0, message: "No paid users found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Get auth users for emails
    } else if (target === "free") {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("plan", "free");
      const freeUserIds = subs?.map((s) => s.user_id) || [];
      // Use free users
    }

    // For admin campaigns, we need to get user emails from auth
    // Since we can't directly access auth.users from the edge function easily,
    // we'll use the admin API to get users
    const adminAuthUrl = `${SUPABASE_URL}/auth/v1/admin/users`;
    const usersRes = await fetch(adminAuthUrl, {
      headers: {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (!usersRes.ok) {
      throw new Error("Failed to fetch users");
    }

    const usersData = await usersRes.json();
    let targetEmails: string[] = [];

    if (target === "all") {
      targetEmails = usersData.users?.map((u: any) => u.email) || [];
    } else if (target === "paid" || target === "free") {
      const { data: subs } = await supabase.from("subscriptions").select("user_id, plan");
      const subsMap = new Map(subs?.map((s) => [s.user_id, s.plan]));

      targetEmails = usersData.users
        ?.filter((u: any) => {
          const plan = subsMap.get(u.id) || "free";
          return target === "paid" ? plan !== "free" : plan === "free";
        })
        .map((u: any) => u.email) || [];
    }

    if (targetEmails.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: "No matching users found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send emails in batches of 100 via Resend
    const batchSize = 100;
    let sent = 0;

    for (let i = 0; i < targetEmails.length; i += batchSize) {
      const batch = targetEmails.slice(i, i + batchSize);

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Seedance AI <noreply@seedance.ai>",
          to: batch,
          subject: subject,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Seedance AI</h1>
              </div>
              <div style="background: #1a1a2e; padding: 30px; border-radius: 0 0 8px 8px; color: #e0e0e0;">
                ${emailBody.replace(/\n/g, "<br/>")}
              </div>
              <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
                You're receiving this email because you have an account at Seedance AI.
              </p>
            </div>
          `,
        }),
      });

      if (emailRes.ok) {
        sent += batch.length;
      } else {
        console.error("Failed to send batch:", await emailRes.text());
      }
    }

    return new Response(JSON.stringify({
      success: true,
      sent: sent,
      total: targetEmails.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-campaign:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper for supabase calls within the function
const supabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      neq: (col: string, val: any) => fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${columns}&${col}=neq.${val}`, {
        headers: {
          "apikey": SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }).then(r => r.json()),
      eq: (col: string, val: any) => fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${columns}&${col}=eq.${val}`, {
        headers: {
          "apikey": SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }).then(r => r.json()),
    }),
  }),
};
