import fs from "node:fs/promises";
import path from "node:path";

const routePath = path.join(process.cwd(), "src/routes/tools.image.tsx");
let source = await fs.readFile(routePath, "utf8");

if (!source.includes("GPT_IMAGE_25_BUILD_INTEGRATION")) {
  throw new Error("GPT Image 2.5 integration must run before finalization");
}

// Credits are charged server-side by generate-image. Remove the old client-side
// debit block so a generation is never charged twice.
const creditBlockPattern = /\n\s*if \(!isAdmin\) \{\n\s*const \{ data, error: creditError \} = await supabase\.rpc\("consume_credits", \{ _tool: "image", _amount: capturedCredits \}\);\n\s*const d = data as \{ success\?: boolean; error\?: string \} \| null;\n\s*if \(creditError \|\| !d\?\.success\) throw new Error\(d\?\.error \|\| creditError\?\.message \|\| "Failed to deduct credits"\);\n\s*\}\n/;
if (!creditBlockPattern.test(source)) throw new Error("Could not find legacy client-side image credit debit block");
source = source.replace(creditBlockPattern, "\n");

// Pass generation_id to the authenticated poller so it can verify that the
// Fal queue URLs belong to the current user's generation record.
source = source.replace(
  'body: { status_url, response_url },',
  'body: { status_url, response_url, generation_id: generationId },',
);

await fs.writeFile(routePath, source, "utf8");
console.log("✓ Removed duplicate client-side credit debit and bound polling to the generation record.");
