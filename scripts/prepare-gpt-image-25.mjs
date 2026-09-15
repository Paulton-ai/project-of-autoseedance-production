import fs from "node:fs/promises";
import path from "node:path";

const routePath = path.join(process.cwd(), "src/routes/tools.image.tsx");
let source = await fs.readFile(routePath, "utf8");

if (source.includes("/* GPT_IMAGE_25_BUILD_INTEGRATION */")) {
  console.log("✓ GPT Image 2.5 build integration already applied");
  process.exit(0);
}

const marker = "/* GPT_IMAGE_25_BUILD_INTEGRATION */";

const modelDefinitions = `${marker}\nconst IMAGE_MODEL_OPTIONS = [\n  {\n    id: "seedream-4.5",\n    label: "Seedream 4.5",\n    description: "Existing Auto Seedance image model",\n    credits: 5,\n    supportsReferenceImages: true,\n    sizes: ["auto_2K", "auto_4K", "square_hd", "landscape_4_3", "portrait_4_3"],\n    quality: ["auto"],\n  },\n  {\n    id: "gpt-image-2.5-flare",\n    label: "GPT Image 2.5 Flare",\n    description: "Fast, high-quality generation",\n    credits: 6,\n    supportsReferenceImages: false,\n    sizes: ["auto", "square", "square_hd", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9"],\n    quality: ["auto", "low", "medium", "high"],\n  },\n  {\n    id: "gpt-image-2.5-sunburst",\n    label: "GPT Image 2.5 Sunburst",\n    description: "Higher detail and precision",\n    credits: 10,\n    supportsReferenceImages: false,\n    sizes: ["auto", "square", "square_hd", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9"],\n    quality: ["auto", "low", "medium", "high"],\n  },\n] as const;\n\nconst GPT_IMAGE_25_IDS = new Set(["gpt-image-2.5-flare", "gpt-image-2.5-sunburst"]);\nconst GPT_IMAGE_25_SIZES = [\n  { value: "auto", label: "Auto" },\n  { value: "square_hd", label: "Square HD" },\n  { value: "square", label: "Square" },\n  { value: "portrait_4_3", label: "Portrait 4:3" },\n  { value: "portrait_16_9", label: "Portrait 16:9" },\n  { value: "landscape_4_3", label: "Landscape 4:3" },\n  { value: "landscape_16_9", label: "Landscape 16:9" },\n];\nconst GPT_IMAGE_25_QUALITY = [\n  { value: "auto", label: "Auto" },\n  { value: "low", label: "Low" },\n  { value: "medium", label: "Medium" },\n  { value: "high", label: "High" },\n];\n`;

const constantsAnchor = 'const CREDITS_PER_IMAGE = 5;';
if (!source.includes(constantsAnchor)) throw new Error("Could not find image credit constant in tools.image.tsx");
source = source.replace(constantsAnchor, `${constantsAnchor}\n\n${modelDefinitions}`);

const stateAnchor = 'const [selectedStyle, setSelectedStyle] = useState("realistic");';
if (!source.includes(stateAnchor)) throw new Error("Could not find image style state in tools.image.tsx");
source = source.replace(
  stateAnchor,
  `${stateAnchor}\n  const [selectedModel, setSelectedModel] = useState("seedream-4.5");\n  const [selectedQuality, setSelectedQuality] = useState("auto");`,
);

const generateAnchor = '    if (!isAdmin) {\n      const { data: wallet } = await supabase.from("credit_wallets").select("balance").eq("user_id", userId).maybeSingle();';
if (!source.includes(generateAnchor)) throw new Error("Could not find image credit precheck in tools.image.tsx");
source = source.replace(
  generateAnchor,
  '    const selectedModelDef = IMAGE_MODEL_OPTIONS.find((model) => model.id === selectedModel) || IMAGE_MODEL_OPTIONS[0];\n    const creditsRequired = selectedModelDef.credits;\n    if (activeTab === "reference" && !selectedModelDef.supportsReferenceImages) {\n      toast.error("GPT Image 2.5 is Text to Image only here. Select Seedream 4.5 for reference images.");\n      return;\n    }\n\n    if (!isAdmin) {\n      const { data: wallet } = await supabase.from("credit_wallets").select("balance").eq("user_id", userId).maybeSingle();',
);
source = source.replace('if (wallet && wallet.balance < CREDITS_PER_IMAGE) {', 'if (wallet && wallet.balance < creditsRequired) {');
source = source.replace('setCreditsDialog({ open: true, balance: wallet.balance });', 'setCreditsDialog({ open: true, balance: wallet.balance });');

source = source.replace(
  '    const capturedTab = activeTab;\n    const capturedRefImages = capturedTab === "reference" ? [...referenceImages] : [];',
  '    const capturedTab = activeTab;\n    const capturedModel = selectedModel;\n    const capturedQuality = selectedQuality;\n    const capturedCredits = creditsRequired;\n    const capturedRefImages = capturedTab === "reference" ? [...referenceImages] : [];',
);

