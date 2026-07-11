import {
  getStaticBlogPost,
  getStaticBlogPosts,
  getStaticBlogSlugs,
} from "@/content/data/blog";
import type { ContentResult } from "@/content/repositories/fetch";
import { fromJson, type RepositoryOptions } from "@/content/repositories/fetch";
import type { BlogPostDocument } from "@/content/types";

export async function getBlogPost(
  slug: string,
  _options?: RepositoryOptions,
): Promise<ContentResult<BlogPostDocument | null>> {
  return fromJson(getStaticBlogPost(slug));
}

export async function getBlogPostSlugs(): Promise<string[]> {
  return getStaticBlogSlugs();
}

export async function getBlogPosts(
  _options?: RepositoryOptions,
): Promise<ContentResult<BlogPostDocument[]>> {
  return fromJson(getStaticBlogPosts());
}
