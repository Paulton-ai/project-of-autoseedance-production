import { Link } from "@tanstack/react-router";
import type { Post } from "@/lib/posts";
import { TrendingUp, Flame, Star } from "lucide-react";

const labels = [
  { key: "Trending", icon: Flame },
  { key: "Top Demand", icon: TrendingUp },
  { key: "High Rated", icon: Star },
];

export function BlogTicker({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  // duplicate for seamless loop
  const loop = [...posts, ...posts];
  return (
    <div className="relative overflow-hidden border-y border-border bg-card/40 py-4">
      <div className="flex gap-4 animate-[ticker_60s_linear_infinite] hover:[animation-play-state:paused] w-max">
        {loop.map((p, idx) => {
          const meta = labels[idx % labels.length];
          const Icon = meta.icon;
          return (
            <Link
              key={`${p.slug}-${idx}`}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group flex w-[320px] shrink-0 items-center gap-3 rounded-xl border border-border bg-background p-3 hover:shadow-md transition-shadow"
            >
              <img
                src={p.coverImage}
                alt={p.title}
                loading="lazy"
                className="size-14 rounded-lg object-cover bg-muted"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-primary">
                  <Icon className="size-3" />
                  {meta.key}
                </div>
                <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary">
                  {p.title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
