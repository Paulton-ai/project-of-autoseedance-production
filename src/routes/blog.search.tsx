import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PostCard } from "@/components/blog/PostCard";
import { fetchAllPosts } from "@/lib/sanity";

const SITE_URL = "https://autoseedance.site";

export const Route = createFileRoute("/blog/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    search: typeof search.search === "string" ? search.search.trim() : "",
  }),
  loader: async ({ location }) => ({
    posts: await fetchAllPosts(),
    query: new URLSearchParams(location.searchStr).get("search")?.trim() || "",
  }),
  head: () => ({
    meta: [
      { title: "Search Blog | Auto Seedance" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/blog` }],
  }),
  component: BlogSearch,
});

function BlogSearch() {
  const { posts, query } = Route.useLoaderData();
  const normalized = query.toLowerCase();
  const results = normalized
    ? posts.filter((post) =>
        [post.title, post.excerpt, post.category, post.author]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalized)),
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <section className="mx-auto max-w-7xl px-4">
          <Link to="/blog" className="text-sm text-primary hover:underline">← Back to blog</Link>
          <h1 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight">Search the blog</h1>
          <form action="/blog/search" method="get" className="mt-6 flex max-w-2xl gap-2">
            <input name="search" defaultValue={query} placeholder="Search articles..." className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-3 outline-none focus:border-primary" autoFocus />
            <button type="submit" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Search</button>
          </form>

          {query ? (
            <p className="mt-8 text-muted-foreground">{results.length} result{results.length === 1 ? "" : "s"} for <strong className="text-foreground">“{query}”</strong></p>
          ) : (
            <p className="mt-8 text-muted-foreground">Enter a keyword to search all published articles.</p>
          )}

          {results.length > 0 && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((post) => <PostCard key={post._id} post={post} />)}
            </div>
          )}

          {query && results.length === 0 && (
            <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
              <h2 className="font-display text-2xl font-bold">No matching articles</h2>
              <p className="mt-2 text-muted-foreground">Try a broader keyword such as “AI”, “video”, or “prompt”.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
