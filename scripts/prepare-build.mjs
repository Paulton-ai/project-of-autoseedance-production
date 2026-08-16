import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "src/routes/index.tsx");
let source = await fs.readFile(indexPath, "utf8");

if (!source.includes('from "@/integrations/supabase/client"')) {
  source = source.replace(
    'import { fetchAllPosts, type PostListItem } from "@/lib/sanity";',
    'import { fetchAllPosts, type PostListItem } from "@/lib/sanity";\nimport { supabase } from "@/integrations/supabase/client";'
  );
}

const start = source.indexOf("function PricingPreview() {");
const end = source.indexOf("\nfunction Comparison() {", start);
if (start === -1 || end === -1) throw new Error("PricingPreview boundaries not found");

const replacement = String.raw`function PricingPreview() {
  const fallbackPlans = [
    { name: 'Standard', label: 'For growing output', text: 'More monthly credits plus priority generation and support.', price_monthly: 24.90, monthly_credits: 1600, features: ['1,600 credits/month', 'AI image generation', 'AI video generation', 'Multiple AI models', 'Priority generation', 'No watermark', 'Private generation', 'Priority customer support', 'Commercial Use License'], featured: false },
    { name: 'Pro', label: 'For active creators', text: 'The recommended plan for creators producing content frequently.', price_monthly: 49.90, monthly_credits: 4000, features: ['4,000 credits/month', 'AI image generation', 'AI video generation', 'Multiple AI models', 'Fastest generation speed', 'No watermark', 'Private generation', 'Expert team support', 'Commercial Use License'], featured: true },
    { name: 'Basic', label: 'For regular creators', text: 'A practical credit allowance for creators making content every week.', price_monthly: 7.95, monthly_credits: 500, features: ['500 credits/month', 'AI image generation', 'AI video generation', 'Multiple AI models', 'Standard generation speed', 'No watermark', 'Private generation', 'Customer support', 'Commercial Use License'], featured: false },
  ];

  const { data: plans = fallbackPlans } = useQuery({
    queryKey: ['pricing', 'active-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('name, display_name, price_monthly, monthly_credits, features, is_active, sort_order')
        .eq('is_active', true)
        .neq('name', 'Free');
      if (error) throw error;
      const preferredOrder = ['Standard', 'Pro', 'Basic'];
      return (data ?? [])
        .sort((a, b) => {
          const ai = preferredOrder.indexOf(a.name);
          const bi = preferredOrder.indexOf(b.name);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || (a.sort_order ?? 0) - (b.sort_order ?? 0);
        })
        .slice(0, 3)
        .map((plan) => ({
          name: plan.display_name ?? plan.name,
          label: plan.name === 'Pro' ? 'For active creators' : plan.name === 'Standard' ? 'For growing output' : 'For regular creators',
          text: plan.name === 'Pro' ? 'The recommended plan for creators producing content frequently.' : plan.name === 'Standard' ? 'More monthly credits plus priority generation and support.' : 'A practical credit allowance for creators making content every week.',
          price_monthly: Number(plan.price_monthly ?? 0),
          monthly_credits: Number(plan.monthly_credits ?? 0),
          features: Array.isArray(plan.features) ? plan.features : [],
          featured: plan.name === 'Pro',
        }));
    },
    initialData: fallbackPlans,
    staleTime: 60_000,
  });

  return <section id="pricing" className="border-y border-border bg-gradient-to-r from-[#f3eef8] via-[#faf5f1] to-[#f5edf6] py-24 md:py-28">
    <div className="mx-auto max-w-6xl px-4">
      <SectionIntro eyebrow="Plans for different creation needs" title="Choose the plan that fits your content volume" description="Auto Seedance uses one credit balance across its creation tools. Start with the right plan, then scale when you need more monthly generation capacity." />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {plans.map((plan, i) => <motion.div key={plan.name} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * .07 }} whileHover={{ y: -5 }}>
          <Card className={"relative h-full border-border bg-white/80 p-7 shadow-sm backdrop-blur transition-all " + (plan.featured ? "border-primary/60 ring-2 ring-primary/50 shadow-xl shadow-primary/20 before:absolute before:-inset-px before:-z-10 before:rounded-2xl before:bg-primary/20 before:blur-xl" : "")}>
            {plan.featured && <Badge className="absolute -top-3 left-6 border-0 bg-primary text-primary-foreground shadow-lg shadow-primary/30">Most popular</Badge>}
            <div className="flex items-start justify-between gap-3">
              <div><div className="text-xs font-bold uppercase tracking-[.16em] text-primary">{plan.label}</div><h3 className="mt-2 font-display text-2xl font-bold">{plan.name}</h3></div>
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><CreditCard className="size-5" /></div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{plan.text}</p>
            <div className="mt-5 text-3xl font-display font-bold">\${Number(plan.price_monthly).toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary">{Number(plan.monthly_credits).toLocaleString()} credits/month</div>
            <div className="mt-5 space-y-3">{plan.features.map((point) => <div key={point} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{point}</div>)}</div>
            <Link to="/pricing" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">{plan.featured ? 'Choose Pro' : 'View plan'} <ArrowRight className="size-4" /></Link>
          </Card>
        </motion.div>)}
      </div>
    </div>
  </section>;
}`;

source = source.slice(0, start) + replacement + source.slice(end);
await fs.writeFile(indexPath, source, "utf8");
console.log("✓ Prepared home pricing preview: Standard / Pro / Basic with live Supabase plan sync.");
