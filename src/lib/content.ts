import {
  getBlogPost,
  getBlogPostSlugs,
  getSitePage,
  getSitePageSlugs,
} from "@/content";
import type { BlogPostDocument, SitePageDocument } from "@/content/types";

export type { BlogPostDocument as BlogPost, SitePageDocument as SitePage };

/**
 * Load a site page from MySQL.
 *
 * @param slug - Page slug
 */
export async function fetchSitePage(
  slug: string,
): Promise<SitePageDocument | null> {
  const result = await getSitePage(slug);
  return result.data;
}

/**
 * Load a blog post from MySQL.
 *
 * @param slug - Post slug
 */
export async function fetchBlogPost(
  slug: string,
): Promise<BlogPostDocument | null> {
  const result = await getBlogPost(slug);
  return result.data;
}

/**
 * All published site page slugs from MySQL.
 */
export async function getAllSitePageSlugs() {
  return getSitePageSlugs();
}

/**
 * All published blog post slugs from MySQL.
 */
export async function getAllBlogSlugs() {
  return getBlogPostSlugs();
}
