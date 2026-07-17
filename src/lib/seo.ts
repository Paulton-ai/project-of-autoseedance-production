export const SITE_URL = "https://autoseedance.site";
export const SITE_NAME = "Auto Seedance";
export const SITE_TAGLINE = "AI Image & Video Generation Platform";
export const DEFAULT_OG_IMAGE = "https://autoseedance.site/og-image.png";
export const LOGO_URL = "https://autoseedance.site/android-chrome-512x512.png";

export const KEYWORDS = {
  primary: [
    "AI Image Generator",
    "AI Video Generator",
    "Free AI Image Generator",
    "AI Art Generator",
    "AI Photo Generator",
    "AI Video Creator",
    "AI Video Maker",
    "AI Image Generator Free",
    "AI Video Generator Free",
  ],
  aiModels: [
    "Seedream AI",
    "ByteDance Seedream",
    "Veo 3",
    "Google Veo",
    "Meta AI",
    "Grok AI",
    "Higgsfield AI",
  ],
  tools: [
    "AI Image Editor",
    "AI Image Upscaler",
    "AI Video Generator Online",
    "text to image",
    "text to video",
  ],
  longTail: [
    "free AI image generator online",
    "best AI video generator",
    "AI image generation tool",
    "AI video creation platform",
    "create AI images free",
    "AI video maker online",
  ],
};

export const ALL_KEYWORDS = [
  ...KEYWORDS.primary,
  ...KEYWORDS.aiModels,
  ...KEYWORDS.tools,
  ...KEYWORDS.longTail,
];

export interface PageSEO {
  title: string;
  description: string;
  keywords?: string[];
  canonical: string;
  ogImage?: string;
  ogType?: "website" | "article";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
  };
  noIndex?: boolean;
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqSchema?: Array<{ question: string; answer: string }>;
}

export function generateTitle(title: string, includeSiteName = true): string {
  if (includeSiteName) {
    return `${title} — ${SITE_NAME}`;
  }
  return title;
}

export function generateMetaDescription(description: string, maxLength = 160): string {
  if (description.length <= maxLength) return description;
  return description.slice(0, maxLength - 3) + "...";
}

export function generateKeywords(customKeywords: string[]): string {
  return [...new Set([...customKeywords, ...KEYWORDS.primary.slice(0, 3)])].join(", ");
}

export function generateCanonicalUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    description: "Professional AI image and video generation platform powered by advanced AI models.",
    sameAs: [],
  };
}

export function generateSoftwareAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "MultimediaApplication",
    description: "Professional AI image and video generation platform. Create stunning visuals with Seedream and Seedance AI.",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: SITE_URL,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
  };
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  };
}

export function generateServiceSchema(service: {
  name: string;
  description: string;
  url: string;
  price?: number;
  priceCurrency?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: service.url,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      price: service.price || 0,
      priceCurrency: service.priceCurrency || "USD",
    },
  };
}

