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
const SITE_TITLE = "Auto Seedance â€” Free AI Image & Video Generator";
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
      { property: "og:p¥µ…”éİ¥‘Ñ ˆ°½¹Ñ•¹Ğè€ˆÄÈÀÀˆô°(€€€€€ìÁÉ½Á•ÉÑäè€‰½œé¥µ…”é¡•¥¡Ğˆ°½¹Ñ•¹Ğè€ˆØÌÀˆô°(€€€€€ìÁÉ½Á•ÉÑäè€‰½œé¥µ…”é…±Ğˆ°½¹Ñ•¹Ğè€‰ÕÑ¼M••‘…¹”$¥µ…”…¹Ù¥‘•¼•¹•É…Ñ¥½¸Á±…Ñ™½É´ˆô°(€€€€€ìÁÉ½Á•ÉÑäè€‰½œé±½…±”ˆ°½¹Ñ•¹Ğè€‰•¹}ULˆô°(€€€€€ì¹…µ”è€‰Ñİ¥ÑÑ•Èé…Éˆ°½¹Ñ•¹Ğè€‰ÍÕµµ…Éå}±…É•}¥µ…”ˆô°(€€€€€ì¹…µ”è€‰Ñİ¥ÑÑ•ÈéÑ¥Ñ±”ˆ°½¹Ñ•¹ĞèM%Q}Q%Q1ô°(€€€€€ì¹…µ”è€‰Ñİ¥ÑÑ•Èé‘•ÍÉ¥ÁÑ¥½¸ˆ°½¹Ñ•¹ĞèM%Q}Mô°(€€€€€ì¹…µ”è€‰Ñİ¥ÑÑ•Èé¥µ…”ˆ°½¹Ñ•¹Ğè€‘íM%Q}UI1ô½½œµ¥µ…”¹Á¹€ô°(€€€€€ì¹…µ”è€‰Ñİ¥ÑÑ•Èé¥µ…”é…±Ğˆ°½¹Ñ•¹Ğè€‰ÕÑ¼M••‘…¹”$¥µ…”…¹Ù¥‘•¼•¹•É…Ñ¥½¸Á±…Ñ™½É´ˆô°(€€€t°(€€€±¥¹­Ìèl(€€€€€ìÉ•°è€‰¥½¸ˆ°¡É•˜è€ˆ½™…Ù¥½¸¹¥¼ˆô°(€€€€€ìÉ•°è€‰…ÁÁ±”µÑ½Õ µ¥½¸ˆ°¡É•˜è€ˆ½…ÁÁ±”µÑ½Õ µ¥½¸¹Á¹œˆô°(€€€€€ìÉ•°è€‰µ…¹¥™•ÍĞˆ°¡É•˜è€ˆ½Í¥Ñ”¹İ•‰µ…¹¥™•ÍĞˆô°(€€€€€ìÉ•°è€‰ÁÉ•½¹¹•Ğˆ°¡É•˜è€‰¡ÑÑÁÌè¼½™½¹ÑÌ¹½½±•…Á¥Ì¹½´ˆô°(€€€€€ìÉ•°è€‰ÁÉ•½¹¹•Ğˆ°¡É•˜è€‰¡ÑÑÁÌè¼½™½¹ÑÌ¹ÍÑ…Ñ¥Œ¹½´ˆ°É½ÍÍ=É¥¥¸è€ˆˆô°(€€€€€ìÉ•°è€‰ÁÉ•½¹¹•Ğˆ°¡É•˜è€‰¡ÑÑÁÌè¼½Ù•É…©İÑ‰©‰Ù©¡é¥Ù©ˆ¹ÍÕÁ…‰…Í”¹¼ˆô°(€€€€€ìÉ•°è€‰‘¹ÌµÁÉ•™•Ñ ˆ°¡É•˜è€‰¡ÑÑÁÌè¼½™½¹ÑÌ¹½½±•…Á¥Ì¹½´ˆô°(€€€€€ìÉ•°è€‰‘¹ÌµÁÉ•™•Ñ ˆ°¡É•˜è€‰¡ÑÑÁÌè¼½™½¹ÑÌ¹ÍÑ…Ñ¥Œ¹½´ˆô°(€€€t°(€€€ÍÉ¥ÁÑÌèl(€€€€€ì(€€€€€€€ÍÉŒè€‰¡ÑÑÁÌè¼½Á…•…È¹½½±•Íå¹‘¥…Ñ¥½¸¹½´½Á…•…½©Ì½…‘Í‰å½½±”¹©Ìı±¥•¹Ğõ„µÁÕˆ´ÈàÄÜÔÜÌÄÄØÈÈäÀĞÔˆ°(€€€€€€€…Íå¹ŒèÑÉÕ”°(€€€€€€€É½ÍÍ=É¥¥¸è€‰…¹½¹åµ½ÕÌˆ°(€€€€€ô°(€€€€€ì(€€€€€€€ÍÉŒè€‰¡ÑÑÁÌè¼½İİÜ¹½½±•Ñ…µ…¹…•È¹½´½Ñ…œ½©Ìı¥õµ-ÑaPÕ\Øˆ°(€€€€€€€…Íå¹ŒèÑÉÕ”°(€€€€€ô°(€€€€€ì(€€€€€€€¡¥±‘É•¸è€‰İ¥¹‘½Ü¹‘…Ñ…1…å•È€ôİ¥¹‘½Ü¹‘…Ñ…1…å•Èñğmtì™Õ¹Ñ¥½¸Ñ…œ ¥í‘…Ñ…1…å•È¹ÁÕÍ ¡…ÉÕµ•¹ÑÌ¤íôÑ…œ ©Ìœ°¹•Ü…Ñ” ¤¤ìÑ…œ ½¹™¥œœ°€µ-ÑaPÕ\Øœ¤ìˆ°(€€€€€ô°(€€€€€ì(€€€€€€€ÑåÁ”è€‰…ÁÁ±¥…Ñ¥½¸½±­©Í½¸ˆ°(€€€€€€€¡¥±‘É•¸è)M=8¹ÍÑÉ¥¹¥™ä¡ì(€€€€€€€€€€‰½¹Ñ•áĞˆè€‰¡ÑÑÁÌè¼½Í¡•µ„¹½Éœˆ°(€€€€€€€€€€‰ÑåÁ”ˆè€‰]•‰M¥Ñ”ˆ°(€€€€€€€€€¹…µ”è€‰ÕÑ¼M••‘…¹”ˆ°(€€€€€€€€€ÕÉ°èM%Q}UI0°(€€€€€€€€€‘•ÍÉ¥ÁÑ¥½¸èM%Q}M°(€€€€€€€ô¤°(€€€€€ô°(€€€€€ì(€€€€€€€ÑåÁ”è€‰…ÁÁ±¥…Ñ¥½¸½±­©Í½¸ˆ°(€€€€€€€¡¥±‘É•¸è)M=8¹ÍÑÉ¥¹¥™ä¡ì(€€€€€€€€€€‰½¹Ñ•áĞˆè€‰¡ÑÑÁÌè¼½Í¡•µ„¹½Éœˆ°(€€€€€€€€€€‰ÑåÁ”ˆè€‰=É…¹¥é…Ñ¥½¸ˆ°(€€€€€€€€€¹…µ”è€‰ÕÑ¼M••‘…¹”ˆ°(€€€€€€€€€ÕÉ°èM%Q}UI0°(€€€€€€€€€±½¼è€‘íM%Q}UI1ô½…¹‘É½¥µ¡É½µ”´ÔÄÉàÔÄÈ¹Á¹€°(€€€€€€€ô¤°(€€€€€ô°(€€€€€ì(€€€€€€€ÑåÁ”è€‰…ÁÁ±¥…Ñ¥½¸½±­©Í½¸ˆ°(€€€€€€€¡¥±‘É•¸è)M=8¹ÍÑÉ¥¹¥™ä¡ì(€€€€€€€€€€‰½¹Ñ•áĞˆè€‰¡ÑÑÁÌè¼½Í¡•µ„¹½Éœˆ°(€€€€€€€€€€‰ÑåÁ”ˆè€‰M½™Ñİ…É•ÁÁ±¥…Ñ¥½¸ˆ°(€€€€€€€€€¹…µ”è€‰ÕÑ¼M••‘…¹”ˆ°(€€€€€€€€€…ÁÁ±¥…Ñ¥½¹…Ñ•½Éäè€‰5Õ±Ñ¥µ•‘¥…ÁÁ±¥…Ñ¥½¸ˆ°(€€€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰AÉ½™•ÍÍ¥½¹…°$¥µ…”…¹Ù¥‘•¼•¹•É…Ñ¥½¸Á±…Ñ™½É´Á½İ•É•‰ä…‘Ù…¹•$µ½‘•±Ì¸ˆ°(€€€€€€€€€½Á•É…Ñ¥¹MåÍÑ•´è€‰]•ˆ	É½İÍ•Èˆ°(€€€€€€€€€½™™•ÉÌèì€‰ÑåÁ”ˆè€‰=™™•Èˆ°ÁÉ¥”è€ˆÀˆ°ÁÉ¥•ÕÉÉ•¹äè€‰UMˆô°(€€€€€€€€€ÕÉ°èM%Q}UI0°(€€€€€€€ô¤°(€€€€€ô°(€€€t°(€ô¤°(€½µÁ½¹•¹ĞèI½½Ñ½µÁ½¹•¹Ğ°(€¹½Ñ½Õ¹‘½µÁ½¹•¹Ğè9½Ñ½Õ¹‘½µÁ½¹•¹Ğ°(€•ÉÉ½É½µÁ½¹•¹ĞèÉÉ½É½µÁ½¹•¹Ğ°)ô¤ì()™Õ¹Ñ¥½¸Q½½±‘Õ…Ñ¥½¸¡ìÁ…Ñ ôèìÁ…Ñ èÍÑÉ¥¹œô¤ì(€¥˜€ …Á…Ñ ¹ÍÑ…ÉÑÍ]¥Ñ  ˆ½Ñ½½±Ì¼ˆ¤¤É•ÑÕÉ¸¹Õ±°ì((€½¹ÍĞ½¹Ñ•¹Ğ€ôÁ…Ñ €ôôô€ˆ½Ñ½½±Ì½¥µ…”ˆ(€€€€üì(€€€€€€€Ñ¥Ñ±”è€‰$%µ…”•¹•É…Ñ½Èè¡½Ü¥Ğİ½É­Ì°İ¡…ĞÑ¼É•…Ñ”°…¹¡½ÜÑ¼•Ğ‰•ÑÑ•ÈÉ•ÍÕ±ÑÌˆ°(€€€€€€€¥¹ÑÉ¼è€‰ÕÑ¼M••‘…¹”Ì$%µ…”•¹•É…Ñ½ÈÑÕÉ¹Ì„İÉ¥ÑÑ•¸‘•ÍÉ¥ÁÑ¥½¸¥¹Ñ¼„Ù¥ÍÕ…°…ÍÍ•Ğ¸%Ğ¥Ì‘•Í¥¹•™½ÈÉ•…Ñ½ÉÌİ¡¼¹••Ñ¡Õµ‰¹…¥±Ì°Í½¥…°É…Á¡¥Ì°½¹•ÁĞ…ÉĞ°ÁÉ½‘ÕĞµ½­ÕÁÌ°¥±±ÕÍÑÉ…Ñ¥½¹Ì°½ÈÙ¥ÍÕ…°•áÁ•É¥µ•¹ÑÌİ¥Ñ¡½ÕĞ‰Õ¥±‘¥¹œ„Í•Á…É…Ñ”¥µ…”µ•¹•É…Ñ¥½¸İ½É­™±½Ü¸ˆ°(€€€€€€€ÍÑ•ÁÌèl(€€€€€€€€€lˆÄ¸MÑ…ÉĞİ¥Ñ „ÍÁ•¥™¥ŒÁÉ½µÁĞˆ°€‰•ÍÉ¥‰”Ñ¡”ÍÕ‰©•Ğ°Í•ÑÑ¥¹œ°½µÁ½Í¥Ñ¥½¸°µ½½°±¥¡Ñ¥¹œ°…µ•É„Á•ÉÍÁ•Ñ¥Ù”°½±½ÉÌ°…¹¥µÁ½ÉÑ…¹Ğ½‰©•ÑÌ¸½¹É•Ñ”ÁÉ½µÁĞÕÍÕ…±±ä¥Ù•ÌÑ¡”µ½‘•°µ½É”ÕÍ•™Õ°‘¥É•Ñ¥½¸Ñ¡…¸„Í¡½ÉĞÁ¡É…Í”¸‰t°(€€€€€€€€€lˆÈ¸¡½½Í”„Ù¥ÍÕ…°‘¥É•Ñ¥½¸ˆ°€‰UÍ”Ñ¡”…Ù…¥±…‰±”ÍÑå±”½¹ÑÉ½±Ìİ¡•¸å½Ôİ…¹Ğ„Á…ÉÑ¥Õ±…ÈÙ¥ÍÕ…°±…¹Õ…”ÍÕ …ÌÉ•…±¥ÍÑ¥ŒÁ¡½Ñ½É…Á¡ä°¥±±ÕÍÑÉ…Ñ¥½¸°Ù•Ñ½È…ÉĞ°€Í°…¹¥µ”°½¥°Á…¥¹Ñ¥¹œ°½Èİ…Ñ•É½±½È¸‰t°(€€€€€€€€€lˆÌ¸M•±•ĞÑ¡”½ÕÑÁÕĞÍ¡…Á”ˆ°€‰¡½½Í”…¸…ÍÁ•ĞÉ…Ñ¥¼½ÈÉ•Í½±ÕÑ¥½¸Ñ¡…Ğµ…Ñ¡•ÌÑ¡”‘•ÍÑ¥¹…Ñ¥½¸¸A½ÉÑÉ…¥Ğ¥µ…•Ìİ½É¬İ•±°™½ÈÍ¡½ÉĞµ™½É´Í½¥…°Á½ÍÑÌ°İ¡¥±”±…¹‘Í…Á”™½Éµ…ÑÌ…É”ÕÍ•™Õ°™½ÈÙ¥‘•¼Ñ¡Õµ‰¹…¥±Ì…¹ÁÉ•Í•¹Ñ…Ñ¥½¹Ì¸‰t°(€€€€€€€€€lˆĞ¸I•Ù¥•Ü…¹¥Ñ•É…Ñ”ˆ°€‰$½ÕÑÁÕĞ…¸½¹Ñ…¥¸¥¹½ÉÉ•ĞÑ•áĞ°‘¥ÍÑ½ÉÑ•½‰©•ÑÌ°½È‘•Ñ…¥±ÌÑ¡…Ğ‘¼¹½Ğµ…Ñ Ñ¡”ÁÉ½µÁĞ¸QÉ•…ĞÑ¡”™¥ÉÍĞ•¹•É…Ñ¥½¸…Ì„‘É…™Ğ°É•™¥¹”Ñ¡”ÁÉ½µÁĞ°…¹É•Ù¥•ÜÑ¡”™¥¹…°¥µ…”‰•™½É”ÁÕ‰±¥Í¡¥¹œ¥Ğ¸‰t°(€€€€€€€t°(€€€€€€€ÕÍ•…Í•Ìè€‰½µµ½¸ÕÍ•Ì¥¹±Õ‘”e½ÕQÕ‰”Ñ¡Õµ‰¹ÃÙdît.", faq: [],
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
