import { loadPageBySlug } from "@/content/pages/load";
import { requireDb } from "@/content/repositories/db-fallback";
import type { RepositoryOptions } from "@/content/repositories/fetch";
import type { PageDocument } from "@/content/types";
import { prisma } from "@/lib/db";

/**
 * Resolve any page by slug — uses the pages registry for type, then loads data.
 *
 * @param slug - Page slug
 * @param _options - Unused; kept for API parity
 */
export async function getPageBySlug(
  slug: string,
  _options?: RepositoryOptions,
): Promise<PageDocument | null> {
  return loadPageBySlug(slug);
}

/**
 * All published page slugs from MySQL (for static generation).
 */
export async function getAllPageSlugs(): Promise<string[]> {
  const result = await requireDb(async () => {
    const pages = await prisma.page.findMany({
      where: { published: true },
      select: { slug: true },
      orderBy: { title: "asc" },
    });
    return pages.map((page) => page.slug);
  });
  return result.data;
}

export { loadPage, loadPageBySlug } from "@/content/pages/load";
export { pagePath } from "@/content/pages/path";
export {
  getPageRef,
  getPageType,
  getSlugsByType,
} from "@/content/pages/registry";
export {
  getBlogPost,
  getBlogPostSlugs,
  getBlogPosts,
} from "@/content/repositories/blog-post";
export {
  getOnlineCourse,
  getOnlineCourseSlugs,
} from "@/content/repositories/online-course";
export {
  getCourseMedia,
  getResidentialCourse,
  getResidentialCourseSlugs,
} from "@/content/repositories/residential-course";
export {
  getRetreat,
  getRetreatSlugs,
} from "@/content/repositories/retreat";
export {
  getSitePage,
  getSitePageSlugs,
} from "@/content/repositories/site-page";
