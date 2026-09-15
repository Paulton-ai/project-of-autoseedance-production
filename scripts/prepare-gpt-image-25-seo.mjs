import fs from "node:fs";
import path from "node:path";

const file = path.resolve("src/routes/tools.image.tsx");
let source = fs.readFileSync(file, "utf8");

source = source
  .replace(/\{ title: "[^"]*" \},/, '{ title: "GPT Image 2.5 Free Online – Flare & Sunburst AI Image Generator | Auto Seedance" },')
  .replace(/\{ name: "description", content: "[^"]*" \},/, '{ name: "description", content: "Use GPT Image 2.5 free online with Auto Seedance. Generate high-quality AI images with GPT Image 2.5 Flare and Sunburst from simple text prompts." },')
  .replace(/\n\s*\{ name: "keywords", content: "[^"]*" \},/, "")
  .replace(/\{ property: "og:title", content: "[^"]*" \},/, '{ property: "og:title", content: "GPT Image 2.5 Free Online – Flare & Sunburst | Auto Seedance" },')
  .replace(/\{ property: "og:description", content: "[^"]*" \},/, '{ property: "og:description", content: "Generate AI images online with GPT Image 2.5 Flare and Sunburst on Auto Seedance." },')
  .replace(/\{ name: "twitter:title", content: "[^"]*" \},/, '{ name: "twitter:title", content: "GPT Image 2.5 Free Online – Flare & Sunburst | Auto Seedance" },')
  .replace(/\{ name: "twitter:description", content: "[^"]*" \},/, '{ name: "twitter:description", content: "Generate AI images online with GPT Image 2.5 Flare and Sunburst on Auto Seedance." },');

source = source.replace(/\n\s*aggregateRating: \{ "@type": "AggregateRating", ratingValue: "4\.9", ratingCount: "850" \},/, "");

const faqStart = source.indexOf('      {\n        type: "application/ld+json",\n        children: JSON.stringify({\n          "@context": "https://schema.org",\n          "@type": "FAQPage"');
if (faqStart !== -1) {
  const faqEnd = source.indexOf("      },\n    ],", faqStart);
  if (faqEnd === -1) throw new Error("Could not locate FAQ structured-data end marker");
  source = source.slice(0, faqStart) + source.slice(faqEnd + "      },\n".length);
}

source = source.replace(
  '<h1 className="font-display text-3xl font-bold">Free AI Image Generator</h1>\n            <p className="text-muted-foreground text-sm">Create stunning AI images from text prompts</p>',
  '<h1 className="font-display text-3xl font-bold">GPT Image 2.5 Free Online</h1>\n            <p className="text-muted-foreground text-sm">Generate AI images with GPT Image 2.5 Flare and Sunburst</p>',
);

const seoSection = `
        <section className="mt-10" aria-labelledby="gpt-image-25-heading">
          <Card className="glass border-0 p-6 md:p-8">
            <div className="max-w-4xl space-y-7">
              <div>
                <h2 id="gpt-image-25-heading" className="font-display text-2xl font-bold">GPT Image 2.5 Free Online</h2>
                <p className="mt-3 text-muted-foreground leading-7">Create images online with GPT Image 2.5 on Auto Seedance. Enter a prompt above to generate visuals with GPT Image 2.5 Flare and GPT Image 2.5 Sunburst.</p>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold">GPT Image 2.5 Flare</h2>
                <p className="mt-2 text-muted-foreground leading-7">GPT Image 2.5 Flare is designed for fast, high-quality everyday image generation. It is a strong choice for social media graphics, thumbnails, product concepts, visual ideas, and quick creative iterations.</p>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold">GPT Image 2.5 Sunburst</h2>
                <p className="mt-2 text-muted-foreground leading-7">GPT Image 2.5 Sunburst is designed for detailed creative work where more precision is useful. Use it for polished visual concepts, detailed layouts, product imagery, and prompts that need tighter control.</p>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold">How to Use GPT Image 2.5 Online</h2>
                <ol className="mt-3 list-decimal pl-5 space-y-2 text-muted-foreground leading-7">
                  <li>Enter a clear description of the image you want to create.</li>
                  <li>Choose GPT Image 2.5 Flare or GPT Image 2.5 Sunburst from the model selector.</li>
                  <li>Select the available image size and quality options.</li>
                  <li>Click Generate and review the result in your generation queue.</li>
                </ol>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold">GPT Image 2.5 for AI Images</h2>
                <p className="mt-2 text-muted-foreground leading-7">GPT Image 2.5 can be used for AI art, realistic visuals, illustrations, product concepts, social media content, YouTube thumbnails, posters, and other creative image projects. Auto Seedance provides the generator in the browser so you can move from a text prompt to an image without leaving this page.</p>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold">GPT Image 2.5 FAQ</h2>
                <div className="mt-4 space-y-4 text-muted-foreground leading-7">
                  <div><h3 className="font-semibold text-foreground">What is GPT Image 2.5?</h3><p className="mt-1">GPT Image 2.5 is OpenAI's newer image-generation family. The API includes GPT Image 2.5 Flare and GPT Image 2.5 Sunburst, while ChatGPT uses the ChatGPT Images 2.5 product experience.</p></div>
                  <div><h3 className="font-semibold text-foreground">What is the difference between Flare and Sunburst?</h3><p className="mt-1">Flare is the faster everyday option, while Sunburst is intended for premium visual workflows that benefit from tighter control and more precision.</p></div>
                  <div><h3 className="font-semibold text-foreground">Can I use GPT Image 2.5 online?</h3><p className="mt-1">Yes. You can use the GPT Image 2.5 models available in Auto Seedance directly from this image generator page.</p></div>
                </div>
              </div>
            </div>
          </Card>
        </section>
`;

const faqMarker = '        <div className="mt-10">\n          <Card className="glass border-0 p-6">\n            <div className="flex items-center gap-2 mb-4">\n              <HelpCircle className="size-5 text-primary" />\n              <h2 className="font-display text-xl font-semibold">Frequently Asked Questions</h2>';
if (!source.includes('id="gpt-image-25-heading"')) {
  if (!source.includes(faqMarker)) throw new Error("Could not find visible FAQ marker");
  source = source.replace(faqMarker, `${seoSection}\n${faqMarker}`);
}

source = source.replace(
  "Yes, you start with 50 free credits. Each image costs 5 credits, giving you 10 free images to start. No credit card required. You can purchase more credits or subscribe to a plan for additional generations.",
  "Availability and generation costs depend on the model and your Auto Seedance credit balance. Check the model selector above for the current credit cost before generating.",
);
source = source.replace(
  "Enter a text prompt describing your desired image, choose a style (realistic, anime, 3D, vector, oil painting, watercolor), select resolution (up to 4K), and click Generate. The AI creates your image in seconds using advanced Seedream AI models.",
  "Enter a text prompt, choose the available image options and GPT Image 2.5 model, then click Generate. Auto Seedance sends the request to the selected image-generation model and shows the result in your generation queue.",
);

fs.writeFileSync(file, source);
console.log("GPT Image 2.5 SEO preparation applied to /tools/image");
