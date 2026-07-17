function readingTimeFn(text: string): { text: string } {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return { text: `${minutes} min read` };
}

export interface PostAuthor {
  name: string;
  avatar: string;
  bio: string;
}

export interface PostFrontmatter {
  title: string;
  date: string;
  category: string;
  coverImage: string;
  excerpt: string;
  tags: string[];
  author: PostAuthor;
  views: number;
  featured: boolean;
  trending: boolean;
}

export interface Post extends PostFrontmatter {
  slug: string;
  content: string;
  readingTime: string;
}

// Eagerly load all markdown files as raw strings at build time
const modules = import.meta.glob("/content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// Tiny YAML-ish parser tailored to our known frontmatter schema
function parseFrontmatter(raw: string): { data: PostFrontmatter; content: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("Missing frontmatter");
  }
  const [, fmBlock, content] = match;

  const data: Record<string, unknown> = {};
  const lines = fmBlock.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const indent = line.length - line.trimStart().length;
    if (indent > 0) { i++; continue; } // handled by parent

    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!kv) { i++; continue; }
    const [, key, rawVal] = kv;

    if (rawVal.trim() === "") {
      // nested object — read indented lines
      const nested: Record<string, string> = {};
      i++;
      while (i < lines.length && lines[i].startsWith("  ")) {
        const sub = lines[i].trim().match(/^([A-Za-z_]+):\s*"?(.*?)"?\s*$/);
        if (sub) nested[sub[1]] = sub[2];
        i++;
      }
      data[key] = nested;
      continue;
    }

    let val: unknown = rawVal.trim();
    if (typeof val === "string") {
      if (val.startsWith("[") && val.endsWith("]")) {
        val = val
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
      } else if (val === "true") val = true;
      else if (val === "false") val = false;
      else if (/^-?\d+(\.\d+)?$/.test(val as string)) val = Number(val);
      else val = (val as string).replace(/^["']|["']$/g, "");
    }
    data[key] = val;
    i++;
  }

  return { data: data as unknown as PostFrontmatter, content };
}

const allPosts: Post[] = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    const { data, content } = parseFrontmatter(raw);
    return {
      ...data,
      slug,
      content,
      readingTime: readingTimeFn(content).text,
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export function getAllPosts(): Post[] {
  return allPosts;
}

export function getPostBySlug(slug: string): Post | undefined {
  return allPosts.find((p) => p.slug === slug);
}

export function getTrendingPosts(limit = 6): Post[] {
  return [...allPosts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, limit);
}

export function getRecentPosts(limit = 5): Post[] {
  return allPosts.slice(0, limit);
}

export function getRelatedPosts(slug: string, category: string, limit = 3): Post[] {
  return allPosts
    .filter((p) => p.slug !== slug && p.category === category)
    .slice(0, limit);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(allPosts.map((p) => p.category)));
}
