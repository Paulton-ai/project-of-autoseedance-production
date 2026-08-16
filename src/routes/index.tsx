import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PostCard } from "@/components/blog/PostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight, Check, Clapperboard, Image as ImageIcon, Layers3,
  Play, Rocket, Sparkles, WandSparkles, Video, Volume2, Zap,
} from "lucide-react";
import { fetchAllPosts, type PostListItem } from "@/lib/sanity";

const SITE_URL = "https://autoseedance.site";
const HERO_VIDEO = "https://vcercajwtbjbvjhzivjb.supabase.co/storage/v1/object/sign/uploads/Untitled%20design.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ZTVlNzIxOC0yZGFlLTRhNTEtODRkNS0yN2JjNGI0MzQ5MTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ1cGxvYWRzL1VudGl0bGVkIGRlc2lnbi5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgxOTM1Mzg1LCJleHAiOjIwOTcyOTUzODV9.wKr8TxfhrTfRlUzrE2FAI6K9bmmz-5I-ut6i5qVXWtg";

export const Route = createFileRoute("/")({
  loader: async () => ({ posts: await fetchAllPosts() }),
  component: Landing,
  head: ({ loaderData }) => {
    const posts = (loaderData?.posts || []).slice(0, 6);
    const blogItems = posts.map((post, index) => ({
      "@type": "ListItem", position: index + 1, name: post.title,
      url: `${SITE_URL}/blog/${post.slug.current}`,
    }));
    const faqs = [
      ["What is Auto Seedance?", "Auto Seedance is an AI content creation platform for generating images, videos, and short-form reels in one place. The goal is simple: help creators turn an idea into publish-ready visual content without jumping between a collection of separate tools."],
      ["What can I create with Auto Seedance?", "You can create AI images, AI video clips, and short-form reels. The Reel Studio is designed around a complete creation process: start with an idea, generate a script, create scene clips, add voiceover and captions, assemble the result, and export the finished video."],
      ["How does AI Reel Studio work?", "Describe the reel or longer video you want to make. Choose the niche, length, visual style, aspect ratio, model and voice settings. Auto Seedance can then generate the script and scenes, create clips, add voiceover and captions, assemble the video, and give you a final export."],
      ["Which AI video models can I use?", "The current Reel Studio includes model choices such as Wan, Kling, Veo and Seedance. Model availability can change as providers update their APIs and models."],
      ["Is Auto Seedance free?", "The image generator and other tools can have different access and credit requirements. Reel Studio is a credit-based creation tool, so its full generation pipeline is not presented as an unlimited free service."],
      ["Who is Auto Seedance for?", "It is built for content creators, YouTubers, short-form creators, marketers, educators, small businesses and anyone who needs a faster way to turn ideas into visual content for social platforms."],
    ];
    return {
      meta: [
        { title: "AI Image Generator, AI Video Generator & AI Reel Studio | Auto Seedance" },
        { name: "description", content: "Create AI images, generate AI videos, and turn ideas into finished reels with Auto Seedance. Write an idea, generate scenes, add voiceover and captions, edit, and export social-ready content from one creator platform." },
        { name: "robots", content: "index, follow, max-image-preview:large, max-video-preview:-1" },
        { property: "og:title", content: "Auto Seedance — AI Images, AI Videos & AI Reel Studio" },
        { property: "og:description", content: "One creator platform for AI image generation, AI video generation, and idea-to-reel content creation." },
        { property: "og:url", content: `${SITE_URL}/` },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${SITE_URL}/og-image.png` },
        { property: "og:image:alt", content: "Auto Seedance AI content creation platform" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Auto Seedance — AI Images, Videos & Reels" },
        { name: "twitter:description", content: "Create AI images, AI videos and finished short-form content from one creator platform." },
        { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/` }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Auto Seedance", applicationCategory: "MultimediaApplication", operatingSystem: "Web Browser", url: SITE_URL, description: "AI image, video and short-form content creation tools for creators." }) },
        { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Auto Seedance", url: SITE_URL, description: "AI image generator, AI video generator and AI Reel Studio for content creators." }) },
        { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", name: "Latest Auto Seedance guides", itemListElement: blogItems }) },
        { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }) },
      ],
    };
  },
});

