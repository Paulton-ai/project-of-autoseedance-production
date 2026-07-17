import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { BlogTicker } from "@/components/blog/BlogTicker";
import { PostCard } from "@/components/blog/PostCard";
import { getAllPosts, getTrendingPosts } from "@/lib/posts";
import { AdSlot } from "@/components/blog/AdSlot";

const SITE_URL = "https://autoseedance.site";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — AI Image & Video Generation Tutorials | Auto Seedance" },
      {
        name: "description",
        content:
          "Learn AI image and video generation with tutorials, prompt guides, tool reviews, and case studies. Master Seedream AI, Veo 3, Meta AI, Grok AI, and more. Tips for creating stunning AI visuals.",
      },
      { name: "keywords", content: "AI tutorials, AI prompt guides, Seedream tutorial, Veo 3 guide, AI generation tips, prompt engineering, AI image tips, AI video tips, Meta AI, Grok AI" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:title", content: "Auto Seedance Blog — AI Image & Video Tutorials" },
      { property: "og:description", content: "Tutorials, prompt guides, and tool reviews for AI image and video generation. Learn to create stunning visuals with AI." },
      { property: "og:url", content: `${SITE_URL}/blog` },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Auto Seedance Blog — AI Tutorials & Guides" },
      { name: "twitter:description", content: "Tutorials, prompt guides, and tool reviews for AI generation." },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/blog` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Auto Seedance Blog",
          description: "Tutorials, prompt guides, and case studies for AI image and video generation.",
          url: `${SITE_URL}/blog`,
          publisher: {
            "@type": "Organization",
            name: "Auto Seedance",
            logo: { "@type": "ImageObject", url: `${SITE_URL}/android-chrome-512x512.png` },
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
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          ],
        }),
      },
    ],
  }),
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
  const posts = getAllPosts();
  const trending = getTrendingPosts(6);
  const topRated = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);

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

        <BlogTicker posts={trending} />

        <section className="mx-auto max-w-7xl px-4 mt-12">
          <AdSlot format="leaderboard" />
        </section>

        {topRated.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 mt-16">
            <SectionHeading>Top Rated</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {topRated.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-4 mt-20 pb-24">
          <SectionHeading>Latest Posts</SectionHeading>
          {posts.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">
              No posts yet. Add markdown files to <code>/content/posts/</code> or use the{" "}
              <Link to="/" className="text-primary underline">
                CMS
              </Link>
              .
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
