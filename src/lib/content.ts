import {
  getBlogPost,
  getBlogPostSlugs,
  getSitePage,
  getSitePageSlugs,
} from "@/content";
import { BLOG_POSTS } from "@/content/data/blog";
import { SITE_PAGES } from "@/content/data/site-pages";
import type { BlogPostDocument, SitePageDocument } from "@/content/types";

/** @deprecated Use `@/content` repositories instead. */
export const FALLBACK_SITE_PAGES = SITE_PAGES;
/** @deprecated Use `@/content` repositories instead. */
export const FALLBACK_BLOG_POSTS = BLOG_POSTS;

export type { BlogPostDocument as BlogPost, SitePageDocument as SitePage };

export async function fetchSitePage(
  slug: string,
): Promise<SitePageDocument | null> {
  const result = await getSitePage(slug);
  return result.data;
}

export async function fetchBlogPost(
  slug: string,
): Promise<BlogPostDocument | null> {
  const result = await getBlogPost(slug);
  return result.data;
}

export async function getAllSitePageSlugs() {
  return getSitePageSlugs();
}

export async function getAllBlogSlugs() {
  return getBlogPostSlugs();
}