function Landing() {
  const { posts: initialPosts } = Route.useLoaderData();
  const { data: posts = initialPosts } = useQuery({ queryKey: ["sanity", "posts", "home"], queryFn: fetchAllPosts, initialData: initialPosts, staleTime: 60_000 });
  return <div className="min-h-screen bg-gradient-to-b from-[#fbf8f4] via-[#f4f0f8] to-[#faf6f2] text-foreground"><Navbar /><Hero /><ToolOverview /><ReelStory /><HowItWorks /><CreatorOutcomes /><PricingPreview /><Comparison /><BlogSection posts={posts} /><FAQ /><CTA /><Footer /></div>;
}

function Hero() {
  return <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-[#fbf8f4] via-[#f7f1f7] to-[#f3eef8]">
    <div className="pointer-events-none absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
    <div className="mx-auto max-w-6xl px-4 text-center">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
        <Badge variant="outline" className="border-border bg-white/75 backdrop-blur"><Sparkles className="mr-1.5 size-3.5 text-primary" />AI tools for content creators</Badge>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .05 }} className="mx-auto mt-6 max-w-5xl font-display text-5xl font-bold tracking-tight leading-[1.02] md:text-7xl">
        Turn your ideas into <span className="gradient-text">images, videos & reels.</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, delay: .14 }} className="mx-auto mt-6 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
        Auto Seedance is one creator platform for AI image generation, AI video generation, and short-form content creation. Start with an idea, create the visuals, build the video, and export content ready for your social channels.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .22 }} className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/tools/reel-studio"><Button size="lg" className="btn-gradient h-12 border-0 px-7 text-white shadow-lg shadow-primary/20">Create a Reel <ArrowRight className="ml-1.5 size-4" /></Button></Link>
        <Link to="/tools/image"><Button size="lg" variant="outline" className="h-12 bg-white/75 px-7">Generate an Image</Button></Link>
        <Link to="/tools/video"><Button size="lg" variant="outline" className="h-12 bg-white/75 px-7">Generate a Video</Button></Link>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: .985, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .7, delay: .3 }} className="mx-auto mt-14 max-w-5xl">
        <div className="glass glow-purple overflow-hidden rounded-3xl p-2 md:p-3"><div className="relative overflow-hidden rounded-2xl bg-black">
          <video autoPlay loop muted playsInline preload="metadata" className="aspect-video w-full object-cover" src={HERO_VIDEO} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pb-5 pt-20 text-left md:px-7 md:pb-7">
            <div className="flex items-center gap-3 text-sm font-medium text-white"><span className="grid size-9 place-items-center rounded-full bg-white/15 backdrop-blur"><Play className="ml-0.5 size-4 fill-current" /></span>From prompt to publish-ready content.</div>
          </div>
        </div></div>
      </motion.div>
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
        {[['3','core creation tools'],['30 / 60 / 90s','reel lengths'],['4','video model choices in Reel Studio'],['1','place for the creation process']].map(([n,l]) => <div key={l} className="rounded-2xl border border-border bg-white/70 px-3 py-4 backdrop-blur"><div className="font-display text-xl font-bold md:text-2xl">{n}</div><div className="mt-1 text-[11px] leading-4 text-muted-foreground">{l}</div></div>)}
      </div>
    </div>
  </section>;
}

