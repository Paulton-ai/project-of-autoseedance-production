import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center grid-bg px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10">
        <h1 className="text-7xl font-display font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That route doesn't exist in the Auto Seedance universe.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white"
          >Try again</button>
          <Link to="/" className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted/50">Go home</Link>
        </div>
      </div>
    </div>
  );
}

const SITE_URL = "https://autoseedance.site";
const SITE_TITLE = "Auto Seedance — Free AI Image & Video Generator";
const SITE_DESC = "Create stunning AI images and videos for free. Professional AI generation platform powered by Seedream, Veo 3, Meta AI, and Grok. Start with 50 free credits.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESC },
      { name: "author", content: "Auto Seedance" },
      { name: "theme-color", content: "#0a0a14" },
      { name: "color-scheme", content: "dark" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1" },
      { name: "googlebot", content: "index, follow, max-snippet:-1" },
      { property: "og:site_name", content: "Auto Seedance" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Auto Seedance AI image and video generation platform" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESC },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
      { name: "twitter:image:alt", content: "Auto Seedance AI image and video generation platform" },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "stylesheet", href: "/assets/app.css" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "preconnect", href: "https://vcercajwtbjbvjhzivjb.supabase.co" },
      { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
      { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Auto Seedance",
          url: SITE_URL,
          description: SITE_DESC,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Auto Seedance",
          url: SITE_URL,
          logo: `${SITE_URL}/android-chrome-512x512.png`,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Auto Seedance",
          applicationCategory: "MultimediaApplication",
          description: "Professional AI image and video generation platform powered by advanced AI models.",
          operatingSystem: "Web Browser",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          url: SITE_URL,
        }),
      },
      { type: "module", src: `/entry-client.js?v=${__APP_BUILD_ID__}` },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
        <head>
          <HeadContent />
        </head>
        <body>
          <Outlet />
          <Toaster richColors position="top-right" theme="dark" />
        </body>
      </html>
    </QueryClientProvider>
  );
}
