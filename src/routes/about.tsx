import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Sparkles, Image as ImageIcon, Video, Film, Users, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Us | Auto Seedance" },
      { name: "description", content: "Learn about Auto Seedance, our AI-powered creative platform, our mission, and the three-person team building tools for image, video, and reel creation." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "About Us | Auto Seedance" },
      { property: "og:description", content: "Learn about Auto Seedance and the team building practical AI creative tools for creators." },
      { property: "og:url", content: "https://autoseedance.site/about" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/about" }],
  }),
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-36 pb-24">
        <section className="mx-auto max-w-5xl px-4 text-center">
          <div className="mx-auto size-14 rounded-2xl btn-gradient grid place-items-center">
            <Sparkles className="size-7 text-white" />
          </div>
          <p className="mt-6 text-sm font-medium text-primary">ABOUT AUTO SEEDANCE</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl font-bold tracking-tight">
            Making AI content creation <span className="gradient-text">simpler.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-8">
            Auto Seedance is an AI-powered creative platform built to help creators turn ideas into images, videos, and short-form reels without needing a complicated production workflow.
          </p>
        </section>

        <section className="mx-auto mt-20 max-w-5xl px-4 grid md:grid-cols-2 gap-8">
          <div className="glass rounded-2xl p-7">
            <h2 className="font-display text-2xl font-semibold">What we do</h2>
            <p className="mt-4 text-muted-foreground leading-7">
              Auto Seedance brings AI-powered creative tools into one workspace. Depending on the features available on the platform, users can generate images, create video clips, build short-form reels, and develop visual content from text prompts and other creative inputs.
            </p>
            <p className="mt-4 text-muted-foreground leading-7">
              Our goal is practical: reduce the time and technical effort needed to move from an idea to a usable piece of digital content.
            </p>
          </div>
          <div className="glass rounded-2xl p-7">
            <h2 className="font-display text-2xl font-semibold">Our mission</h2>
            <p className="mt-4 text-muted-foreground leading-7">
              We believe powerful creative technology should be easier to use. We are building Auto Seedance around a straightforward experience where creators can experiment with AI, iterate quickly, and spend more time developing ideas instead of managing complicated tools.
            </p>
            <p className="mt-4 text-muted-foreground leading-7">
              We also aim to be transparent about the limits of AI. Generated results can be imperfect, so we encourage users to review their outputs before publishing or relying on them.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-5xl px-4">
          <div className="text-center">
            <p className="text-sm font-medium text-primary">OUR TOOLS</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Built for modern creators</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Auto Seedance focuses on accessible creative workflows for people making content for social media, marketing, projects, and other digital channels.</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-border bg-card p-6">
              <ImageIcon className="size-6 text-primary" />
              <h3 className="mt-4 font-semibold">AI Image Generation</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-6">Create visual concepts and images from text-based creative directions.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <Video className="size-6 text-primary" />
              <h3 className="mt-4 font-semibold">AI Video Generation</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-6">Turn creative ideas into AI-generated video clips for different projects.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <Film className="size-6 text-primary" />
              <h3 className="mt-4 font-semibold">Reel Studio</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-6">Create short-form content designed for fast-moving social platforms.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-5xl px-4">
          <div className="rounded-3xl border border-border bg-card/60 p-8 md:p-10">
            <div className="flex items-center gap-3">
              <Users className="size-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">The team behind Auto Seedance</h2>
            </div>
            <p className="mt-4 max-w-3xl text-muted-foreground leading-7">
              Auto Seedance is a small, hands-on project built and maintained by a three-person team. Each team member contributes to the work involved in developing, improving, and maintaining the platform.
            </p>
            <div className="mt-8 grid md:grid-cols-3 gap-5">
              <div className="rounded-2xl border border-border p-6">
                <h3 className="font-semibold text-lg">Umer Khan</h3>
                <p className="mt-2 text-sm text-muted-foreground">Team member contributing to the development and ongoing work behind Auto Seedance.</p>
              </div>
              <div className="rounded-2xl border border-border p-6">
                <h3 className="font-semibold text-lg">Anthony Rushby</h3>
                <p className="mt-2 text-sm text-muted-foreground">Team member contributing to the development and ongoing work behind Auto Seedance.</p>
              </div>
              <div className="rounded-2xl border border-border p-6">
                <h3 className="font-semibold text-lg">Paul Bowers</h3>
                <p className="mt-2 text-sm text-muted-foreground">Team member contributing to the development and ongoing work behind Auto Seedance.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-5xl px-4 grid md:grid-cols-2 gap-8">
          <div className="glass rounded-2xl p-7">
            <ShieldCheck className="size-6 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-semibold">Responsible use</h2>
            <p className="mt-3 text-muted-foreground leading-7">
              We expect users to use Auto Seedance responsibly and respect applicable laws, intellectual property rights, privacy, and the rights of other people. Users are responsible for reviewing AI-generated content and ensuring that their intended use is appropriate.
            </p>
          </div>
          <div className="glass rounded-2xl p-7">
            <h2 className="font-display text-2xl font-semibold">Questions or feedback?</h2>
            <p className="mt-3 text-muted-foreground leading-7">
              We welcome questions and feedback about Auto Seedance. Visit our Contact page to get in touch with the team.
            </p>
            <a href="/contact" className="inline-flex mt-5 text-sm font-medium text-primary hover:underline">Contact Auto Seedance →</a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