function ToolOverview() {
  const tools = [
    { icon: ImageIcon, label: 'AI IMAGE GENERATOR', title: 'Create original AI images from a prompt.', text: 'Generate visuals for thumbnails, social posts, concepts, illustrations, product ideas and creative experiments without leaving your browser.', href: '/tools/image', action: 'Open Image Generator', stat: 'Text → image' },
    { icon: Video, label: 'AI VIDEO GENERATOR', title: 'Turn a scene idea into an AI video clip.', text: 'Describe the scene you want, choose the available output settings, and generate short visual clips for storytelling, ads, social content and creative development.', href: '/tools/video', action: 'Open Video Generator', stat: 'Text → video' },
    { icon: Clapperboard, label: 'AI REEL STUDIO', title: 'Go from an idea to a finished short.', text: 'Describe the content you want to make, generate a structured script and scenes, create clips, add voiceover and captions, assemble the result and export the finished reel.', href: '/tools/reel-studio', action: 'Open Reel Studio', stat: 'Idea → reel' },
  ];
  return <section id="tools" className="bg-gradient-to-br from-[#fbf8f4] via-[#f4f0f8] to-[#f8eef5] py-24 md:py-28"><div className="mx-auto max-w-6xl px-4"><SectionIntro eyebrow="Three ways to create" title="Pick the tool that matches the job" description="You do not need to learn a complicated production stack. Use a focused generator for a single asset, or use Reel Studio when you want to turn an idea into a complete short-form video." />
    <div className="mt-12 grid gap-5 lg:grid-cols-3">{tools.map((tool, i) => <motion.div key={tool.title} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-70px' }} transition={{ duration: .5, delay: i * .07 }}><Card className="group h-full overflow-hidden border-border/80 bg-white/80 p-0 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl"><div className="relative border-b border-border bg-gradient-to-br from-primary/10 via-white/60 to-secondary/10 p-7"><div className="flex items-center justify-between"><span className="rounded-full border border-border bg-white/80 px-2.5 py-1 text-[10px] font-bold tracking-[.15em] text-muted-foreground">{tool.label}</span><tool.icon className="size-6 text-primary" /></div><div className="mt-10 flex items-end justify-between"><div className="font-display text-4xl font-bold tracking-tight">{tool.stat}</div><div className="size-16 rounded-2xl border border-white/80 bg-white/80 shadow-sm" /></div></div><div className="flex h-full flex-col p-7"><h3 className="font-display text-xl font-bold">{tool.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{tool.text}</p><div className="mt-6 space-y-2 text-sm">{['Fast browser-based creation','Creator-friendly controls','Export and keep your output'].map(x => <div key={x} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{x}</div>)}</div><Link to={tool.href} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">{tool.action}<ArrowRight className="size-4" /></Link></div></Card></motion.div>)}</div>
  </div></section>;
}

function ReelStory() {
  const steps = [
    ['01','Your idea','Write what you want to publish — a topic, story, ad, explainer or short-form concept.'],
    ['02','AI script','The Reel Studio turns the idea into a structured script with scenes and voiceover copy.'],
    ['03','Scene generation','Choose a visual style and model, then generate the scenes that make up the story.'],
    ['04','Voice + captions','Add voiceover, background music and captions using the Reel Studio controls.'],
    ['05','Assembly','Bring the generated scenes together into the finished short-form video.'],
    ['06','Export','Get the final video and take it to YouTube Shorts, TikTok, Instagram, Facebook or your other publishing channels.'],
  ];
  return <section id="reel-studio" className="overflow-hidden border-y border-border bg-gradient-to-r from-[#f8eef5] via-[#f2eef8] to-[#f7f2ea] py-24 md:py-28"><div className="mx-auto max-w-6xl px-4"><div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]"><div><Badge variant="outline" className="bg-white/80"><Clapperboard className="mr-1.5 size-3.5 text-primary" />Idea → finished reel</Badge><h2 className="mt-5 font-display text-4xl font-bold tracking-tight md:text-5xl">Stop starting with a blank timeline.</h2><p className="mt-5 text-base leading-7 text-muted-foreground">Reel Studio is built for the creator who has an idea but does not want to spend hours moving between a script writer, voice tool, image generator, video generator and editor.</p><p className="mt-4 text-base leading-7 text-muted-foreground">Describe the content you want. The creation process can handle the script, scene structure, generated clips, voiceover, captions and final assembly so you can spend more time deciding <em>what</em> to publish.</p><Link to="/tools/reel-studio"><Button className="mt-7 btn-gradient border-0 text-white">Build a reel <ArrowRight className="ml-1.5 size-4" /></Button></Link></div><div className="relative"><div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-2xl"/><div className="relative grid gap-3 sm:grid-cols-2">{steps.map(([num,title,text]) => <motion.div key={num} whileHover={{ y: -4 }} className="rounded-2xl border border-border bg-white/75 p-5 shadow-sm backdrop-blur"><div className="flex items-center justify-between"><span className="font-display text-2xl font-bold text-primary/40">{num}</span><span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary"><Check className="size-4"/></span></div><h3 className="mt-4 font-display font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p></motion.div>)}</div></div></div></div></section>;
}

function HowItWorks() {
  const rows = [['Idea','Topic, story, ad or content concept'],['Script','Structured script and scene plan'],['Visuals','AI-generated scene clips'],['Audio','Voiceover, optional music and captions'],['Edit','Scenes assembled into one finished video'],['Publish','Export and publish on your social channels']];
  return <section className="bg-gradient-to-b from-[#f7f2ea] via-[#f4eef8] to-[#faf6f2] py-24 md:py-28"><div className="mx-auto max-w-6xl px-4"><SectionIntro eyebrow="A simpler production path" title="One idea can become a complete piece of content" description="Auto Seedance is designed around the actual work creators need to get done — not around making you learn another complicated software stack."/><div className="mt-12 overflow-hidden rounded-3xl border border-border bg-white/75 shadow-sm backdrop-blur"><div className="grid md:grid-cols-6">{rows.map(([a,b],i)=><motion.div key={a} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }} transition={{delay:i*.05}} className="relative border-b border-border p-5 last:border-0 md:border-b-0 md:border-r md:last:border-r-0"><div className="text-xs font-bold uppercase tracking-wider text-primary">{String(i+1).padStart(2,'0')}</div><div className="mt-3 font-display font-bold">{a}</div><div className="mt-2 text-xs leading-5 text-muted-foreground">{b}</div></motion.div>)}</div></div><div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">{['YouTube Shorts','TikTok','Instagram Reels','Facebook Reels','Social ads','Explainers','Education','Product content'].map(x=><span key={x} className="rounded-full border border-border bg-white/65 px-3 py-1.5">{x}</span>)}</div></div></section>;
}

