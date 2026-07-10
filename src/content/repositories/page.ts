import { loadPageBySlug } from "@/content/pages/load";
import { PAGES } from "@/content/pages/registry";
import type { RepositoryOptions } from "@/content/repositories/fetch";
import type { PageDocument } from "@/content/types";

/** Resolve any page by slug — uses the pages registry for type, then loads data. */
export async function getPageBySlug(
  slug: string,
  _options?: RepositoryOptions,
): Promise<PageDocument | null> {
  return loadPageBySlug(slug);
}

/** All slugs for static generation (deduplicated). */
export async function getAllPageSlugs(): Promise<string[]> {
  return PAGES.map((page) => page.slug);
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
