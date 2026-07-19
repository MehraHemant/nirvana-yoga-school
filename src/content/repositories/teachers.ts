import { unstable_cache } from "next/cache";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import {
  refineTeacherBio,
  refineTeacherSummary,
} from "@/content/mappers/site-page-copy";
import { requireDb } from "@/content/repositories/db-fallback";
import type { ContentResult } from "@/content/repositories/fetch";
import { TEACHER_PAGE_SLUG, teacherSlug } from "@/content/teachers-slug";
import type { SitePageDocument, SitePagePerson } from "@/content/types";
import { contentCacheTag } from "@/lib/cms/cache";
import {
  mapPageToSitePageDocument,
  pageWithRelations,
} from "@/lib/cms/db-to-document";
import { db } from "@/lib/db";

export { TEACHER_PAGE_SLUG, teacherSlug };

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
  const seen = new Set<string>();
  const teachers: TeacherProfile[] = [];

  for (const person of people ?? []) {
    const slug = teacherSlug(person.name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    teachers.push({
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
    });
  }

  return teachers;
}

/**
 * Parse teacher presentation fields from `content_data`.
 *
 * @param value - Raw JSON from Neon
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

/**
 * Default presentation copy used when seeding / ensuring the teacher page.
 */
export const DEFAULT_TEACHERS_PRESENTATION: TeachersPagePresentation = {
  heroQuote:
    "Yoga Is A Light, Which Once Lit Will Never Dim. The Better Your Practice, The Brighter Your Flame.",
  sectionEyebrow: "Faculty profiles",
  sectionTitle: "Meet our gurus",
  sectionDescription:
    "Biography, education, experience, and areas of expertise for every member of our faculty.",
  homeEyebrow: "Our Spiritual Indian Gurus",
  homeTitle: "Lineage Teachers, Guided by Compassion",
  homeDescription:
    "Meet our experienced, traditional yoga teachers and spiritual guides carrying decades of combined practice directly from traditional Vedic lineages in Rishikesh.",
};

async function loadTeachersPageFromDb(): Promise<TeachersPageData | null> {
  let page = await db.page.findUnique({
    where: { slug: TEACHER_PAGE_SLUG },
    include: pageWithRelations,
  });

  if (!page || !page.published || page.people.length === 0) {
    const { ensureTeacherPage } = await import("@/lib/cms/ensure-teacher-page");
    await ensureTeacherPage().catch(() => null);
    page = await db.page.findUnique({
      where: { slug: TEACHER_PAGE_SLUG },
      include: pageWithRelations,
    });
  }

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

/**
 * Filters faculty profiles by selected teacher slugs (page modules picker),
 * rendered in the persisted `selectedSlugs` order (admin drag-and-drop order).
 * `undefined` keeps `fallback` (legacy page.people). An empty array shows none.
 *
 * @param faculty - Full faculty list from the teachers store
 * @param selectedSlugs - Slugs chosen on a page, in display order (`teacherSlug(name)`)
 * @param fallback - Profiles used when the picker has never been saved
 */
export function resolveSelectedTeachers(
  faculty: TeacherProfile[],
  selectedSlugs: string[] | undefined,
  fallback: TeacherProfile[] = [],
): TeacherProfile[] {
  if (selectedSlugs === undefined) return fallback;
  if (selectedSlugs.length === 0) return [];
  const bySlug = new Map(
    faculty.map((teacher) => [teacherSlug(teacher.name), teacher] as const),
  );
  const seen = new Set<string>();
  return selectedSlugs.flatMap((slug) => {
    if (seen.has(slug)) return [];
    seen.add(slug);
    const teacher = bySlug.get(slug);
    return teacher ? [teacher] : [];
  });
}
