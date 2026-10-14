import type { TeacherProfile } from "@/components/home/TeachersSection";
import { isKirtanPage, mapKirtanPage } from "@/content/mappers/kirtan-page";
import { mapSitePage } from "@/content/mappers/site-page";
import { isVenuePage, mapVenuePage } from "@/content/mappers/venue-page";
import { mapTeachersFromPeople } from "@/content/repositories/teachers";
import type { PageModulesDocument, SitePageDocument } from "@/content/types";
import type { SharedFaq } from "@/content/types/shared-sections";
import type { SitePageData, SitePageVariant } from "./types";

export function sitePageVariant(slug: string): SitePageVariant {
  if (slug === "teacher") return "teacher";
  if (
    slug === "yoga-teacher-training-in-rishikesh-india" ||
    slug === "online-yoga-teacher-training-courses" ||
    slug === "kundalini-yoga-teacher-training-in-rishikesh-india"
  ) {
    return "hub";
  }
  return "editorial";
}

/**
 * Map site-page people into teacher profiles for shared section UIs.
 *
 * @param people - People rows from a site page document
 */
export function mapSiteTeachers(
  people: SitePageDocument["people"],
): TeacherProfile[] {
  return mapTeachersFromPeople(people);
}

/**
 * Maps a site page document into UI data.
 *
 * @param page - Site page from MySQL
 * @param modules - Optional page modules
 * @param venueFaqs - Venue FAQs from MySQL (used when slug is a venue page)
 */
export function loadSitePageData(
  page: SitePageDocument,
  modules: PageModulesDocument | null = null,
  venueFaqs: SharedFaq[] = [],
): SitePageData {
  const mapped = isKirtanPage(page.slug)
    ? mapKirtanPage(page)
    : isVenuePage(page.slug)
      ? mapVenuePage(page, venueFaqs)
      : mapSitePage(page);

  return {
    page,
    mapped,
    teachers: mapSiteTeachers(page.people),
    variant: sitePageVariant(page.slug),
    modules,
    residentialLife: null,
    whyNirvana: null,
    reviews: null,
    siteMap: null,
    instagram: null,
    travel: null,
    examCertification: null,
  };
}