source = source.replace(
  '    setQueue((prev) => [newItem, ...prev]);\n\n    // Run async in background — don\'t await\n    (async () => {',
  '    setQueue((prev) => [newItem, ...prev]);\n    let generationId: string | null = null;\n\n    // Run async in background — don\'t await\n    (async () => {',
);

source = source.replace(
  'const { data, error: creditError } = await supabase.rpc("consume_credits", { _tool: "image", _amount: CREDITS_PER_IMAGE });',
  'const { data, error: creditError } = await supabase.rpc("consume_credits", { _tool: "image", _amount: capturedCredits });',
);
source = source.replace(
  '          body: {\n            prompt: capturedPrompt,\n            image_size: capturedSize || "auto_2K",\n            style: capturedStyle || "realistic",\n            num_images: 1,\n            reference_images: capturedRefImages,\n          },',
  '          body: {\n            prompt: capturedPrompt,\n            image_size: capturedSize || (capturedModel === "seedream-4.5" ? "auto_2K" : "auto"),\n            style: capturedStyle || "realistic",\n            quality: capturedQuality,\n            model: capturedModel,\n            num_images: 1,\n            reference_images: capturedRefImages,\n          },',
);
source = source.replace(
  '        const { status_url, response_url } = data;\n        let pollCount = 0;',
  '        const { status_url, response_url, generation_id } = data;\n        generationId = generation_id || null;\n        let pollCount = 0;',
);

source = source.replace(
  '            updateQueueItem(itemId, { status: "failed", error: "Generation timed out" });\n            return;',
  '            updateQueueItem(itemId, { status: "failed", error: "Generation timed out" });\n            if (generationId && !isAdmin) {\n              await supabase.functions.invoke("refund-generation", { body: { generation_id: generationId } }).catch(() => {});\n            }\n            return;',
);

const completedInsert = `              const primaryUrl = pollData.image_urls[0];\n              await supabase.from("generations").insert({\n                user_id: userId, tool_type: "image", prompt: capturedPrompt,\n                settings: { image_size: capturedSize, style: capturedStyle, has_reference_images: capturedRefImages.length > 0 },\n                status: "done", result_url: primaryUrl, thumbnail_url: primaryUrl, credits_used: CREDITS_PER_IMAGE,\n              });\n              if (userId) fetchGenerations(userId);`;
if (!source.includes(completedInsert)) throw new Error("Could not find legacy generation insert block");
source = source.replace(
  completedInsert,
  `              const primaryUrl = pollData.image_urls[0];\n              if (generationId && userId) {\n                await supabase.from("generations").update({\n                  status: "done",\n                  result_url: primaryUrl,\n                  thumbnail_url: primaryUrl,\n                  error: null,\n                  updated_at: new Date().toISOString(),\n                }).eq("id", generationId).eq("user_id", userId);\n              }\n              if (userId) fetchGenerations(userId);`,
);

source = source.replace(
  '              updateQueueItem(itemId, { status: "failed", error: pollData?.error || "Generation failed" });',
  '              updateQueueItem(itemId, { status: "failed", error: pollData?.error || "Generation failed" });\n              if (generationId && !isAdmin) {\n                await supabase.functions.invoke("refund-generation", { body: { generation_id: generationId } }).catch(() => {});\n              }\n              if (generationId) {\n                await supabase.from("generations").update({ status: "failed", error: pollData?.error || "Generation failed", updated_at: new Date().toISOString() }).eq("id", generationId).eq("user_id", userId);\n              }',
);

source = source.replace(
  '      } catch (e: unknown) {\n        updateQueueItem(itemId, { status: "failed", error: e instanceof Error ? e.message : "Generation failed" });',
  '      } catch (e: unknown) {\n        if (generationId && !isAdmin) {\n          await supabase.functions.invoke("refund-generation", { body: { generation_id: generationId } }).catch(() => {});\n        }\n        if (generationId) {\n          await supabase.from("generations").update({ status: "failed", error: e instanceof Error ? e.message : "Generation failed", updated_at: new Date().toISOString() }).eq("id", generationId).eq("user_id", userId);\n        }\n        updateQueueItem(itemId, { status: "failed", error: e instanceof Error ? e.message : "Generation failed" });',
);

const renderAnchor = '  const activeQueueItems = queue.filter((i) => i.status !== "done" || i.resultUrls.length > 0);';
if (!source.includes(renderAnchor)) throw new Error("Could not find image queue render anchor");
source = source.replace(
  renderAnchor,
  `${renderAnchor}\n  const selectedModelDef = IMAGE_MODEL_OPTIONS.find((model) => model.id === selectedModel) || IMAGE_MODEL_OPTIONS[0];\n  const creditsRequired = selectedModelDef.credits;\n  const isGptImage25 = GPT_IMAGE_25_IDS.has(selectedModel);\n  const displayedImageSizes = isGptImage25 ? GPT_IMAGE_25_SIZES : IMAGE_SIZES;`,
);

const sizeMap = '{IMAGE_SIZES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}';
source = source.replaceAll(sizeMap, '{displayedImageSizes.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}');

