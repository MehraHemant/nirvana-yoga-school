import { requireDb } from "@/content/repositories/db-fallback";
import type {
  HomeCourseCard,
  HomeCoursesSectionContent,
} from "@/content/types/dedicated-pages";
import type { CourseDocument } from "@/content/types/course";
import { isPageModulesDocument } from "@/lib/cms/db-page-modules";
import { syncPageFieldsFromModules } from "@/lib/cms/page-modules-builder";
import { db } from "@/lib/db";
import {
  isHomeCoursePlacementLive,
  mapCourseDocumentToHomeCard,
  normalizeHomeCourseRefs,
} from "./home-courses";

type CourseEntityRow = {
  slug: string;
  document: CourseDocument;
  pageModules: unknown;
};

/**
 * Homepage card photo — first image from the course hero module only.
 *
 * @param pageModules - `pages.page_modules` JSON
 */
function resolveHomeCardImage(pageModules: unknown): string {
  if (!isPageModulesDocument(pageModules)) return "";
  return syncPageFieldsFromModules(pageModules).image.trim();
}

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
        pageModules: page.pageModules,
      });
    }
    return map;
  });

  return result.data;
}

/**
 * Resolves homepage course placements to public cards.
 * Card photos come from each course hero section.
 *
 * @param section - Homepage courses section from CMS
 */
export async function resolveHomeCourses(
  section: HomeCoursesSectionContent,
): Promise<HomeCourseCard[]> {
  const refs = normalizeHomeCourseRefs(section).filter(isHomeCoursePlacementLive);
  if (refs.length === 0) return [];

  const slugs = refs.map((ref) => ref.courseSlug);
  const entities = await loadResidentialCoursesBySlug(slugs);

  return refs.flatMap((ref) => {
    const entity = entities.get(ref.courseSlug);
    if (!entity) return [];

    const image = resolveHomeCardImage(entity.pageModules);
    if (!image) return [];

    return [mapCourseDocumentToHomeCard(entity.document, image)];
  });
}
