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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "Auto Seedance <noreply@autoseedance.site>";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { recipient_type, specific_email, subject, html_body, sent_by } = await req.json();

    if (!subject || !html_body) {
      return new Response(JSON.stringify({ error: "subject and html_body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let emailList: string[] = [];

    if (recipient_type === "all") {
      const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      emailList = data.users.map((u) => u.email!).filter(Boolean);
    } else if (recipient_type === "free") {
      const { data: subs } = await supabase.from("subscriptions").select("user_id").eq("plan", "free");
      const ids = subs?.map((s: any) => s.user_id) ?? [];
      const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      emailList = users.users
        .filter((u) => ids.includes(u.id))
        .map((u) => u.email!)
        .filter(Boolean);
    } else if (recipient_type === "paid") {
      const { data: subs } = await supabase.from("subscriptions").select("user_id").neq("plan", "free");
      const ids = subs?.map((s: any) => s.user_id) ?? [];
      const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      emailList = users.users
        .filter((u) => ids.includes(u.id))
        .map((u) => u.email!)
        .filter(Boolean);
    } else if (recipient_type === "specific" && specific_email) {
      emailList = [specific_email.trim()];
    }

    if (emailList.length === 0) {
      return new Response(JSON.stringify({ error: "No recipients found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PRIVACY FIX: Send individual emails to each recipient
    // Each user should only see their own email in the "to" field
    // This prevents exposing email addresses to other recipients
    let totalSent = 0;
    let failedEmails: string[] = [];

    for (const email of emailList) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: RESEND_FROM_EMAIL,
            to: email, // Only this user's email - privacy safe
            subject,
            html: html_body,
          }),
        });

        if (res.ok) {
          totalSent++;
        } else {
          const err = await res.text();
          console.error(`Failed to send to ${email}:`, err);
          failedEmails.push(email);
        }

        // Small delay to avoid rate limiting (Resend allows 10/sec on free tier)
        if (emailList.indexOf(email) % 10 === 9) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (err) {
        console.error(`Error sending to ${email}:`, err);
        failedEmails.push(email);
      }
    }

    await supabase.from("email_campaigns").insert({
      subject,
      body_html: html_body,
      recipient_type,
      recipient_count: totalSent,
      sent_by: sent_by ?? null,
      status: "sent",
    });

    return new Response(JSON.stringify({
      success: true,
      sent_count: totalSent,
      failed_count: failedEmails.length,
      failed_emails: failedEmails.slice(0, 10) // Only return first 10 failures
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Campaign error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
