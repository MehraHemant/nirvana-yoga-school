import { requireDb } from "@/content/repositories/db-fallback";
import type { CourseDocument } from "@/content/types/course";
import type {
  ResolvedYttHubCourse,
  YttHubCourse,
} from "@/content/types/shared-sections";
import { db } from "@/lib/db";
import {
  isYttHubCourseEmbedded,
  mapCourseDocumentToYttHubCard,
  mapEmbeddedYttHubCourse,
  placementCourseSlug,
} from "./ytt-hub-courses";

type CourseEntityRow = {
  slug: string;
  type: "course" | "online";
  document: CourseDocument;
};

/**
 * Loads published course/online entities by slug (batch).
 *
 * @param slugs - Course page slugs
 */
async function loadCourseEntitiesBySlug(
  slugs: string[],
): Promise<Map<string, CourseEntityRow>> {
  const unique = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];
  if (unique.length === 0) return new Map();

  const result = await requireDb(async () => {
    const pages = await db.page.findMany({
      where: {
        slug: { in: unique },
        type: { in: ["course", "online"] },
        published: true,
      },
      include: { courseDoc: true },
    });

    const map = new Map<string, CourseEntityRow>();
    for (const page of pages) {
      if (page.type !== "course" && page.type !== "online") continue;
      const document = page.courseDoc?.document;
      if (!document || typeof document !== "object") continue;
      const record = document as CourseDocument;
      if (typeof record.title !== "string") continue;
      map.set(page.slug, {
        slug: page.slug,
        type: page.type,
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
 * Resolves YTT hub course placements to public cards.
 * Prefers course entities; falls back to embedded card data when the entity is missing.
 *
 * @param courses - Stored `yttHub.courses` placements
 */
export async function resolveYttHubCourses(
  courses: YttHubCourse[],
): Promise<ResolvedYttHubCourse[]> {
  if (!Array.isArray(courses) || courses.length === 0) return [];

  const slugs = courses.flatMap((course) => {
    const slug = placementCourseSlug(course);
    return slug ? [slug] : [];
  });
  const entities = await loadCourseEntitiesBySlug(slugs);

  return courses.flatMap((course) => {
    const slug = placementCourseSlug(course);
    const placementDescription =
      "description" in course && typeof course.description === "string"
        ? course.description
        : undefined;

    if (slug) {
      const entity = entities.get(slug);
      if (entity) {
        return [
          mapCourseDocumentToYttHubCard(
            entity.document,
            entity.type,
            placementDescription,
          ),
        ];
      }
    }

    if (isYttHubCourseEmbedded(course)) {
      return [mapEmbeddedYttHubCourse(course)];
    }

    return [];
  });
}
