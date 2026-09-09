import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center grid-bg px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10">
        <h1 className="text-7xl font-display font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That route doesn't exist in the Auto Seedance universe.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white"
          >Try again</button>
          <Link to="/" className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted/50">Go home</Link>
        </div>
      </div>
    </div>
  );
}

const SITE_URL = "https://www.autoseedance.site";
const SITE_TITLE = "Auto Seedance — Free AI Image & Video Generator";
const SITE_DESC = "Create stunning AI images and videos for free. Professional AI generation platform powered by Seedream, Veo 3, Meta AI, and Grok. Start with 30 free credits.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESC },
      { name: "author", content: "Auto Seedance" },
      { name: "theme-color", content: "#0a0a14" },
      { name: "color-scheme", content: "dark" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1" },
      { name: "googlebot", content: "index, follow, max-snippet:-1" },
      { property: "og:site_name", content: "Auto Seedance" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Auto Seedance AI image and video generation platform" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESC },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
      { name: "twitter:image:alt", content: "Auto Seedance AI image and video generation platform" },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "preconnect", href: "https://vcercajwtbjbvjhzivjb.supabase.co" },
      { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
      { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
    ],
    scripts: [
      {
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2817573116229045",
        async: true,
        crossOrigin: "anonymous",
      },
      {
        src: "https://www.googletagmanager.com/gtag/js?id=G-KFFD4XT5W6",
        async: true,
      },
      {
        children: "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-KFFD4XT5W6');",
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Auto Seedance",
          url: SITE_URL,
          description: SITE_DESC,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Auto Seedance",
          url: SITE_URL,
          logo: `${SITE_URL}/android-chrome-512x512.png`,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Auto Seedance",
          applicationCategory: "MultimediaApplication",
          description: "Professional AI image and video generation platform powered by advanced AI models.",
          operatingSystem: "Web Browser",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          url: SITE_URL,
        }),
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function ToolEducation({ path }: { path: string }) {
  if (!path.startsWith("/tools/")) return null;

  const content = path === "/tools/image"
    ? {
        title: "AI Image Generator: how it works, what to create, and how to get better results",
        intro: "Auto Seedance's AI Image Generator turns a written description into a visual asset. It is designed for creators who need thumbnails, social graphics, concept art, product mockups, illustrations, or visual experiments without building a separate image-generation workflow.",
        steps: [
          ["1. Start with a specific prompt", "Describe the subject, setting, composition, mood, lighting, camera perspective, colors, and important objects. A concrete prompt usually gives the model more useful direction than a short phrase."],
          ["2. Choose a visual direction", "Use the available style controls when you want a particular visual language such as realistic photography, illustration, vector art, 3D, anime, oil painting, or watercolor."],
          ["3. Select the output shape", "Choose an aspect ratio or resolution that matches the destination. Portrait images work well for short-form social posts, while landscape formats are useful for video thumbnails and presentations."],
          ["4. Review and iterate", "AI output can contain incorrect text, distorted objects, or details that do not match the prompt. Treat the first generation as a draft, refine the prompt, and review the final image before publishing it."],
        ],
        useCases: "Common uses include YouTube thumbnails, social media posts, advertising concepts, product visuals, storyboards, mood boards, educational illustrations, and creative exploration. If a generated image represents a real person, brand, product, or sensitive subject, review the result carefully and make sure your intended use is lawful and appropriate.",
        faq: [
          ["What is an AI image generator?", "It is a generative AI tool that creates an image from a text description and, where supported, reference inputs. The model interprets the prompt and produces a new visual result."],
          ["How can I get better AI image results?", "Give the model a clear subject, composition, environment, visual style, lighting, and output goal. Then iterate instead of relying on a single short prompt."],
          ["Can I use generated images commercially?", "Your rights and permitted uses depend on the applicable Auto Seedance plan, the model provider's terms, and applicable law. Review the current Terms of Service and the terms of the model used before commercial publication."],
        ],
      }
    : path === "/tools/video"
      ? {
          title: "AI Video Generator: create short clips from text prompts",
          intro: "The Auto Seedance AI Video Generator is built for turning a described scene into a short video clip. It is useful when you need a visual shot for a story, advertisement, explainer, social post, product concept, or larger edited video.",
          steps: [
            ["1. Describe the shot", "Write what should happen in the scene, including the main subject, movement, environment, time of day, camera motion, and visual style. Think of the prompt as directions for a cinematographer."],
            ["2. Choose duration and framing", "Select the available duration, resolution, and aspect ratio for the destination. Vertical framing is useful for Shorts and Reels, while landscape is commonly used for YouTube and presentations."],
            ["3. Add references when appropriate", "Reference images or other supported inputs can help establish appearance, composition, or creative direction. Only upload material you have the right to use."],
            ["4. Inspect the generated clip", "AI video can introduce continuity errors, unwanted motion, incorrect objects, or audio issues. Review every clip before using it in a public or commercial project."],
          ],
          useCases: "Useful applications include social video shots, product demonstrations, advertising concepts, cinematic transitions, educational visuals, story scenes, background footage, and creative prototypes. Generated media should be reviewed for accuracy and rights issues before publication.",
          faq: [
            ["What makes a good text-to-video prompt?", "Describe the subject and action first, then add the environment, camera movement, lighting, visual style, and important constraints. Specific scene direction generally produces more controllable results."],
            ["Which aspect ratio should I choose?", "Use vertical video for Shorts, TikTok, and Reels; landscape for standard YouTube and many presentations; and square when the destination specifically benefits from a 1:1 composition."],
            ["Can AI video be used for commercial work?", "Commercial use depends on your plan, the selected model provider's terms, the rights to any references you provide, and applicable law. Review those terms before publishing paid or branded work."],
          ],
        }
      : {
          title: "AI Reel Studio: from an idea to a structured short-form video",
          intro: "Reel Studio is designed around the complete short-form workflow rather than a single generation step. You provide the idea, choose the creative direction, and work through script, scene generation, voiceover, captions, assembly, and export.",
          steps: [
            ["1. Define the idea and audience", "Start with the topic, story, ad, lesson, or concept you want to communicate. Selecting a niche and audience helps the script stay focused instead of becoming a collection of unrelated scenes."],
            ["2. Review the generated script", "The workflow can turn the idea into scenes and narration. Read the script before generating expensive clips and edit anything that is inaccurate, repetitive, or off-brand."],
            ["3. Generate and review scenes", "Choose a visual style, aspect ratio, and available model. Check each scene for continuity, pacing, characters, text, and visual accuracy before moving to assembly."],
            ["4. Finish the audio and captions", "Voiceover, optional music, and captions can make the final reel easier to follow. Review pronunciation, timing, caption wording, and any claims made in the narration."],
          ],
          useCases: "Reel Studio can support educational shorts, documentary-style explainers, product and social ads, motivational content, entertainment, travel, food, finance, technology, and other short-form formats. It is a production aid, not a replacement for human review or editorial judgment.",
          faq: [
            ["Can Reel Studio make a complete short from one idea?", "The workflow is designed to take an idea through script and scene planning, generation, voiceover, captions, assembly, and export. The exact available steps depend on the current platform features and selected options."],
            ["Can I edit the generated script?", "Yes. Review and adjust the generated scene structure and narration before continuing so the final video reflects your intended message."],
            ["Is AI-generated video ready to publish without review?", "No. Always review the script, visuals, narration, captions, music, and final export for factual accuracy, continuity, copyright, privacy, and other rights issues before publishing."],
          ],
        };

  return (
    <section className="border-t border-border bg-background py-20" aria-labelledby="tool-guide-title">
      <article className="mx-auto max-w-5xl px-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Creator guide</p>
        <h2 id="tool-guide-title" className="mt-2 font-display text-3xl font-bold md:text-4xl">{content.title}</h2>
        <p className="mt-5 max-w-4xl text-base leading-8 text-muted-foreground">{content.intro}</p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {content.steps.map(([heading, text]) => (
            <div key={heading} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-xl font-semibold">{heading}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-2xl font-semibold">Practical use cases</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{content.useCases}</p>
        </div>

        <div className="mt-10">
          <h3 className="font-display text-2xl font-semibold">Frequently asked questions</h3>
          <div className="mt-5 space-y-5">
            {content.faq.map(([question, answer]) => (
              <div key={question} className="rounded-2xl border border-border bg-card p-6">
                <h4 className="font-semibold">{question}</h4>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { location } = useRouter();
  const pathname = location.pathname;
  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
        <head>
          <HeadContent />
        </head>
        <body>
          <Outlet />
          <ToolEducation path={pathname} />
          <Toaster richColors position="top-right" theme="dark" />
        </body>
      </html>
    </QueryClientProvider>
  );
}
