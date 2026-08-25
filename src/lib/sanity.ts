import { createClient, type SanityClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { PortableTextBlock } from "@portabletext/react";

export const SANITY_PROJECT_ID = "wazk28tf";
export const SANITY_DATASET = "production";
export const SANITY_API_VERSION = "2024-01-01";

export const sanityClient: SanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn: true,
  perspective: "published",
});

const builder = imageUrlBuilder(sanityClient);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source);
}

export interface SanityImage {
  asset?: { _ref?: string; _id?: string; url?: string };
  alt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface FaqItem {
  _key?: string;
  question: string;
  answer: string;
}

export interface PostListItem {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  mainImage?: SanityImage;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes?: number;
  category?: string;
  author?: string;
  authorImage?: SanityImage;
  authorBio?: string;
}

export interface PostDetail {
  _id: string;
  title: string;
  slug: { current: string };
  body?: PortableTextBlock[];
  mainImage?: SanityImage;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes?: number;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  category?: string;
  author?: string;
  authorImage?: SanityImage;
  authorBio?: string;
  faqs?: FaqItem[];
}

export const POSTS_LIST_QUERY = /* groq */ `
*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
  "updatedAt": _updatedAt,
  readingMinutes,
  "category": category->title,
  "author": author->name,
  "authorImage": coalesce(author->image, author->profileImage),
  "authorBio": coalesce(author->bio, author->shortBio, author->description)
}
`;

export const POST_DETAIL_QUERY = /* groq */ `
*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  body,
  mainImage,
  publishedAt,
  "updatedAt": _updatedAt,
  readingMinutes,
  excerpt,
  seoTitle,
  seoDescription,
  "category": category->title,
  "author": author->name,
  "authorImage": coalesce(author->image, author->profileImage),
  "authorBio": coalesce(author->bio, author->shortBio, author->description),
  faqs
}
`;

export const RELATED_POSTS_QUERY = /* groq */ `
*[_type == "post" && defined(slug.current) && slug.current != $slug && category->title == $category]
  | order(publishedAt desc)[0...4]{
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    "updatedAt": _updatedAt,
    readingMinutes,
    "category": category->title,
    "author": author->name,
    "authorImage": coalesce(author->image, author->profileImage),
    "authorBio": coalesce(author->bio, author->shortBio, author->description)
  }
`;

export const RECENT_POSTS_QUERY = /* groq */ `
*[_type == "post" && defined(slug.current) && slug.current != $slug]
  | order(publishedAt desc)[0...4]{
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    "updatedAt": _updatedAt,
    readingMinutes,
    "category": category->title,
    "author": author->name,
    "authorImage": coalesce(author->image, author->profileImage),
    "authorBio": coalesce(author->bio, author->shortBio, author->description)
  }
`;

export const POSTS_COUNT_QUERY = /* groq */ `count(*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))])`;

export async function fetchAllPosts(): Promise<PostListItem[]> {
  return sanityClient.fetch<PostListItem[]>(POSTS_LIST_QUERY);
}

export async function fetchPostBySlug(slug: string): Promise<PostDetail | null> {
  return sanityClient.fetch<PostDetail | null>(POST_DETAIL_QUERY, { slug });
}

export async function fetchRelatedPosts(
  slug: string,
  category?: string,
): Promise<PostListItem[]> {
  if (!category) {
    return sanityClient.fetch<PostListItem[]>(RECENT_POSTS_QUERY, { slug });
  }

  const related = await sanityClient.fetch<PostListItem[]>(RELATED_POSTS_QUERY, {
    slug,
    category,
  });

  if (related.length >= 4) return related;

  const recent = await sanityClient.fetch<PostListItem[]>(RECENT_POSTS_QUERY, { slug });
  const existing = new Set(related.map((post) => post._id));
  return [...related, ...recent.filter((post) => !existing.has(post._id))].slice(0, 4);
}

export async function fetchPostsCount(): Promise<number> {
  return sanityClient.fetch<number>(POSTS_COUNT_QUERY);
}

export function formatReadingTime(minutes?: number): string {
  const m = Math.max(1, Math.round(minutes || 1));
  return `${m} min read`;
}
