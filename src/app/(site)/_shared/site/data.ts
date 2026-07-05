import type { TeacherProfile } from "@/components/home/TeachersSection";
import { mapSitePage } from "@/content/mappers/site-page";
import {
  refineTeacherBio,
  refineTeacherSummary,
} from "@/content/mappers/site-page-copy";
import type { SitePageDocument } from "@/content/types";
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
      "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=600&auto=format&fit=crop&q=80",
    bio: refineTeacherBio(person.bio ?? ""),
    education: person.education ?? [],
    detailedExperience: person.experience ?? [],
    expertise: person.expertise ?? [],
  }));
}

export function loadSitePageData(page: SitePageDocument): SitePageData {
  return {
    page,
    mapped: mapSitePage(page),
    teachers: mapSiteTeachers(page.people),
    variant: sitePageVariant(page.slug),
  };
}
