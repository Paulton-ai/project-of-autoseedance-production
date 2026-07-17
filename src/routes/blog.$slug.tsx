import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { AdSlot } from "@/components/blog/AdSlot";
import { PostCard } from "@/components/blog/PostCard";
import {
  getPostBySlug,
  getRecentPosts,
  getRelatedPosts,
  getAllPosts,
  type Post,
} from "@/lib/posts";
import { Twitter, Link2, Search, MessageCircle, Check, ChevronDown, List } from "lucide-react";

const SITE_URL = "https://autoseedance.site";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    const post = loaderData?.post;
    if (!post) return {};
    const url = `${SITE_URL}/blog/${params.slug}`;
    const ogImage = post.coverImage.startsWith("http") ? post.coverImage : `${SITE_URL}${post.coverImage}`;
    const titleWithKeywords = `${post.title} — AI Generation Guide | Auto Seedance Blog`;
    return {
      meta: [
        { title: titleWithKeywords },
        { name: "description", content: post.excerpt.length > 160 ? post.excerpt.slice(0, 157) + "..." : post.excerpt },
        { name: "keywords", content: [...post.tags, "AI tutorial", "AI generation", "AI guide"].join(", ") },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:image", content: ogImage },
        { property: "og:image:alt", content: post.title },
        { property: "article:published_time", content: post.date },
        { property: "article:modified_time", content: post.date },
        { property: "article:author", content: post.author.name },
        { property: "article:section", content: post.category },
        { property: "article:tag", content: post.tags.join(", ") },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@AutoSeedance" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.excerpt },
        { name: "twitter:image", content: ogImage },
        { name: "twitter:image:alt", content: post.title },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            image: ogImage,
            datePublished: post.date,
            dateModified: post.date,
            author: { "@type": "Person", name: post.author.name, url: `${SITE_URL}/blog` },
            publisher: {
              "@type": "Organization",
              name: "Auto Seedance",
              logo: { "@type": "ImageObject", url: `${SITE_URL}/android-chrome-512x512.png` },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            articleSection: post.category,
            keywords: post.tags.join(", "),
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

interface Heading {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function extractHeadings(md: string): Heading[] {
  const headings: Heading[] = [];
  const lines = md.split("\n");
  let inCode = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) { inCode = !inCode; continue; }
    if (inCode) continue;
    const m = line.match(/^(##|###)\s+(.+)$/);
    if (m) {
      const text = m[2].trim();
      headings.push({ level: m[1].length, text, id: slugify(text) });
    }
  }
  return headings;
}

function PostPage() {
  const { post } = Route.useLoaderData();
  const recent = getRecentPosts(5).filter((p) => p.slug !== post.slug).slice(0, 5);
  const related = getRelatedPosts(post.slug, post.category, 3);
  const headings = extractHeadings(post.content);

  // Reading progress bar
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const handleTocClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
    setMobileTocOpen(false);
  };

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (scrolled / max) * 100 : 0);

      // active heading
      let current = "";
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (el && el.getBoundingClientRect().top < 120) {
          current = heading.id;
        }
      }
      setActiveId(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  const url = typeof window !== "undefined" ? window.location.href : `${SITE_URL}/blog/${post.slug}`;
  const shareText = encodeURIComponent(post.title);
  const shareUrl = encodeURIComponent(url);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {/* noop */}
  };

  const filteredRecent = search
    ? getAllPosts().filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 5)
    : recent;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 z-[60] h-[3px] bg-primary transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-[220px_1fr_280px] gap-8">
          {/* LEFT: TOC (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                <List className="size-3.5" /> On this page
              </h4>
              <nav className="space-y-1 text-sm border-l border-border">
                {headings.length === 0 && (
                  <span className="block pl-3 text-muted-foreground text-xs">No sections</span>
                )}
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={(e) => handleTocClick(e, h.id)}
                    className={`block py-1 border-l-2 -ml-px transition-colors ${
                      activeId === h.id
                        ? "border-primary text-primary font-semibold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    } ${h.level === 3 ? "pl-6 text-xs" : "pl-3"}`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>


          {/* CENTER: Article */}
          <article className="min-w-0">
            {/* Mobile TOC (collapsible) */}
            {headings.length > 0 && (
              <div className="lg:hidden mb-4 rounded-xl border border-border bg-card">
                <button
                  onClick={() => setMobileTocOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
                  aria-expanded={mobileTocOpen}
                >
                  <span className="inline-flex items-center gap-2">
                    <List className="size-4 text-primary" /> Contents
                  </span>
                  <ChevronDown className={`size-4 transition-transform ${mobileTocOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileTocOpen && (
                  <nav className="px-4 pb-3 space-y-1 text-sm border-t border-border pt-3">
                    {headings.map((h) => (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        onClick={(e) => handleTocClick(e, h.id)}
                        className={`block py-1 ${h.level === 3 ? "pl-4 text-xs" : ""} ${
                          activeId === h.id ? "text-primary font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                )}
              </div>
            )}

            <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-muted mb-6">
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-full w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
                {post.category}
              </span>
              <span>·</span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </time>
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>

            <h1 className="mt-4 font-display text-3xl md:text-5xl font-bold leading-tight tracking-tight">
              {post.title}
            </h1>

            {/* Author card */}
            <div className="mt-6 flex items-center gap-4 p-4 rounded-2xl border border-border bg-card">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="size-12 rounded-full bg-muted object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{post.author.name}</div>
                <div className="text-xs text-muted-foreground truncate">{post.author.bio}</div>
              </div>
            </div>

            {/* ADSENSE SLOT: leaderboard above content */}
            <AdSlot format="leaderboard" />

            {/* MDX/Markdown body */}
            <div className="prose-blog mt-6">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                  rehypeSlug,
                  [rehypeAutolinkHeadings, { behavior: "wrap" }],
                  rehypeHighlight,
                ]}
                components={{
                  a: ({ href, children, ...props }) => {
                    const isExternal = href?.startsWith("http");
                    return (
                      <a
                        href={href}
                        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="text-primary underline-offset-2 hover:underline"
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  },
                  img: ({ src, alt }) => (
                    <figure className="my-6">
                      <img src={src as string} alt={alt || ""} loading="lazy" className="rounded-xl w-full" />
                      {alt && <figcaption className="text-center text-xs text-muted-foreground mt-2">{alt}</figcaption>}
                    </figure>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary bg-primary/5 pl-4 py-2 my-4 italic text-foreground/90">
                      {children}
                    </blockquote>
                  ),
                  p: ({ children }) => <p className="mb-5 leading-[1.8] text-[17px]">{children}</p>,
                  h1: ({ children, ...props }) => <h1 {...props} className="mt-10 mb-4 font-display text-[36px] font-bold scroll-mt-28">{children}</h1>,
                  h2: ({ children, ...props }) => <h2 {...props} className="mt-10 mb-3 font-display text-[28px] font-bold scroll-mt-28">{children}</h2>,
                  h3: ({ children, ...props }) => <h3 {...props} className="mt-8 mb-2 font-display text-[22px] font-bold scroll-mt-28">{children}</h3>,
                  ul: ({ children }) => <ul className="my-4 ml-6 list-disc space-y-2 leading-[1.8]">{children}</ul>,
                  ol: ({ children }) => <ol className="my-4 ml-6 list-decimal space-y-2 leading-[1.8]">{children}</ol>,
                  code: ({ className, children, ...props }) => {
                    const isBlock = className?.includes("language-");
                    if (isBlock) return <code className={className} {...props}>{children}</code>;
                    return (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="my-5 overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 text-sm">{children}</pre>
                  ),
                  hr: () => <hr className="my-8 border-border" />,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* ADSENSE SLOT: in-article (after content) */}
            <AdSlot format="in-article" />

            {/* Share */}
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
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

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Related posts */}
            {related.length > 0 && (
              <section className="mt-12">
                <h2 className="font-display text-2xl font-bold mb-5">Related Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {related.map((p, i) => (
                    <div key={p.slug}>
                      <PostCard post={p} />
                      {/* ADSENSE SLOT: between related cards */}
                      {i === 1 && <AdSlot format="inline" className="md:hidden" />}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Giscus comments */}
            <section className="mt-12">
              <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2 border-l-4 border-primary pl-3">
                <span aria-hidden>💬</span> Comments
              </h2>
              <GiscusComments slug={post.slug} />
            </section>
          </article>

          {/* RIGHT sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                  {search ? "Results" : "Recent Posts"}
                </h4>
                <ul className="space-y-3">
                  {filteredRecent.map((p) => (
                    <li key={p.slug}>
                      <Link to="/blog/$slug" params={{ slug: p.slug }} className="group flex gap-3">
                        <img
                          src={p.coverImage}
                          alt={p.title}
                          loading="lazy"
                          className="size-14 rounded-md object-cover bg-muted shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary">{p.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                  {filteredRecent.length === 0 && (
                    <li className="text-xs text-muted-foreground">No matches</li>
                  )}
                </ul>
              </div>

              {/* ADSENSE SLOT: right sidebar rectangle */}
              <AdSlot format="rectangle" />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function GiscusComments({ slug }: { slug: string }) {
  useEffect(() => {
    const container = document.getElementById("giscus-container");
    if (!container) return;
    container.innerHTML = "";
    const isDark =
      document.documentElement.classList.contains("dark") ||
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    // Setup Giscus: go to giscus.app, connect your GitHub repo,
    // copy your config and replace the values below.
    s.setAttribute("data-repo", "YOUR_GITHUB_USERNAME/YOUR_REPO_NAME");
    s.setAttribute("data-repo-id", "YOUR_REPO_ID");
    s.setAttribute("data-category", "General");
    s.setAttribute("data-category-id", "YOUR_CATEGORY_ID");
    s.setAttribute("data-mapping", "pathname");
    s.setAttribute("data-term", slug);
    s.setAttribute("data-strict", "0");
    s.setAttribute("data-reactions-enabled", "1");
    s.setAttribute("data-emit-metadata", "0");
    s.setAttribute("data-input-position", "bottom");
    s.setAttribute("data-theme", isDark ? "dark" : "light");
    s.setAttribute("data-lang", "en");
    container.appendChild(s);
  }, [slug]);
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div id="giscus-container" />
      <p className="text-xs text-muted-foreground mt-3">
        Comments powered by Giscus. Configure your repo in <code>src/routes/blog.$slug.tsx</code>.
      </p>
    </div>
  );
}

