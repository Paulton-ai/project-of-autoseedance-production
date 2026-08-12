import type { PortableTextBlock } from "@portabletext/react";
import { Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BlogTableOfContents } from "./BlogTableOfContents";
import { urlFor, type PostListItem } from "@/lib/sanity";

export function BlogArticleLeftSidebar({ body }: { body?: PortableTextBlock[] }) {
  return (
    <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
      <BlogTableOfContents value={body} />
    </aside>
  );
}

export function BlogArticleRightSidebar({ relatedPosts }: { relatedPosts: PostListItem[] }) {
  return (
    <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start space-y-6">
      <form
        role="search"
        action="/blog"
        method="get"
        className="rounded-2xl border border-border bg-card p-4"
      >
        <label htmlFor="blog-sidebar-search" className="text-sm font-semibold">
          Search the blog
        </label>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            id="blog-sidebar-search"
            name="search"
            type="search"
            placeholder="Search articles..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </form>

      {relatedPosts.length > 0 && (
        <section aria-labelledby="sidebar-related-heading" className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Keep reading</p>
          <h2 id="sidebar-related-heading" className="mt-1 font-display text-xl font-bold">Related Articles</h2>
          <div className="mt-4 space-y-4">
            {relatedPosts.slice(0, 5).map((related) => {
              const image = related.mainImage
                ? urlFor(related.mainImage).width(320).height(180).fit("crop").auto("format").url()
                : null;
              return (
                <Link
                  key={related._id}
                  to="/blog/$slug"
                  params={{ slug: related.slug.current }}
                  className="group block"
                >
                  {image && (
                    <img
                      src={image}
                      alt={related.mainImage?.alt || related.title}
                      width={320}
                      height={180}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[16/9] w-full rounded-xl object-cover"
                    />
                  )}
                  <h3 className="mt-2 text-sm font-semibold leading-snug group-hover:text-primary">
                    {related.title}
                  </h3>
                </Link>
              );
            })}
          </div>
          <Link to="/blog" className="mt-4 inline-block text-sm text-primary hover:underline underline-offset-2">
            View all articles →
          </Link>
        </section>
      )}
    </aside>
  );
}
