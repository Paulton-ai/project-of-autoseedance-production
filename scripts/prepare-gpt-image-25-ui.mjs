import fs from "node:fs/promises";
import path from "node:path";

const routePath = path.join(process.cwd(), "src/routes/tools.image.tsx");
let source = await fs.readFile(routePath, "utf8");

const startMarker = '<div className="mb-4">\n              <div className="flex items-center justify-between mb-2">\n                <Label>Model</Label>';
const start = source.indexOf(startMarker);
if (start === -1) throw new Error("GPT Image 2.5 model selector block not found");

const endMarker = '              )}\n            </div>';
const end = source.indexOf(endMarker, start);
if (end === -1) throw new Error("GPT Image 2.5 model selector end not found");
const endExclusive = end + endMarker.length;

const replacement = `<div className="mb-4">\n              <div className="flex items-center justify-between mb-2">\n                <Label>Model</Label>\n                <Badge variant="outline">{creditsRequired} credits</Badge>\n              </div>\n              <Select\n                value={selectedModel}\n                onValueChange={(value) => {\n                  setSelectedModel(value);\n                  const nextIsGpt = GPT_IMAGE_25_IDS.has(value);\n                  setSelectedQuality("auto");\n                  setSelectedSize(nextIsGpt ? "auto" : "auto_2K");\n                }}\n              >\n                <SelectTrigger className="bg-muted/50 border-border w-full">\n                  <div className="flex min-w-0 w-full items-center gap-3 pr-2">\n                    <span className="shrink-0 font-medium">{selectedModelDef.label}</span>\n                    <span className="min-w-0 flex-1 truncate text-left text-xs text-muted-foreground">{selectedModelDef.description}</span>\n                    <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">{creditsRequired} credits</span>\n                  </div>\n                </SelectTrigger>\n                <SelectContent className="min-w-[320px]">\n                  {IMAGE_MODEL_OPTIONS.map((model) => (\n                    <SelectItem key={model.id} value={model.id}>\n                      <div className="flex w-full min-w-0 items-center gap-3 pr-2">\n                        <span className="shrink-0 font-medium">{model.label}</span>\n                        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{model.description}</span>\n                        <span className="shrink-0 text-[11px] text-muted-foreground">{model.credits} credits</span>\n                      </div>\n                    </SelectItem>\n                  ))}\n                </SelectContent>\n              </Select>\n              {activeTab === "reference" && isGptImage25 && (\n                <p className="mt-2 text-xs text-amber-500">GPT Image 2.5 is available in Text to Image. Select Seedream 4.5 to use reference images.</p>\n              )}\n            </div>`;

source = source.slice(0, start) + replacement + source.slice(endExclusive);
await fs.writeFile(routePath, source, "utf8");
console.log("✓ GPT Image 2.5 model selector now uses a single horizontal row: name left, tagline right, credits at the far right.");
