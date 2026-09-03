import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/react";
import type { ReactNode } from "react";
import { urlFor } from "@/lib/sanity";
import { headingId } from "./BlogTableOfContents";

/**
 * Some existing Sanity posts contain HTML markup as plain text inside a
 * Portable Text paragraph (for example: <div class="cta-banner">...</div>).
 * Render those snippets as real HTML instead of exposing the source code to
 * readers. The sanitizer keeps the supported editorial markup while removing
 * executable or unsafe HTML.
 */
function sanitizeArticleHtml(html: string): string {
  let safe = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|option|link|meta|base)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|option|link|meta|base)[^>]*\/?\s*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:\"[^\"]*\"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(?:src|href)\s*=\s*(?:\"|')\s*(?:javascript:|vbscript:|data:text\/html)[^\"']*(?:\"|')/gi, "")
    .replace(/\s+(?:src|href)\s*=\s*(?:javascript:|vbscript:|data:text\/html)[^\s>]+/gi, "");

  const allowedTags = new Set([
    "a", "abbr", "b", "blockquote", "br", "code", "div", "em", "figcaption",
    "figure", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "li",
    "ol", "p", "pre", "s", "small", "span", "strong", "sub", "sup", "u", "ul",
  ]);

  safe = safe.replace(/<\/?\s*([a-z0-9-]+)([^>]*)>/gi, (full, tagName: string, attrs: string) => {
    const tag = tagName.toLowerCase();
    if (!allowedTags.has(tag)) return "";
    if (full.startsWith("</")) return `</${tag}>`;

    const safeAttrs: string[] = [];
    const attrPattern = /([a-zA-Z_:][a-zA-Z0-9:._-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    let match: RegExpExecArray | null;

    while ((match = attrPattern.exec(attrs)) !== null) {
      const name = match[1].toLowerCase();
      const value = match[2] ?? match[3] ?? match[4] ?? "";

      if (["class", "id", "title", "alt", "width", "height", "loading", "decoding"].includes(name)) {
        safeAttrs.push(`${name}="${escapeHtmlAttribute(value)}"`);
        continue;
      }

      if (name === "href" || name === "src") {
        const normalized = value.trim().toLowerCase();
        if (normalized.startsWith("javascript:") || normalized.startsWith("vbscript:") || normalized.startsWith("data:text/html")) continue;
        safeAttrs.push(`${name}="${escapeHtmlAttribute(value)}"`);
        continue;
      }

      if (name === "target" && (value === "_blank" || value === "_self" || value === "_parent" || value === "_top")) {
        safeAttrs.push(`target="${value}"`);
        continue;
      }

      if (name === "rel") {
        safeAttrs.push(`rel="${escapeHtmlAttribute(value)}"`);
      }
    }

    return `<${tag}${safeAttrs.length ? ` ${safeAttrs.join(" ")}` : ""}>`;
  });

  return safe;
}

function escapeHtmlAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getPlainBlockText(value: PortableTextBlock): string {
  return value.children?.map((child) => child.text || "").join("") || "";
}

/** Decode only the entities commonly introduced when HTML is stored as text. */
function decodeEmbeddedHtml(value: string): string {
  return value
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'");
}

/**
 * Any embedded top-level <div> in article copy is treated as a visual CTA
 * banner. This makes both old posts and newly created posts work without
 * requiring authors to remember a special CSS class.
 */
function promoteDivsToCtaBanners(html: string): string {
  return html.replace(/<div\b([^>]*)>/gi, (full, attrs: string) => {
    if (/\bclass\s*=\s*["'][^"']*\bcta-banner\b[^"']*["']/i.test(attrs)) return full;

    const classMatch = attrs.match(/\bclass\s*=\s*(["'])(.*?)\1/i);
    if (classMatch) {
      const classValue = classMatch[2];
      const updated = attrs.replace(classMatch[0], `class=${classMatch[1]}${classValue} cta-banner${classMatch[1]}`);
      return `<div${updated}>`;
    }

    return `<div class="cta-banner"${attrs}>`;
  });
}

function renderMaybeHtml(value: PortableTextBlock, children: ReactNode) {
  const rawText = getPlainBlockText(value);
  const text = decodeEmbeddedHtml(rawText);

  if (!/<\/?[a-z][^>]*>/i.test(text)) {
    return <p className="mb-5 leading-[1.8] text-[17px]">{children}</p>;
  }

  const html = promoteDivsToCtaBanners(sanitizeArticleHtml(text));
  return <div className="portable-html-block" dangerouslySetInnerHTML={{ __html: html }} />;
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const src = urlFor(value).width(1600).auto("format").url();
      return (
        <figure className="my-6">
          <img
            src={src}
            alt={value.alt || ""}
            width={1600}
            height={900}
            loading="lazy"
            decoding="async"
            className="rounded-xl w-full h-auto"
          />
          {value.alt && (
            <figcaption className="text-center text-xs text-muted-foreground mt-2">
              {value.alt}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({ value, children }) => {
      const href: string = value?.href || "#";
      const isExternal = href.startsWith("http");
      return (
        <a
          href={href}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-primary underline-offset-2 hover:underline"
        >
          {children}
        </a>
      );
    },
    code: ({ children }) => (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
    ),
  },
  block: {
    h1: ({ children, value }) => (
      <h2 id={headingId(value as PortableTextBlock)} className="mt-10 mb-4 font-display text-[36px] font-bold scroll-mt-28">{children}</h2>
    ),
    h2: ({ children, value }) => (
      <h2 id={headingId(value as PortableTextBlock)} className="mt-10 mb-3 font-display text-[28px] font-bold scroll-mt-28">{children}</h2>
    ),
    h3: ({ children, value }) => (
      <h3 id={headingId(value as PortableTextBlock)} className="mt-8 mb-2 font-display text-[22px] font-bold scroll-mt-28">{children}</h3>
    ),
    h4: ({ children, value }) => (
      <h4 id={headingId(value as PortableTextBlock)} className="mt-6 mb-2 font-display text-lg font-bold scroll-mt-28">{children}</h4>
    ),
    normal: ({ children, value }) => renderMaybeHtml(value as PortableTextBlock, children),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary bg-primary/5 pl-4 py-2 my-4 italic text-foreground/90">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-4 ml-6 list-disc space-y-2 leading-[1.8]">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="my-4 ml-6 list-decimal space-y-2 leading-[1.8]">{children}</ol>
    ),
  },
};

export function PortableBody({ value }: { value?: PortableTextBlock[] }) {
  if (!value || value.length === 0) return null;
  return (
    <div className="prose-blog">
      <PortableText value={value} components={components} />
    </div>
  );
}
