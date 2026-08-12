import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PortableBody } from "@/components/blog/PortableBody";
import {
  fetchPostBySlug,
  urlFor,
  formatReadingTime,
  type PostDetail,
} from "@/lib/sanity";
import { Twitter, Link2, MessageCircle, Check, User, Calendar, Clock } from "lucide-react";

const SITE_URL = "https://autoseedance.site";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await fetchPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    const post = loaderData?.post as PostDetail | undefined;
    if (!post) return {};

    const url = `${SITE_URL}/blog/${params.slug}`;
    const title = post.seoTitle || `${post.title} | Auto Seedance Blog`;
    const description =
      post.seoDescription ||
      post.excerpt ||
      `${post.title} — read on the Auto Seedance blog.`;
    const ogImage = post.mainImage
      ? urlFor(post.mainImage).width(1200).height(630).fit("crop").auto("format").url()
      : `${SITE_URL}/og-image.png`;
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
              ? { "@type": "Person", name: post.author }
              : { "@type": "Organization", name: "Auto Seedance" },
            publisher: {
              "@type": "Organization",
              name: "Auto Seedance",
              logo: { "@type": "ImageObject", url: `${SITE_URL}/android-chrome-512x512.png` },
            },
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
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: `${SITE_URL}/blog`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: url,
              },
            ],
          }),
        },
        ...(post.faqs && post.faqs.length > 0
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: post.faqs.map((f) => ({
                    "@type": "Question",
                    name: f.question,
                    acceptedAnswer: { "@type": "Answer", text: f.answer },
                  })),
                }),
              },
            ]
          : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Post not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-primary underline">
          Back to blog
        </Link>
      </div>
    </div>
  ),
  component: PostPage,
});

function PostPage() {
  const { post: initialPost } = Route.useLoaderData();
  const { slug } = Route.useParams();

  const { data: post } = useQuery({
    queryKey: ["sanity", "post", slug],
    queryFn: () => fetchPostBySlug(slug),
    initialData: initialPost,
    staleTime: 60_000,
  });

  const active = post ?? initialPost;
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (scrolled / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const url =
    typeof window !== "undefined" ? window.location.href : `${SITE_URL}/blog/${slug}`;
  const shareText = encodeURIComponent(active.title);
  const shareUrl = encodeURIComponent(url);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const cover = active.mainImage
    ? urlFor(active.mainImage).width(1600).height(900).fit("crop").auto("format").url()
    : null;
  const coverAlt = active.mainImage?.alt || active.title;
  const dateModified = active.updatedAt || active.publishedAt;
  const publishedLabel = new Date(active.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const modifiedLabel = new Date(dateModified).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div
        className="fixed top-0 left-0 z-[60] h-[3px] bg-primary transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <article className="mx-auto max-w-3xl px-4">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/" className="hover:text-foreground hover:underline underline-offset-2">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to="/blog" className="hover:text-foreground hover:underline underline-offset-2">
                  Blog
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="max-w-[18rem] truncate text-foreground" aria-current="page">
                {active.title}
              </li>
            </ol>
          </nav>

          {cover && (
            <figure className="aspect-[16/9] overflow-hidden rounded-2xl bg-muted mb-6">
              <img src={cover} alt={coverAlt} className="h-full w-full object-cover" />
            </figure>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {active.category && (
              <Link
                to="/blog"
                className="inline-block font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md hover:bg-primary/15"
              >
                {active.category}
              </Link>
            )}
            <time dateTime={active.publishedAt} className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              Published {publishedLabel}
            </time>
            {dateModified !== active.publishedAt && (
              <time dateTime={dateModified} className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                Updated {modifiedLabel}
              </time>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatReadingTime(active.readingMinutes)}
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl md:text-5xl font-bold leading-tight tracking-tight">
            {active.title}
          </h1>

          {active.excerpt && (
            <p className="mt-4 text-lg text-muted-foreground">{active.excerpt}</p>
          )}

          {active.author && (
            <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
              <div className="size-10 rounded-full btn-gradient grid place-items-center text-white">
                <User className="size-5" />
              </div>
              <div>
                <div className="font-semibold">{active.author}</div>
                <div className="text-xs text-muted-foreground">Author</div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <PortableBody value={active.body} />
          </div>

          {active.faqs && active.faqs.length > 0 && (
            <section className="mt-12" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="font-display text-2xl font-bold mb-5">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {active.faqs.map((faq, i) => (
                  <details
                    key={faq._key || i}
                    className="group rounded-xl border border-border bg-card p-4"
                  >
                    <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
                      <span>{faq.question}</span>
                      <span className="text-primary transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <span className="text-sm font-semibold">Share:</span>
            <a
              href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              <Twitter className="size-4" /> Twitter
            </a>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>

          <div className="mt-10">
            <Link to="/blog" className="text-primary underline-offset-2 hover:underline">
              ← Back to all posts
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
