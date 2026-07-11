import type { TeacherProfile } from "@/components/home/TeachersSection";
import { isKirtanPage, mapKirtanPage } from "@/content/mappers/kirtan-page";
import { mapSitePage } from "@/content/mappers/site-page";
import {
  refineTeacherBio,
  refineTeacherSummary,
} from "@/content/mappers/site-page-copy";
import { isVenuePage, mapVenuePage } from "@/content/mappers/venue-page";
import type { PageModulesDocument, SitePageDocument } from "@/content/types";
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

export function mapSiteTeachers(
  people: SitePageDocument["people"],
): TeacherProfile[] {
  return (people ?? []).map((person) => ({
    name: person.name,
    experienceSummary: refineTeacherSummary(
      person.summary ?? "Experienced faculty",
    ),
    image:
      person.image ??
      "https://www.nirvanayogaschoolindia.com/img/teacher/jeet-thapliyal.webp",
    bio: refineTeacherBio(person.bio ?? ""),
    education: person.education ?? [],
    detailedExperience: person.experience ?? [],
    expertise: person.expertise ?? [],
  }));
}

export function loadSitePageData(
  page: SitePageDocument,
  modules: PageModulesDocument | null = null,
): SitePageData {
  const mapped = isKirtanPage(page.slug)
    ? mapKirtanPage(page)
    : isVenuePage(page.slug)
      ? mapVenuePage(page)
      : mapSitePage(page);

  return {
    page,
    mapped,
    teachers: mapSiteTeachers(page.people),
    variant: sitePageVariant(page.slug),
    modules,
  };
}
