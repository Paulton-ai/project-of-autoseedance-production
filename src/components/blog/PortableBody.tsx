import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/react";
import { urlFor } from "@/lib/sanity";
import { headingId } from "./BlogTableOfContents";

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
    normal: ({ children }) => (
      <p className="mb-5 leading-[1.8] text-[17px]">{children}</p>
    ),
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