const gridBlock = `<div className="grid md:grid-cols-2 gap-4">\n                <div>\n                  <Label>Image Size</Label>\n                  <Select value={selectedSize} onValueChange={setSelectedSize}>\n                    <SelectTrigger className="mt-1 bg-muted/50 border-border"><SelectValue /></SelectTrigger>\n                    <SelectContent>{displayedImageSizes.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>\n                  </Select>\n                </div>\n                <div>\n                  <Label>Style</Label>\n                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>\n                    <SelectTrigger className="mt-1 bg-muted/50 border-border"><SelectValue /></SelectTrigger>\n                    <SelectContent>{STYLES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>\n                  </Select>\n                </div>\n              </div>`;
const newGridBlock = `<div className="grid md:grid-cols-3 gap-4">\n                <div>\n                  <Label>Image Size</Label>\n                  <Select value={selectedSize} onValueChange={setSelectedSize}>\n                    <SelectTrigger className="mt-1 bg-muted/50 border-border"><SelectValue /></SelectTrigger>\n                    <SelectContent>{displayedImageSizes.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>\n                  </Select>\n                </div>\n                <div>\n                  <Label>Style</Label>\n                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>\n                    <SelectTrigger className="mt-1 bg-muted/50 border-border"><SelectValue /></SelectTrigger>\n                    <SelectContent>{STYLES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>\n                  </Select>\n                </div>\n                <div>\n                  <Label>Quality</Label>\n                  {isGptImage25 ? (\n                    <Select value={selectedQuality} onValueChange={setSelectedQuality}>\n                      <SelectTrigger className="mt-1 bg-muted/50 border-border"><SelectValue /></SelectTrigger>\n                      <SelectContent>{GPT_IMAGE_25_QUALITY.map((q) => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}</SelectContent>\n                    </Select>\n                  ) : (\n                    <div className="mt-1 h-10 flex items-center rounded-md border border-border bg-muted/30 px-3 text-sm text-muted-foreground">Default model quality</div>\n                  )}\n                </div>\n              </div>`;
if (!source.includes(gridBlock)) throw new Error("Could not find image settings grid block");
source = source.replaceAll(gridBlock, newGridBlock);

const tabsAnchor = '<TabsContent value="text" className="space-y-4">';
const modelSelector = `<div className="mb-4">\n              <div className="flex items-center justify-between mb-2">\n                <Label>Model</Label>\n                <Badge variant="outline">{creditsRequired} credits</Badge>\n              </div>\n              <Select\n                value={selectedModel}\n                onValueChange={(value) => {\n                  setSelectedModel(value);\n                  const nextIsGpt = GPT_IMAGE_25_IDS.has(value);\n                  setSelectedQuality("auto");\n                  setSelectedSize(nextIsGpt ? "auto" : "auto_2K");\n                }}\n              >\n                <SelectTrigger className="bg-muted/50 border-border"><SelectValue /></SelectTrigger>\n                <SelectContent>\n                  {IMAGE_MODEL_OPTIONS.map((model) => (\n                    <SelectItem key={model.id} value={model.id}>\n                      <div className="flex flex-col py-0.5">\n                        <span>{model.label}</span>\n                        <span className="text-xs text-muted-foreground">{model.description} · {model.credits} credits</span>\n                      </div>\n                    </SelectItem>\n                  ))}\n                </SelectContent>\n              </Select>\n              {activeTab === "reference" && isGptImage25 && (\n                <p className="mt-2 text-xs text-amber-500">GPT Image 2.5 is available in Text to Image. Select Seedream 4.5 to use reference images.</p>\n              )}\n            </div>`;
if (!source.includes(tabsAnchor)) throw new Error("Could not find Text to Image tab anchor");
source = source.replace(tabsAnchor, `${tabsAnchor}\n              ${modelSelector}`);

const referenceTabsAnchor = '<TabsContent value="reference" className="space-y-4">';
if (!source.includes(referenceTabsAnchor)) throw new Error("Could not find Reference to Image tab anchor");
source = source.replace(referenceTabsAnchor, `${referenceTabsAnchor}\n              ${modelSelector}`);

source = source.replace(
  '<Badge variant="outline" className="ml-auto">{CREDITS_PER_IMAGE} credits</Badge>',
  '<Badge variant="outline" className="ml-auto">{creditsRequired} credits</Badge>',
);
source = source.replace(
  '<Button onClick={handleGenerate} disabled={!prompt.trim()} className="mt-6 btn-gradient text-white border-0">\n            <Sparkles className="size-4 mr-2" /> Generate ({CREDITS_PER_IMAGE} credits)\n          </Button>',
  '<Button onClick={handleGenerate} disabled={!prompt.trim() || (activeTab === "reference" && isGptImage25)} className="mt-6 btn-gradient text-white border-0">\n            <Sparkles className="size-4 mr-2" /> Generate ({creditsRequired} credits)\n          </Button>',
);

await fs.writeFile(routePath, source, "utf8");
console.log("✓ Added GPT Image 2.5 Flare/Sunburst model selection, model-aware sizes/quality, secure model payloads, and generation history integration.");
