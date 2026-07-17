import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@autoseedance.site";
const SITE_URL = Deno.env.get("SITE_URL") || "https://autoseedance.site";

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
    const { user_id, email, name } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const displayName = name || email.split("@")[0];

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: email,
        subject: "Welcome to Auto Seedance! 🎨",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; padding: 30px 0; }
                .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
                .content { background: #f9fafb; border-radius: 12px; padding: 30px; margin: 20px 0; }
                .button { display: inline-block; background: linear-gradient(135deg, #7c3aed, #2563eb); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
                .credits { text-align: center; padding: 20px; background: #7c3aed10; border-radius: 8px; margin: 20px 0; }
                .credit-item { display: inline-block; margin: 0 15px; text-align: center; }
                .credit-amount { font-size: 28px; font-weight: bold; color: #7c3aed; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">✨ Auto Seedance</div>
                </div>

                <div class="content">
                  <h2 style="margin-top: 0;">Hi ${displayName}!</h2>
                  <p>Welcome to Auto Seedance! We're excited to have you on board.</p>

                  <div class="credits">
                    <p style="margin-bottom: 10px;">You've received</p>
                    <div class="credit-item">
                      <div class="credit-amount">50</div>
                      <div style="color: #666;">Free Credits</div>
                    </div>
                    <p style="margin-top: 15px; font-size: 14px; color: #666;">to start creating amazing AI content</p>
                  </div>

                  <h3>What can you create?</h3>
                  <ul>
                    <li><strong>AI Images</strong> — Generate stunning 2K/4K images from text prompts</li>
                    <li><strong>AI Videos</strong> — Create cinematic videos with AI-generated audio</li>
                  </ul>

                  <div style="text-align: center; margin-top: 30px;">
                    <a href="${SITE_URL}/tools/image" class="button">Start Generating →</a>
                  </div>
                </div>

                <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px;">
                  <p style="margin: 0;"><strong>💡 Tip:</strong> Use detailed prompts for better results. Include style, mood, lighting, and composition details.</p>
                </div>

                <div class="footer">
                  <p>Need help? Just reply to this email.</p>
                  <p style="color: #999; font-size: 12px;">
                    Auto Seedance Team<br>
                    <a href="${SITE_URL}" style="color: #7c3aed;">${SITE_URL}</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${response.status}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify({
      success: true,
      message_id: result.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-welcome-email:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
