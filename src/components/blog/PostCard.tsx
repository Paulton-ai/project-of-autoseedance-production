import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Clock, MessageCircle } from "lucide-react";
import type { Post } from "@/lib/posts";

const categoryStyles: Record<string, string> = {
  "AI Tutorial": "bg-orange-100 text-orange-700 border-orange-200",
  "Prompt Guide": "bg-blue-100 text-blue-700 border-blue-200",
  "Tool Review": "bg-green-100 text-green-700 border-green-200",
  "Case Study": "bg-purple-100 text-purple-700 border-purple-200",
  News: "bg-pink-100 text-pink-700 border-pink-200",
};

export function categoryBadgeClass(category: string) {
  return (
    categoryStyles[category] ||
    "bg-primary/10 text-primary border-primary/20"
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30">
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
            }}
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryBadgeClass(
              post.category
            )}`}
          >
            {post.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="size-3.5" /> 0
          </span>
        </div>

        <h3 className="mt-3 font-display text-lg font-bold leading-snug line-clamp-2">
          <Link to="/blog/$slug" params={{ slug: post.slug }} className="hover:text-primary">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>

        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="size-8 rounded-full bg-muted object-cover ring-2 ring-background"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
            }}
          />
          <div className="font-medium text-foreground">{post.author.name}</div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" />
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {post.readingTime}
          </span>
        </div>

        <div className="mt-auto pt-5">
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:gap-3"
          >
            Read More <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
