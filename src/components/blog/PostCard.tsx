import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { type PostListItem, urlFor, formatReadingTime } from "@/lib/sanity";

const categoryStyles: Record<string, string> = {
  "AI Tutorial": "bg-orange-100 text-orange-700 border-orange-200",
  "Prompt Guide": "bg-blue-100 text-blue-700 border-blue-200",
  "Tool Review": "bg-green-100 text-green-700 border-green-200",
  "Case Study": "bg-purple-100 text-purple-700 border-purple-200",
  News: "bg-pink-100 text-pink-700 border-pink-200",
};

export function categoryBadgeClass(category?: string) {
  if (!category) return "bg-primary/10 text-primary border-primary/20";
  return categoryStyles[category] || "bg-primary/10 text-primary border-primary/20";
}

export function PostCard({ post, priority = false }: { post: PostListItem; priority?: boolean }) {
  const cover = post.mainImage
    ? urlFor(post.mainImage).width(800).height(450).fit("crop").auto("format").url()
    : null;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30">
      <Link to="/blog/$slug" params={{ slug: post.slug.current }} className="block">
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          {cover ? (
            <img
              src={cover}
              alt={post.title}
              width={800}
              height={450}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/10 to-primary/5" />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        {post.category && (
          <span
            className={`self-start inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryBadgeClass(
              post.category,
            )}`}
          >
            {post.category}
          </span>
        )}

        <h3 className="mt-3 font-display text-lg font-bold leading-snug line-clamp-2">
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug.current }}
            className="hover:text-primary"
          >
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {post.author && (
            <span className="inline-flex items-center gap-1">
              <User className="size-3.5" />
              {post.author}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" />
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {formatReadingTime(post.readingMinutes)}
          </span>
        </div>

        <div className="mt-auto pt-5">
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug.current }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:gap-3"
          >
            Read More <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
