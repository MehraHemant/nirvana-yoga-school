import type { RepositoryOptions } from "@/content/repositories/fetch";
import {
  getOnlineCourse,
  getOnlineCourseSlugs,
} from "@/content/repositories/online-course";
import {
  getResidentialCourse,
  getResidentialCourseSlugs,
} from "@/content/repositories/residential-course";
import {
  getSitePage,
  getSitePageSlugs,
} from "@/content/repositories/site-page";
import type { PageDocument } from "@/content/types";

/** Single entry point for `[slug]` route — online → residential → site. */
export async function getPageBySlug(
  slug: string,
  options?: RepositoryOptions,
): Promise<PageDocument | null> {
  const online = await getOnlineCourse(slug, options);
  if (online.data) {
    return { kind: "online", slug, course: online.data };
  }

  const residential = await getResidentialCourse(slug, options);
  if (residential.data) {
    return { kind: "residential", slug, course: residential.data };
  }

  const site = await getSitePage(slug, options);
  if (site.data) {
    return { kind: "site", slug, page: site.data };
  }

  return null;
}

/** All slugs for static generation (deduplicated). */
export async function getAllPageSlugs(): Promise<string[]> {
  const [online, residential, site] = await Promise.all([
    getOnlineCourseSlugs(),
    getResidentialCourseSlugs(),
    getSitePageSlugs(),
  ]);
  return [...new Set([...online, ...residential, ...site])];
}

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
  getSitePage,
  getSitePageSlugs,
} from "@/content/repositories/site-page";
