import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PostCard } from "@/components/blog/PostCard";
import { fetchAllPosts } from "@/lib/sanity";
import { Sparkles } from "lucide-react";

const SITE_URL = "https://autoseedance.site";
const BLOG_URL = `${SITE_URL}/blog`;

export const Route = createFileRoute("/blog/")({
  loader: async () => ({ posts: await fetchAllPosts() }),
  head: ({ loaderData }) => {
    const posts = loaderData?.posts || [];
    const itemListElement = posts.slice(0, 50).map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: post.title,
      url: `${BLOG_URL}/${post.slug.current}`,
    }));

    return {
      meta: [
        { title: "Blog — AI Image & Video Generation Tutorials | Auto Seedance" },
        {
          name: "description",
          content:
            "Tutorials, prompt guides, and case studies for AI image and video generation.",
        },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:title", content: "Auto Seedance Blog" },
        { property: "og:description", content: "Tutorials and guides for AI image and video generation." },
        { property: "og:url", content: BLOG_URL },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${SITE_URL}/og-image.png` },
        { property: "og:image:alt", content: "Auto Seedance blog — AI image and video generation tutorials" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Auto Seedance Blog" },
        { name: "twitter:description", content: "Tutorials and guides for AI image and video generation." },
        { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
        { name: "twitter:image:alt", content: "Auto Seedance blog — AI image and video generation tutorials" },
      ],
      links: [{ rel: "canonical", href: BLOG_URL }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Auto Seedance Blog",
            description: "Tutorials, prompt guides, and case studies for AI image and video generation.",
            url: BLOG_URL,
            isPartOf: { "@type": "WebSite", name: "Auto Seedance", url: SITE_URL },
            mainEntity: {
              "@type": "ItemList",
              itemListElement,
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Blog", item: BLOG_URL },
            ],
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

  const topicGroups = (posts || []).reduce<Record<string, typeof posts>>((groups, post) => {
    const topic = post.category?.trim() || "AI Image & Video Generation";
    (groups[topic] ||= []).push(post);
    return groups;
  }, {});

  const topicEntries = Object.entries(topicGroups)
    .map(([topic, topicPosts]) => [topic, topicPosts.slice(0, 6)] as const)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

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

        <section className="mx-auto max-w-7xl px-4 mt-16 pb-12">
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

        {!isLoading && !isError && topicEntries.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pb-24" aria-labelledby="topic-guides-heading">
            <SectionHeading>
              <span id="topic-guides-heading">Explore Guides by Topic</span>
            </SectionHeading>
            <p className="mb-8 max-w-3xl text-muted-foreground">
              Browse related AI image and video generation guides by topic. These curated links connect related articles so readers and search engines can discover the site's deeper content.
            </p>

            <div className="space-y-10">
              {topicEntries.map(([topic, topicPosts]) => (
                <section key={topic} aria-labelledby={`topic-${topic.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}>
                  <h3
                    id={`topic-${topic.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                    className="font-display text-xl md:text-2xl font-bold mb-4"
                  >
                    {topic}
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {topicPosts.map((post) => (
                      <Link
                        key={`${topic}-${post._id}`}
                        to="/blog/$slug"
                        params={{ slug: post.slug.current }}
                        className="group rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                      >
                        <span className="font-semibold leading-snug group-hover:text-primary">
                          {post.title}
                        </span>
                        {post.excerpt && (
                          <span className="mt-2 block text-sm text-muted-foreground line-clamp-2">
                            {post.excerpt}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
