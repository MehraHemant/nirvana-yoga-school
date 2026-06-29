import blogPostsJson from "@/content/data/blog/blog-posts.json";
import type { BlogPostDocument } from "@/content/types";

export const BLOG_POSTS = blogPostsJson as BlogPostDocument[];

export const BLOG_POSTS_BY_SLUG = Object.fromEntries(
  BLOG_POSTS.map((post) => [post.slug, post]),
) as Record<string, BlogPostDocument>;

export function getStaticBlogPost(slug: string): BlogPostDocument | null {
  return BLOG_POSTS_BY_SLUG[slug] ?? null;
}

export function getStaticBlogSlugs(): string[] {
  return BLOG_POSTS.map((post) => post.slug);
}

export function getStaticBlogPosts(): BlogPostDocument[] {
  return BLOG_POSTS;
}
