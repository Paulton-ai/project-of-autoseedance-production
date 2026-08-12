import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PostCard } from "@/components/blog/PostCard";
import { fetchAllPosts } from "@/lib/sanity";
import { Sparkles } from "lucide-react";

const SITE_URL = "https://autoseedance.site";

export const Route = createFileRoute("/blog/")({
  loader: async () => ({ posts: await fetchAllPosts() }),
  head: ({ loaderData }) => {
    const posts = loaderData?.posts ?? [];
    const itemList = posts.slice(0, 20).map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: post.title,
      url: `${SITE_URL}/blog/${post.slug.current}`,
    }));

    return {
      meta: [
        { title: "Blog — AI Image & Video Generation Tutorials | Auto Seedance" },
        {
          name: "description",
          content:
            "Tutorials, prompt guides, and tool reviews for AI image and video generation.",
        },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:title", content: "Auto Seedance Blog" },
        { property: "og:description", content: "Tutorials and guides for AI image and video generation." },
        { property: "og:url", content: `${SITE_URL}/blog` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/blog` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Auto Seedance Blog",
            description: "Tutorials, prompt guides, and tool reviews for AI image and video generation.",
            url: `${SITE_URL}/blog`,
            isPartOf: {
              "@type": "WebSite",
              name: "Auto Seedance",
              url: SITE_URL,
            },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: itemList,
            },
          }),
        },
      ],
    };
  },
  component: BlogIndex,
});

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight border-l-4 border-primary pl-4 mb-8">
      {children}
    </h2>
  );
}

function BlogIndex() {
  const { posts: initialPosts } = Route.useLoaderData();
  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ["sanity", "posts", "list"],
    queryFn: fetchAllPosts,
    initialData: initialPosts,
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-28">
        <section className="mx-auto max-w-7xl px-4 mb-10">
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
            The <span className="gradient-text">Auto Seedance</span> Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Tutorials, prompt guides, and case studies for bulk AI image and video generation.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-4 mt-16 pb-24">
          <SectionHeading>Latest Posts</SectionHeading>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[420px] rounded-2xl border border-border bg-card animate-pulse"
                />
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center text-muted-foreground py-20">
              Unable to load posts right now. Please try again shortly.
            </div>
          )}

          {!isLoading && !isError && (!posts || posts.length === 0) && (
            <div className="mx-auto max-w-xl text-center py-20 rounded-2xl border border-dashed border-border bg-card/40">
              <div className="mx-auto size-14 rounded-2xl btn-gradient grid place-items-center mb-5">
                <Sparkles className="size-6 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold">Coming Soon</h3>
              <p className="mt-3 text-muted-foreground">
                We're crafting in-depth guides on AI image and video generation. Check back soon.
              </p>
            </div>
          )}

          {!isLoading && !isError && posts && posts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
