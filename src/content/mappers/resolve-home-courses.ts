import { requireDb } from "@/content/repositories/db-fallback";
import type {
  HomeCourseCard,
  HomeCoursesSectionContent,
} from "@/content/types/dedicated-pages";
import type { CourseDocument } from "@/content/types/course";
import { db } from "@/lib/db";
import {
  isHomeCoursePlacementLive,
  mapCourseDocumentToHomeCard,
  normalizeHomeCourseRefs,
} from "./home-courses";

type CourseEntityRow = {
  slug: string;
  document: CourseDocument;
};

/**
 * Loads published residential course entities by slug (batch).
 *
 * @param slugs - Course page slugs
 */
async function loadResidentialCoursesBySlug(
  slugs: string[],
): Promise<Map<string, CourseEntityRow>> {
  const unique = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];
  if (unique.length === 0) return new Map();

  const result = await requireDb(async () => {
    const pages = await db.page.findMany({
      where: {
        slug: { in: unique },
        type: "course",
        published: true,
      },
      include: { courseDoc: true },
    });

    const map = new Map<string, CourseEntityRow>();
    for (const page of pages) {
      const document = page.courseDoc?.document;
      if (!document || typeof document !== "object") continue;
      const record = document as CourseDocument;
      if (typeof record.title !== "string") continue;
      map.set(page.slug, {
        slug: page.slug,
        document: {
          ...record,
          slug: typeof record.slug === "string" ? record.slug : page.slug,
        },
      });
    }
    return map;
  });

  return result.data;
}

/**
 * Resolves homepage course placements to public cards.
 * Falls back to legacy embedded cards when no entity matches.
 *
 * @param section - Homepage courses section from CMS
 */
export async function resolveHomeCourses(
  section: HomeCoursesSectionContent,
): Promise<HomeCourseCard[]> {
  const refs = normalizeHomeCourseRefs(section).filter(isHomeCoursePlacementLive);
  if (refs.length === 0) {
    return section.cards?.length ? section.cards : [];
  }

  const slugs = refs.map((ref) => ref.courseSlug);
  const entities = await loadResidentialCoursesBySlug(slugs);

  return refs.flatMap((ref) => {
    const entity = entities.get(ref.courseSlug);
    if (entity) {
      return [mapCourseDocumentToHomeCard(entity.document)];
    }

    const legacyCard = section.cards?.find(
      (card) => card.href.includes(`/${ref.courseSlug}`),
    );
    return legacyCard ? [legacyCard] : [];
  });
}
