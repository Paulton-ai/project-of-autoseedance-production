// Canonical server-side registry for Text-to-Image models.
// The client may only select a registry key; it can never supply a raw Fal endpoint.

export type ImageModelId = "seedream-4.5" | "gpt-image-2.5-flare" | "gpt-image-2.5-sunburst";

export interface ImageModelDef {
  id: ImageModelId;
  provider: "fal";
  endpoint: string;
  editEndpoint?: string;
  credits: number;
  supportedSizes: string[];
  supportedQuality?: string[];
  supportsReferenceImages: boolean;
  maxImages: number;
}

export const IMAGE_MODELS: Record<ImageModelId, ImageModelDef> = {
  "seedream-4.5": {
    id: "seedream-4.5",
    provider: "fal",
    endpoint: "fal-ai/bytedance/seedream/v4.5/text-to-image",
    editEndpoint: "fal-ai/bytedance/seedream/v4.5/edit",
    credits: 5,
    supportedSizes: ["auto_2K", "auto_4K", "square_hd", "landscape_4_3", "portrait_4_3"],
    supportsReferenceImages: true,
    maxImages: 1,
  },
  "gpt-image-2.5-flare": {
    id: "gpt-image-2.5-flare",
    provider: "fal",
    endpoint: "openai/gpt-image-2.5/flare/text-to-image",
    credits: 6,
    supportedSizes: [
      "auto",
      "square",
      "square_hd",
      "portrait_4_3",
      "portrait_16_9",
      "landscape_4_3",
      "landscape_16_9",
    ],
    supportedQuality: ["auto", "low", "medium", "high"],
    supportsReferenceImages: false,
    maxImages: 1,
  },
  "gpt-image-2.5-sunburst": {
    id: "gpt-image-2.5-sunburst",
    endpoint: "openai/gpt-image-2.5/sunburst/text-to-image",
    provider: "fal",
    credits: 10,
    supportedSizes: [
      "auto",
      "square",
      "square_hd",
      "portrait_4_3",
      "portrait_16_9",
      "landscape_4_3",
      "landscape_16_9",
    ],
    supportedQuality: ["auto", "low", "medium", "high"],
    supportsReferenceImages: false,
    maxImages: 1,
  },
};

export const DEFAULT_IMAGE_MODEL: ImageModelId = "seedream-4.5";

export function resolveImageModel(id: unknown): ImageModelDef {
  if (typeof id !== "string" || !(id in IMAGE_MODELS)) {
    if (id === undefined || id === null || id === "") return IMAGE_MODELS[DEFAULT_IMAGE_MODEL];
    throw new Error("UNSUPPORTED_MODEL");
  }
  return IMAGE_MODELS[id as ImageModelId];
}

function normalizeSize(model: ImageModelDef, size: unknown): string {
  const fallback = model.supportedSizes.includes("auto") ? "auto" : model.supportedSizes[0];
  if (typeof size !== "string") return fallback;
  if (model.supportedSizes.includes(size)) return size;
  if (model.id !== "seedream-4.5" && (size === "auto_2K" || size === "auto_4K")) return fallback;
  return fallback;
}

function normalizeSeedreamSize(size: unknown, fallback: string): string {
  const allowed = IMAGE_MODELS["seedream-4.5"].supportedSizes;
  return typeof size === "string" && allowed.includes(size) ? size : fallback;
}

export function buildImagePayload(opts: {
  model: ImageModelDef;
  prompt: string;
  size: unknown;
  quality: unknown;
  numImages: unknown;
  referenceImages?: string[];
}): { endpoint: string; body: Record<string, unknown> } {
  const { model, prompt, referenceImages } = opts;
  const requested = Number(opts.numImages) || 1;
  const num_images = Math.min(Math.max(1, Math.trunc(requested)), model.maxImages);
  const hasRef = !!referenceImages && referenceImages.length > 0;

  if (hasRef && !model.supportsReferenceImages) throw new Error("UNSUPPORTED_REFERENCE_IMAGES");

  if (model.id === "seedream-4.5") {
    if (hasRef) {
      return {
        endpoint: model.editEndpoint!,
        body: {
          prompt,
          image_size: normalizeSeedreamSize(opts.size, "auto_4K"),
          num_images,
          max_images: 1,
          enable_safety_checker: true,
          image_urls: referenceImages,
        },
      };
    }

    return {
      endpoint: model.endpoint,
      body: {
        prompt,
        image_size: normalizeSeedreamSize(opts.size, "auto_2K"),
        num_images,
        max_images: 1,
        enable_safety_checker: true,
        seed: Math.floor(Math.random() * 999999),
      },
    };
  }

  const quality =
    typeof opts.quality === "string" && model.supportedQuality?.includes(opts.quality)
      ? opts.quality
      : "auto";

  return {
    endpoint: model.endpoint,
    body: {
      prompt,
      image_size: normalizeSize(model, opts.size),
      quality,
      num_images,
    },
  };
}
