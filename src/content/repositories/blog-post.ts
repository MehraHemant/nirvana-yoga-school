import { requireDb } from "@/content/repositories/db-fallback";
import type {
  ContentResult,
  RepositoryOptions,
} from "@/content/repositories/fetch";
import type { BlogPostDocument } from "@/content/types";
import {
  fetchBlogPostFromDb,
  fetchBlogPostsFromDb,
  fetchBlogSlugsFromDb,
} from "@/lib/cms/cache";

/**
 * Load a blog post by slug from MySQL only.
 *
 * @param slug - Blog post slug
 * @param options - Optional repository options
 */
export async function getBlogPost(
  slug: string,
  options?: RepositoryOptions,
): Promise<ContentResult<BlogPostDocument | null>> {
  return requireDb(() => fetchBlogPostFromDb(slug), options);
}

/**
 * All published blog post slugs.
 */
export async function getBlogPostSlugs(): Promise<string[]> {
  const result = await requireDb(() => fetchBlogSlugsFromDb());
  return result.data;
}

/**
 * Load all published blog posts from MySQL only.
 *
 * @param options - Optional repository options
 */
export async function getBlogPosts(
  options?: RepositoryOptions,
): Promise<ContentResult<BlogPostDocument[]>> {
  return requireDb(() => fetchBlogPostsFromDb(), options);
}
