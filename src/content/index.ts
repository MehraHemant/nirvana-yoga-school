export {
  buildAllOnlineCoursesFromSitePages,
  buildOnlineCourseFromSitePage,
  ONLINE_COURSE_SLUGS,
} from "@/content/mappers/online-course";
export type { MappedSitePage } from "@/content/mappers/site-page";
export { mapSitePage } from "@/content/mappers/site-page";
export {
  getAllPageSlugs,
  getBlogPost,
  getBlogPostSlugs,
  getBlogPosts,
  getCourseMedia,
  getOnlineCourse,
  getOnlineCourseSlugs,
  getPageBySlug,
  getResidentialCourse,
  getResidentialCourseSlugs,
  getSitePage,
  getSitePageSlugs,
} from "@/content/repositories/page";
export type * from "@/content/types";
