import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PortableBody } from "@/components/blog/PortableBody";
import { BlogArticleLeftSidebar, BlogArticleRightSidebar } from "@/components/blog/BlogArticleSidebar";
import {
  fetchPostBySlug,
  fetchRelatedPosts,
  urlFor,
  formatReadingTime,
  type PostDetail,
  type PostListItem,
} from "@/lib/sanity";
import { Twitter, Link2, MessageCircle, Check, User, Calendar, Clock } from "lucide-react";

const SITE_URL = "https://autoseedance.site";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await fetchPostBySlug(params.slug);
    if (!post) throw notFound();
    const relatedPosts = await fetchRelatedPosts(params.slug, post.category);
    return { post, relatedPosts };
  },
  head: ({ loaderData, params }) => {
    const post = loaderData?.post as PostDetail | undefined;
    if (!post) return {};
    const url = `${SITE_URL}/blog/${params.slug}`;
    const title = post.seoTitle || `${post.title} | Auto Seedance Blog`;
    const description = post.seoDescription || post.excerpt || `${post.title} — read on the Auto Seedance blog.`;
    const ogImage = post.mainImage
      ? urlFor(post.mainImage).width(1200).height(630).fit("crop").auto("format").url()
      : `${SITE_URL}/og-image.png`;
    const authorImage = post.authorImage
      ? urlFor(post.authorImage).width(160).height(160).fit("crop").auto("format").url()
      : undefined;
    const dateModified = post.updatedAt || post.publishedAt;

    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 160) },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:site_name", content: "Auto Seedance" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:image", content: ogImage },
        { property: "og:image:alt", content: post.mainImage?.alt || post.title },
        { property: "article:published_time", content: post.publishedAt },
        { property: "article:modified_time", content: dateModified },
        ...(post.author ? [{ property: "article:author", content: post.author }] : []),
        ...(post.category ? [{ property: "article:section", content: post.category }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
        { name: "twitter:image:alt", content: post.mainImage?.alt || post.title },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description,
            image: ogImage,
            datePublished: post.publishedAt,
            dateModified,
            author: post.author
              ? { "@type": "Person", name: post.author, ...(authorImage ? { image: authorImage } : {}) }
              : { "@type": "Organization", name: "Auto Seedance" },
            publisher: { "@type": "Organization", name: "Auto Seedance", logo: { "@type": "ImageObject", url: `${SITE_URL}/android-chrome-512x512.png` } },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            articleSection: post.category,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          }),
        },
        ...(post.faqs && post.faqs.length > 0 ? [{
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: post.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
          }),
        }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Post not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-primary underline">Back to blog</Link>
      </div>
    </div>
  ),
  component: PostPage,
});

