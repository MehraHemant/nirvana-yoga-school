import { pagePath } from "@/content/pages/path";
import type {
  HomeCourseCard,
  HomeCourseRef,
  HomeCoursesSectionContent,
} from "@/content/types/dedicated-pages";
import type { CourseDocument } from "@/content/types/course";
import { courseSlugFromHref } from "./ytt-hub-courses";

/**
 * True when a placement is visible on the homepage.
 *
 * @param ref - Stored course placement
 */
export function isHomeCoursePlacementLive(ref: HomeCourseRef): boolean {
  return ref.live !== false;
}

/**
 * Normalizes stored homepage course placements.
 * Migrates legacy embedded cards via public href when placements are empty.
 *
 * @param section - Homepage courses section from CMS
 */
export function normalizeHomeCourseRefs(
  section: HomeCoursesSectionContent,
): HomeCourseRef[] {
  if (section.placements?.length) {
    const seen = new Set<string>();
    return section.placements.flatMap((ref) => {
      const courseSlug = ref.courseSlug?.trim();
      if (!courseSlug || seen.has(courseSlug)) return [];
      seen.add(courseSlug);
      return ref.live === false
        ? [{ courseSlug, live: false }]
        : [{ courseSlug }];
    });
  }

  const cards = section.cards ?? [];
  const seen = new Set<string>();
  return cards.flatMap((card) => {
    const courseSlug = courseSlugFromHref(card.href);
    if (!courseSlug || seen.has(courseSlug)) return [];
    seen.add(courseSlug);
    return [{ courseSlug }];
  });
}

/**
 * Maps a residential course document into a homepage card.
 *
 * @param document - Course entity document
 */
export function mapCourseDocumentToHomeCard(
  document: CourseDocument,
): HomeCourseCard {
  return {
    title: document.title,
    duration: document.duration,
    level: document.level,
    certification: document.certification,
    fee: document.fee,
    image: document.image,
    certBadge: document.certBadge?.trim() || "",
    href: pagePath({ type: "course", slug: document.slug }),
    highlights: document.highlights?.filter((item) => item.trim()) ?? [],
  };
}

/**
 * Strips legacy embedded cards before persisting homepage course placements.
 *
 * @param section - Homepage courses section
 */
export function homeCoursesSectionForSave(
  section: HomeCoursesSectionContent,
): HomeCoursesSectionContent {
  const placements = normalizeHomeCourseRefs(section);
  const { cards: _cards, ...rest } = section;
  return { ...rest, placements };
}
