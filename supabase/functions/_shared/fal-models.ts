// Per-model Fal.ai endpoint + payload builder.
// Each Fal video model has a DIFFERENT input schema — sending a shared payload
// (the old behaviour) produces 422 validation errors on everything except Seedance.

export type Quality = "budget" | "premium";

export function resolveModelEndpoint(model: string, quality: Quality): string {
  const premium = quality === "premium";
  switch (model) {
    case "wan-2.6":
      return "fal-ai/wan/v2.2-a14b/text-to-video";
    case "kling-2.6":
      return premium
        ? "fal-ai/kling-video/v2.6/pro/text-to-video"
        : "fal-ai/kling-video/v2.5-turbo/pro/text-to-video";
    case "veo-3":
      return premium ? "fal-ai/veo3" : "fal-ai/veo3/fast";
    case "seedance-2":
    default:
      return "bytedance/seedance-2.0/text-to-video";
  }
}

export function aspectToRatio(aspect: string): string {
  return aspect === "landscape" ? "16:9" : "9:16";
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Build the exact request body the selected Fal endpoint expects. */
export function buildFalPayload(opts: {
  model: string;
  quality: Quality;
  aspect: string;
  prompt: string;
  duration: number;
}): Record<string, unknown> {
  const { model, quality, aspect, prompt } = opts;
  const premium = quality === "premium";
  const aspect_ratio = aspectToRatio(aspect);
  const seconds = clamp(Math.round(opts.duration || 5), 4, 15);

  switch (model) {
    case "veo-3": {
      // duration enum: "4s" | "6s" | "8s"; resolution: 720p | 1080p
      const veoDur = seconds <= 5 ? "4s" : seconds <= 7 ? "6s" : "8s";
      return {
        prompt,
        aspect_ratio,
        resolution: premium ? "1080p" : "720p",
        duration: veoDur,
        generate_audio: false,
        auto_fix: true,
      };
    }
    case "kling-2.6": {
      // duration enum: "5" | "10"; no resolution field
      return {
        prompt,
        aspect_ratio,
        duration: seconds > 7 ? "10" : "5",
        cfg_scale: 0.5,
        negative_prompt: "blur, distort, and low quality",
        ...(premium ? { generate_audio: false } : {}),
      };
    }
    case "wan-2.6": {
      // no duration field — length is num_frames / frames_per_second
      const fps = 16;
      const num_frames = clamp(seconds * fps, 17, 161);
      return {
        prompt,
        aspect_ratio,
        resolution: premium ? "720p" : "580p",
        num_frames,
        frames_per_second: fps,
        num_inference_steps: premium ? 35 : 27,
        enable_safety_checker: true,
        enable_prompt_expansion: false,
      };
    }
    case "seedance-2":
    default: {
      return {
        prompt,
        aspect_ratio,
        resolution: premium ? "1080p" : "720p",
        duration: String(seconds),
        generate_audio: false,
        bitrate_mode: "standard",
      };
    }
  }
}
