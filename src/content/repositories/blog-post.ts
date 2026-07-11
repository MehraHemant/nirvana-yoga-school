import {
  getStaticBlogPost,
  getStaticBlogPosts,
  getStaticBlogSlugs,
} from "@/content/data/blog";
import { withDbFallback } from "@/content/repositories/db-fallback";
import type {
  ContentResult,
  RepositoryOptions,
} from "@/content/repositories/fetch";
import type { BlogPostDocument } from "@/content/types";
import { fetchBlogPostFromDb, fetchBlogPostsFromDb } from "@/lib/cms/cache";

/**
 * Load a blog post by slug from Postgres or JSON.
 *
 * @param slug - Blog post slug
 * @param options - Optional source override
 */
export async function getBlogPost(
  slug: string,
  options?: RepositoryOptions,
): Promise<ContentResult<BlogPostDocument | null>> {
  return withDbFallback(
    () => fetchBlogPostFromDb(slug),
    () => getStaticBlogPost(slug),
    options,
  );
}

/** All blog post slugs. */
export async function getBlogPostSlugs(): Promise<string[]> {
  return getStaticBlogSlugs();
}

/**
 * Load all blog posts from Postgres or JSON.
 *
 * @param options - Optional source override
 */
export async function getBlogPosts(
  options?: RepositoryOptions,
): Promise<ContentResult<BlogPostDocument[]>> {
  return withDbFallback(
    () => fetchBlogPostsFromDb(),
    () => getStaticBlogPosts(),
    options,
  );
}
