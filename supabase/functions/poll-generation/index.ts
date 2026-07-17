import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, x-client-info, apikey",
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (!FAL_API_KEY) throw new Error("FAL_API_KEY missing");
    const bodyText = await req.text();
    if (!bodyText || bodyText.trim() === "") throw new Error("Empty request body");
    const { status_url, response_url } = JSON.parse(bodyText);
    if (!status_url) throw new Error("status_url required");
    if (!response_url) throw new Error("response_url required");
    console.log("[poll-generation] Polling status_url:", status_url);
    // Check status - fal.ai uses GET method for status endpoint
    const statusRes = await fetch(status_url, {
      method: "GET",
      headers: { "Authorization": `Key ${FAL_API_KEY}` },
    });
    const statusText = await statusRes.text();
    console.log("[poll-generation] Status response:", statusRes.status, statusText);
    if (!statusRes.ok) {
      return new Response(JSON.stringify({
        error: `Status check failed: ${statusRes.status} - ${statusText}`
      }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const statusData = JSON.parse(statusText);
    const status = statusData.status;
    console.log("[poll-generation] Status:", status);
    if (status === "COMPLETED") {
      // Fetch result from response_url - fal.ai uses GET method for response endpoint
      console.log("[poll-generation] Fetching result from response_url:", response_url);
      const resultRes = await fetch(response_url, {
        method: "GET",
        headers: { "Authorization": `Key ${FAL_API_KEY}` },
      });
      const resultText = await resultRes.text();
      console.log("[poll-generation] Result response:", resultRes.status, resultText);
      if (!resultRes.ok) {
        return new Response(JSON.stringify({
          error: `Result fetch failed: ${resultRes.status} - ${resultText}`
        }), {
          status: 500,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      const result = JSON.parse(resultText);
      // Image result: { images: [{url}] }
      // Video result: { video: {url} }
      const image_urls = result.images?.map((img: { url: string }) => img.url) || [];
      const video_url = result.video?.url || null;
      console.log("[poll-generation] Completed. image_urls:", image_urls.length, "video_url:", !!video_url);
      return new Response(JSON.stringify({
        status: "completed",
        image_urls,
        video_url,
      }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (status === "FAILED" || statusData.error) {
      console.log("[poll-generation] Failed:", statusData.error);
      return new Response(JSON.stringify({
        status: "failed",
        error: statusData.error || "Generation failed",
      }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    // IN_QUEUE or IN_PROGRESS
    return new Response(JSON.stringify({
      status: "processing",
    }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[poll-generation] Error:", String(err));
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