export const PAGE_SEO_CONFIG: Record<string, PageSEO> = {
  "/": {
    title: generateTitle("AI Image & Video Generation Platform"),
    description: generateMetaDescription(
      "Create stunning AI images and videos with Auto Seedance. Free AI image generator and video generator powered by Seedream, Veo 3, Meta AI, and Grok. Start with 50 free credits."
    ),
    keywords: [...KEYWORDS.primary, ...KEYWORDS.aiModels],
    canonical: SITE_URL,
    breadcrumbs: [{ name: "Home", url: "/" }],
    faqSchema: [
      { question: "What is Auto Seedance?", answer: "Auto Seedance is a free AI image and video generation platform that lets you create professional visuals using advanced AI models like Seedream, Veo 3, and more." },
      { question: "Is the AI image generator free?", answer: "Yes, you start with 50 free credits. Generate AI images and videos without any credit card required." },
      { question: "What AI models are available?", answer: "Auto Seedance supports Seedream for image generation, Veo 3 for video, and integration with Meta AI and Grok AI models." },
    ],
  },
  "/tools/image": {
    title: generateTitle("Free AI Image Generator — Create AI Art Online"),
    description: generateMetaDescription(
      "Generate stunning AI images free with Auto Seedance. Text to image AI generator with realistic, anime, 3D, and artistic styles. 2K-4K resolution output. 5 credits per image."
    ),
    keywords: ["AI Image Generator", "Free AI Image Generator", "AI Art Generator", "AI Photo Generator", "text to image", "Seedream AI"],
    canonical: `${SITE_URL}/tools/image`,
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Tools", url: "/tools" },
      { name: "Image Generator", url: "/tools/image" },
    ],
    faqSchema: [
      { question: "How does AI image generation work?", answer: "Enter a text prompt describing your desired image, choose a style and resolution, and our AI creates high-quality images in seconds." },
      { question: "What image sizes are available?", answer: "We offer Auto 2K, Auto 4K, Square HD, Landscape (4:3), and Portrait (4:3) resolutions." },
      { question: "Can I use reference images?", answer: "Yes, upload up to 10 reference images to guide the AI's style and composition for your generated images." },
    ],
  },
  "/tools/video": {
    title: generateTitle("Free AI Video Generator — Create AI Videos Online"),
    description: generateMetaDescription(
      "Generate cinematic AI videos free with Auto Seedance. Text to video AI generator with 720p-1080p resolution, AI audio, and multiple aspect ratios. 30 credits per video."
    ),
    keywords: ["AI Video Generator", "Free AI Video Generator", "AI Video Creator", "AI Video Maker", "text to video", "Veo 3", "Google Veo"],
    canonical: `${SITE_URL}/tools/video`,
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Tools", url: "/tools" },
      { name: "Video Generator", url: "/tools/video" },
    ],
    faqSchema: [
      { question: "How does AI video generation work?", answer: "Describe your scene with a text prompt, set duration (1-10s), resolution, and aspect ratio. The AI creates a cinematic video in 2-3 minutes." },
      { question: "Can I add audio to my videos?", answer: "Yes, we offer AI-generated background audio that matches your video's mood and content automatically." },
      { question: "What video resolutions are supported?", answer: "We support 720p HD and 1080p Full HD resolutions in 16:9, 9:16 (shorts), and 1:1 (square) aspect ratios." },
    ],
  },
  "/pricing": {
    title: generateTitle("Pricing — Free AI Image & Video Generation Credits"),
    description: generateMetaDescription(
      "Simple credit-based pricing for AI image and video generation. Start free with 50 credits. Image generation 5 credits, video generation 30 credits. No subscription required."
    ),
    keywords: ["AI image generator pricing", "AI video generator cost", "free AI credits", "credit-based AI generation"],
    canonical: `${SITE_URL}/pricing`,
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Pricing", url: "/pricing" },
    ],
  },
  "/blog": {
    title: generateTitle("Blog — AI Image & Video Tutorials and Guides"),
    description: generateMetaDescription(
      "Learn AI image and video generation with tutorials, prompt guides, tool reviews, and case studies. Master Seedream, Veo 3, Meta AI, and Grok AI tools."
    ),
    keywords: ["AI tutorials", "AI prompt guides", "AI generation tips", "Seedream tutorial", "Veo 3 guide"],
    canonical: `${SITE_URL}/blog`,
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
    ],
  },
  "/contact": {
    title: generateTitle("Contact Us — Support and Partnership Inquiries"),
    description: generateMetaDescription(
      "Get in touch with the Auto Seedance team for support, feedback, bug reports, or partnership inquiries. We respond within 24 hours."
    ),
    keywords: ["contact Auto Seedance", "AI generation support", "AI tool feedback"],
    canonical: `${SITE_URL}/contact`,
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Contact", url: "/contact" },
    ],
  },
  "/privacy": {
    title: generateTitle("Privacy Policy"),
    description: generateMetaDescription(
      "Auto Seedance privacy policy: We never sell your data, collect passwords, or share personal information. Learn how we protect your privacy."
    ),
    keywords: ["Auto Seedance privacy", "data protection", "AI privacy policy"],
    canonical: `${SITE_URL}/privacy`,
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Privacy Policy", url: "/privacy" },
    ],
  },
  "/terms": {
    title: generateTitle("Terms of Service"),
    description: generateMetaDescription(
      "Auto Seedance terms of service: Fair usage policies, account responsibilities, and legal terms for our AI image and video generation platform."
    ),
    keywords: ["Auto Seedance terms", "terms of service", "AI platform terms"],
    canonical: `${SITE_URL}/terms`,
    ogType: "website",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Terms of Service", url: "/terms" },
    ],
  },
  "/login": {
    title: generateTitle("Login — Access Your AI Generation Dashboard"),
    description: generateMetaDescription(
      "Login to your Auto Seedance account to access AI image and video generation tools, view your creation history, and manage credits."
    ),
    keywords: ["Auto Seedance login", "AI tool login", "account access"],
    canonical: `${SITE_URL}/login`,
    ogType: "website",
    noIndex: true,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Login", url: "/login" },
    ],
  },
  "/signup": {
    title: generateTitle("Sign Up — Free AI Image & Video Generation"),
    description: generateMetaDescription(
      "Create your free Auto Seedance account. Get 50 free credits to start generating AI images and videos. No credit card required."
    ),
    keywords: ["Auto Seedance signup", "free AI account", "AI generation registration"],
    canonical: `${SITE_URL}/signup`,
    ogType: "website",
    noIndex: true,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Sign Up", url: "/signup" },
    ],
  },
};

export function getPageSEO(path: string): PageSEO | undefined {
  return PAGE_SEO_CONFIG[path];
}
