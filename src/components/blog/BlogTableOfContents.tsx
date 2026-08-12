import type { PortableTextBlock } from "@portabletext/react";
import { useEffect, useState } from "react";

export function headingId(block: PortableTextBlock) {
  return `section-${block._key}`;
}

function headingText(block: PortableTextBlock) {
  const children = Array.isArray((block as any).children) ? (block as any).children : [];
  return children.map((child: any) => child?.text || "").join("").trim();
}

export function BlogTableOfContents({ value }: { value?: PortableTextBlock[] }) {
  const headings = (value || [])
    .filter((block: any) => ["h2", "h3", "h4"].includes(block.style))
    .map((block) => ({
      id: headingId(block),
      text: headingText(block),
      level: (block as any).style as "h2" | "h3" | "h4",
    }))
    .filter((heading) => heading.text);

  const [activeId, setActiveId] = useState(headings[0]?.id || "");

  useEffect(() => {
    if (!headings.length) return;
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -65% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [value]);

  if (!headings.length) return null;

  return (
    <nav aria-label="Table of contents" className="rounded-2xl border border-border bg-card/70 p-5">
      <h2 className="font-display text-base font-bold">Table of Contents</h2>
      <ol className="mt-4 space-y-1.5 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === "h3" ? "pl-3" : heading.level === "h4" ? "pl-6" : ""}>
            <a
              href={`#${heading.id}`}
              onClick={() => setActiveId(heading.id)}
              className={`block rounded-md px-2 py-1.5 leading-snug transition-colors hover:text-primary ${activeId === heading.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
