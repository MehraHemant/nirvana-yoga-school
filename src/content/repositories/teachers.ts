import { unstable_cache } from "next/cache";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import {
  refineTeacherBio,
  refineTeacherSummary,
} from "@/content/mappers/site-page-copy";
import { requireDb } from "@/content/repositories/db-fallback";
import type { ContentResult } from "@/content/repositories/fetch";
import { teacherSlug } from "@/content/teachers-slug";
import type { SitePageDocument, SitePagePerson } from "@/content/types";
import { contentCacheTag } from "@/lib/cms/cache";
import {
  mapPageToSitePageDocument,
  pageWithRelations,
} from "@/lib/cms/db-to-document";
import { prisma } from "@/lib/db";

export const TEACHER_PAGE_SLUG = "teacher";
export { teacherSlug };

/** Presentation copy stored on the teacher page `content_data` JSON. */
export type TeachersPagePresentation = {
  heroQuote?: string;
  heroLead?: string;
  sectionEyebrow?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  homeEyebrow?: string;
  homeTitle?: string;
  homeDescription?: string;
  /** Optional HTML id for the hero band */
  heroId?: string;
  /** Optional HTML id for the faculty section */
  facultyId?: string;
  /** Optional HTML id for the homepage teachers teaser (admin jump target) */
  homeTeaserId?: string;
};

export type TeachersPageData = {
  page: SitePageDocument;
  presentation: TeachersPagePresentation;
  teachers: TeacherProfile[];
};

/**
 * Map CMS `page_people` rows into the frontend teacher profile shape.
 *
 * @param people - People from the teacher site page
 */
export function mapTeachersFromPeople(
  people: SitePagePerson[] | undefined,
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

/**
 * Parse teacher presentation fields from `content_data`.
 *
 * @param value - Raw JSON from Prisma
 */
export function parseTeachersPresentation(
  value: unknown,
): TeachersPagePresentation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const record = value as Record<string, unknown>;
  const pick = (key: string) =>
    typeof record[key] === "string" ? (record[key] as string) : undefined;
  return {
    heroQuote: pick("heroQuote"),
    heroLead: pick("heroLead"),
    sectionEyebrow: pick("sectionEyebrow"),
    sectionTitle: pick("sectionTitle"),
    sectionDescription: pick("sectionDescription"),
    homeEyebrow: pick("homeEyebrow"),
    homeTitle: pick("homeTitle"),
    homeDescription: pick("homeDescription"),
    heroId: pick("heroId"),
    facultyId: pick("facultyId"),
    homeTeaserId: pick("homeTeaserId"),
  };
}

async function loadTeachersPageFromDb(): Promise<TeachersPageData | null> {
  const page = await prisma.page.findUnique({
    where: { slug: TEACHER_PAGE_SLUG },
    include: pageWithRelations,
  });
  if (!page || !page.published) return null;

  const doc = mapPageToSitePageDocument(page);
  return {
    page: doc,
    presentation: parseTeachersPresentation(page.contentData),
    teachers: mapTeachersFromPeople(doc.people),
  };
}

/**
 * Load the teacher page + faculty profiles from MySQL (cached 1h).
 */
export async function getTeachersPage(): Promise<
  ContentResult<TeachersPageData | null>
> {
  return requireDb(async () => {
    const cached = unstable_cache(loadTeachersPageFromDb, ["teachers-page"], {
      tags: [contentCacheTag(TEACHER_PAGE_SLUG)],
      revalidate: 3600,
    });
    return cached();
  });
}

/**
 * Faculty list for the homepage and shared sections (from DB).
 */
export async function getTeachers(): Promise<TeacherProfile[]> {
  const result = await getTeachersPage();
  return result.data?.teachers ?? [];
}