function PostPage() {
  const { post: initialPost, relatedPosts: initialRelatedPosts } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { data: post } = useQuery({ queryKey: ["sanity", "post", slug], queryFn: () => fetchPostBySlug(slug), initialData: initialPost, staleTime: 60_000 });
  const active = post ?? initialPost;
  const relatedPosts = initialRelatedPosts as PostListItem[];
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const url = typeof window !== "undefined" ? window.location.href : `${SITE_URL}/blog/${slug}`;
  const shareText = encodeURIComponent(active.title);
  const shareUrl = encodeURIComponent(url);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  const cover = active.mainImage ? urlFor(active.mainImage).width(1600).height(900).fit("crop").auto("format").url() : null;
  const coverAlt = active.mainImage?.alt || active.title;
  const authorImage = active.authorImage ? urlFor(active.authorImage).width(160).height(160).fit("crop").auto("format").url() : null;
  const dateModified = active.updatedAt || active.publishedAt;
  const publishedLabel = new Date(active.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const modifiedLabel = new Date(dateModified).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed top-0 left-0 z-[60] h-[3px] bg-primary transition-[width] duration-150" style={{ width: `${progress}%` }} />
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 lg:grid-cols-[220px_minmax(0,1fr)_280px] lg:items-start lg:gap-8">
          <BlogArticleLeftSidebar body={active.body} />

          <article className="min-w-0 max-w-3xl w-full lg:mx-auto">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li><Link to="/" className="hover:text-foreground hover:underline underline-offset-2">Home</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link to="/blog" className="hover:text-foreground hover:underline underline-offset-2">Blog</Link></li>
                <li aria-hidden="true">/</li>
                <li className="max-w-[18rem] truncate text-foreground" aria-current="page">{active.title}</li>
              </ol>
            </nav>

            {cover && (
              <figure className="aspect-[16/9] overflow-hidden rounded-2xl bg-muted mb-6">
                <img src={cover} alt={coverAlt} width={1600} height={900} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
              </figure>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {active.category && <Link to="/blog" className="inline-block font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md hover:bg-primary/15">{active.category}</Link>}
              <time dateTime={active.publishedAt} className="inline-flex items-center gap-1"><Calendar className="size-3.5" />Published {publishedLabel}</time>
              {dateModified !== active.publishedAt && <time dateTime={dateModified} className="inline-flex items-center gap-1"><Clock className="size-3.5" />Updated {modifiedLabel}</time>}
              <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{formatReadingTime(active.readingMinutes)}</span>
            </div>

            <h1 className="mt-4 font-display text-3xl md:text-5xl font-bold leading-tight tracking-tight">{active.title}</h1>
            {active.excerpt && <p className="mt-4 text-lg text-muted-foreground">{active.excerpt}</p>}

            {active.author && (
              <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  {authorImage ? (
                    <img
                      src={authorImage}
                      alt={`${active.author} profile photo`}
                      width={64}
                      height={64}
                      loading="eager"
                      decoding="async"
                      className="size-16 shrink-0 rounded-full object-cover ring-2 ring-background"
                    />
                  ) : (
                    <div className="size-16 shrink-0 rounded-full btn-gradient grid place-items-center text-white"><User className="size-6" /></div>
                  )}
                  <div className="min-w-0 pt-1">
                    <div className="font-semibold text-base">{active.author}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Author</div>
                    {active.authorBio && (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{active.authorBio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8"><PortableBody value={active.body} /></div>

            {active.faqs && active.faqs.length > 0 && (
              <section className="mt-12" aria-labelledby="faq-heading">
                <h2 id="faq-heading" className="font-display text-2xl font-bold mb-5">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {active.faqs.map((faq, i) => (
                    <details key={faq._key || i} className="group rounded-xl border border-border bg-card p-4">
                      <summary className="cursor-pointer font-semibold list-none flex items-center justify-between"><span>{faq.question}</span><span className="text-primary transition-transform group-open:rotate-45">+</span></summary>
                      <p className="mt-3 text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {relatedPosts.length > 0 && (
              <section className="mt-12 border-t border-border pt-8 lg:hidden" aria-labelledby="related-heading">
                <div className="flex items-end justify-between gap-4 mb-5">
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Keep reading</p><h2 id="related-heading" className="mt-1 font-display text-2xl font-bold">Related Articles</h2></div>
                  <Link to="/blog" className="text-sm text-primary hover:underline underline-offset-2">View all</Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedPosts.map((related) => {
                    const image = related.mainImage ? urlFor(related.mainImage).width(640).height(360).fit("crop").auto("format").url() : null;
                    return (
                      <Link key={related._id} to="/blog/$slug" params={{ slug: related.slug.current }} className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
                        {image && <img src={image} alt={related.mainImage?.alt || related.title} width={640} height={360} loading="lazy" decoding="async" className="aspect-[16/9] w-full object-cover" />}
                        <div className="p-4">
                          {related.category && <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{related.category}</span>}
                          <h3 className="mt-1 font-semibold leading-snug group-hover:text-primary">{related.title}</h3>
                          {related.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{related.excerpt}</p>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <span className="text-sm font-semibold">Share:</span>
              <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"><MessageCircle className="size-4" /> WhatsApp</a>
              <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"><Twitter className="size-4" /> Twitter</a>
              <button onClick={handleCopy} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">{copied ? <Check className="size-4" /> : <Link2 className="size-4" />}{copied ? "Copied!" : "Copy Link"}</button>
            </div>
            <div className="mt-10"><Link to="/blog" className="text-primary underline-offset-2 hover:underline">← Back to all posts</Link></div>
          </article>

          <BlogArticleRightSidebar relatedPosts={relatedPosts} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
