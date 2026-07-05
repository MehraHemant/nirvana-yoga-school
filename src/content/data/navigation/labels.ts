import { ONLINE_COURSES } from "@/content/data/online-courses";
import { SITE_PAGES } from "@/content/data/site-pages";
import type { PageType } from "@/content/types/page-ref";
import { COURSES_DATA } from "@/data/coursesData";

/** Resolve display label for a page ref from content data. */
export function getPageLabel(type: PageType, slug: string): string {
  switch (type) {
    case "course":
      return COURSES_DATA[slug]?.title ?? SITE_PAGES[slug]?.title ?? slug;
    case "online":
      return ONLINE_COURSES[slug]?.title ?? SITE_PAGES[slug]?.title ?? slug;
    case "retreat":
    case "venue":
    case "site":
      return SITE_PAGES[slug]?.title ?? slug;
  }
}