function CreatorOutcomes() {
  const items = [
    { icon: Rocket, title: 'Creators', text: 'Turn one idea into consistent short-form content instead of rebuilding the same production process every time.' },
    { icon: Layers3, title: 'Social teams', text: 'Create campaign concepts, visual variations and short videos faster while keeping the process in one browser-based platform.' },
    { icon: WandSparkles, title: 'Marketers', text: 'Move from a product or campaign idea to visual assets and short-form creative without waiting for a full production cycle.' },
    { icon: Volume2, title: 'Educators', text: 'Build explainers and educational videos with a structured script, scenes, voiceover and captions.' },
  ];
  return <section className="bg-gradient-to-br from-[#faf6f2] via-[#f2eef8] to-[#f7edf5] py-24 md:py-28"><div className="mx-auto max-w-6xl px-4"><SectionIntro eyebrow="Built around real content work" title="Less tool switching. More publishing." description="The point is not to replace every creative application. It is to give creators a practical place to handle the most time-consuming parts of AI-assisted content creation."/><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((item,i)=><motion.div key={item.title} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.06}} className="rounded-2xl border border-border bg-white/75 p-6 shadow-sm backdrop-blur"><item.icon className="size-6 text-primary"/><h3 className="mt-5 font-display text-lg font-bold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p></motion.div>)}</div></div></section>;
}

function PricingPreview() {
  const plans = [
    { name: 'Basic', label: 'For regular creators', text: 'A practical starting plan for creators making content every week.', points: ['AI image generation', 'AI video generation', 'Multiple AI models'], featured: false },
    { name: 'Standard', label: 'For growing output', text: 'More room for frequent creation with priority generation and support.', points: ['AI image generation', 'AI video generation', 'Multiple AI models', 'Priority generation'], featured: false },
    { name: 'Pro', label: 'For active creators', text: 'The plan built for creators producing content frequently, including Reel Studio access.', points: ['AI image generation', 'AI video generation', 'Multiple AI models', 'Fastest generation speed', 'Reel Studio access'], featured: true },
  ];
  return <section id="pricing" className="border-y border-border bg-gradient-to-r from-[#f3eef8] via-[#faf5f1] to-[#f5edf6] py-24 md:py-28"><div className="mx-auto max-w-6xl px-4"><SectionIntro eyebrow="Plans for different creation needs" title="Choose the plan that fits your content volume" description="Explore the available creator plans below. Pricing, credit allowances and full plan details are available on the dedicated pricing page."/><div className="mt-12 grid gap-5 md:grid-cols-3">{plans.map((plan, i)=><motion.div key={plan.name} initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-60px'}} transition={{delay:i*.07}} whileHover={{y:-5}}><Card className={`relative h-full border-border bg-white/80 p-7 shadow-sm backdrop-blur ${plan.featured ? 'ring-2 ring-primary/55 shadow-xl shadow-primary/20 before:absolute before:-inset-px before:-z-10 before:rounded-2xl before:bg-primary/15 before:blur-xl' : ''}`}>{plan.featured && <Badge className="absolute -top-3 left-6 border-0 bg-primary text-primary-foreground shadow-lg shadow-primary/30">Most popular</Badge>}<div className="flex items-start justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-[.16em] text-primary">{plan.label}</div><h3 className="mt-2 font-display text-2xl font-bold">{plan.name}</h3></div><div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Sparkles className="size-5"/></div></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{plan.text}</p><div className="mt-5 space-y-3">{plan.points.map(point=><div key={point} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary"/>{point}</div>)}</div><Link to="/pricing" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">View full pricing <ArrowRight className="size-4"/></Link></Card></motion.div>)}</div></div></section>;
}

function Comparison() {
  const rows = [
    ['AI image generation','✓','✓','✓','✓','✓','✓'],
    ['AI video generation','✓','✓','✓','✓','✓','✓'],
    ['Idea → finished short-form video','✓','✓','✓','✓','✓','✓'],
    ['Built-in script + scene process','✓','✓','✓','✓','✓','◐'],
    ['Multiple video model choices','✓','✓','—','✓','✓','—'],
    ['Creator-focused 30/60/90s reel setup','✓','—','—','—','—','—'],
    ['Voiceover + captions in core creation','✓','✓','✓','✓','◐','✓'],
    ['Primary positioning','Images + videos + reels','AI cinema + creation suite','AI video maker','Generative video platform','Social-first AI video','Design + video suite'],
  ];
  const names = ['Auto Seedance','Higgsfield','InVideo','Runway','Pika','Canva'];
  return <section id="compare" className="border-y border-border bg-gradient-to-b from-[#faf5f1] via-[#f3eef8] to-[#f8eef5] py-24 md:py-28"><div className="mx-auto max-w-6xl px-4"><SectionIntro eyebrow="Know your options" title="How Auto Seedance fits into the AI video landscape" description="There are excellent AI creation products already. Auto Seedance is positioned around a simple creator problem: images, video clips and a practical idea-to-reel process in one place. Feature availability changes frequently, so this is a high-level product comparison rather than a claim that one platform is best for every use case."/><div className="mt-12 overflow-x-auto rounded-3xl border border-border bg-white/75 shadow-sm backdrop-blur"><table className="min-w-[980px] w-full border-collapse text-left text-sm"><thead><tr className="border-b border-border bg-muted/40"><th className="p-4 font-display font-bold">Capability</th>{names.map((n,i)=><th key={n} className={`p-4 font-display font-bold ${i===0?'text-primary':''}`}>{n}</th>)}</tr></thead><tbody>{rows.map((row)=><tr key={row[0]} className="border-b border-border last:border-0"><td className="p-4 font-semibold text-muted-foreground">{row[0]}</td>{row.slice(1).map((v,j)=><td key={j} className={`p-4 ${j===0?'font-semibold text-primary':''}`}>{v}</td>)}</tr>)}</tbody></table></div><p className="mt-4 text-xs text-muted-foreground">Comparison is intentionally high-level and should be checked against each provider's current product pages before making purchasing decisions.</p></div></section>;
}

function BlogSection({ posts }: { posts: PostListItem[] }) {
  const visible = posts.slice(0, 6);
  return <section id="guides" className="bg-gradient-to-br from-[#f8eef5] via-[#f7f2ea] to-[#f1eef8] py-24 md:py-28"><div className="mx-auto max-w-6xl px-4"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><Badge variant="outline" className="bg-white/80"><Sparkles className="mr-1.5 size-3.5 text-primary"/>AI creator guides</Badge><h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">Learn what to create next.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Explore practical guides, AI tool explainers, prompt ideas and creator-focused tutorials from the Auto Seedance blog.</p></div><Link to="/blog"><Button variant="outline">View all guides <ArrowRight className="ml-1.5 size-4"/></Button></Link></div>{visible.length ? <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{visible.map((post,i)=><motion.div key={post._id || post.slug.current} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.05}}><PostCard post={post} priority={i<3}/></motion.div>)}</div> : <div className="mt-10 rounded-2xl border border-border bg-white/70 p-8 text-sm text-muted-foreground">New creator guides will appear here as they are published in Sanity.</div>}</div></section>;
}

function FAQ() {
  const items = [
    ['What is Auto Seedance?','Auto Seedance is an AI content creation platform focused on images, videos and short-form reels. It gives creators focused tools for generating visual assets and building social-ready content from ideas.'],
    ['Can I make a complete reel from an idea?','Yes. Reel Studio is designed for that use case: start with an idea, generate a structured script and scenes, create the scene clips, add voiceover and captions, assemble the video and export the result.'],
    ['What can I use the AI image generator for?','Use it for social graphics, thumbnails, visual concepts, illustrations, product ideas, creative references and other image-generation tasks.'],
    ['What can I use the AI video generator for?','Use it for short AI video clips, visual storytelling, creative tests, social content, ads, b-roll concepts and scene development.'],
    ['Can I choose different video models?','Reel Studio currently exposes model choices including Wan, Kling, Veo and Seedance. Availability may change as providers update their models and APIs.'],
    ['Do I need video-editing experience?','The tools are designed to keep the creation process approachable. Reel Studio provides controls for script, scenes, voiceover, captions, model, style and final assembly so you can focus on the content idea.'],
  ];
  return <section className="bg-gradient-to-b from-[#f1eef8] to-[#faf6f2] py-24 md:py-28"><div className="mx-auto max-w-4xl px-4"><SectionIntro eyebrow="Questions creators ask" title="Everything you need to know before creating"/><Accordion type="single" collapsible className="mt-10">{items.map(([q,a],i)=><AccordionItem key={q} value={`item-${i}`}><AccordionTrigger className="text-left font-display font-semibold">{q}</AccordionTrigger><AccordionContent className="leading-7 text-muted-foreground">{a}</AccordionContent></AccordionItem>)}</Accordion></div></section>;
}

function CTA() { return <section className="bg-gradient-to-b from-[#faf6f2] to-[#f4eef8] px-4 pb-20 md:pb-28"><div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-primary/10 via-white/70 to-secondary/10 p-8 text-center shadow-sm backdrop-blur md:p-14"><div className="mx-auto max-w-3xl"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg"><Zap className="size-6"/></div><h2 className="mt-6 font-display text-4xl font-bold tracking-tight md:text-5xl">Have an idea? Make something from it.</h2><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Create an image, generate a video, or turn your next idea into a reel. Start with the tool that fits your content and build from there.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/tools/reel-studio"><Button size="lg" className="btn-gradient border-0 text-white">Create a Reel <ArrowRight className="ml-1.5 size-4"/></Button></Link><Link to="/tools/image"><Button size="lg" variant="outline">Explore AI Image Generator</Button></Link></div></div></div></section>; }

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) { return <div className="mx-auto max-w-3xl text-center"><Badge variant="outline" className="bg-white/75">{eyebrow}</Badge><h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">{title}</h2>{description && <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">{description}</p>}</div>; }
