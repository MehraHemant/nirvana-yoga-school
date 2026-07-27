import { pagePath } from "@/content/pages/path";
import type { CourseDocument } from "@/content/types/course";
import type { PageType } from "@/content/types/page-ref";
import type {
  ResolvedYttHubCourse,
  YttHubCourse,
  YttHubCourseEmbedded,
  YttHubCourseRef,
} from "@/content/types/shared-sections";

const COURSE_HREF_RE = /^\/(?:course|online-course)\/([^/?#]+)\/?$/i;

/**
 * True when the object is a legacy embedded card (title present).
 * Dual-written rows may also include `courseSlug`.
 *
 * @param course - Stored placement
 */
export function isYttHubCourseEmbedded(
  course: YttHubCourse,
): course is YttHubCourseEmbedded {
  return (
    "title" in course &&
    typeof course.title === "string" &&
    course.title.trim().length > 0
  );
}

/**
 * Extracts a course slug from a public course URL path.
 *
 * @param href - Public href such as `/course/200-hour-…`
 */
export function courseSlugFromHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  try {
    const path = trimmed.startsWith("http")
      ? new URL(trimmed).pathname
      : (trimmed.split(/[?#]/)[0] ?? trimmed);
    const match = path.match(COURSE_HREF_RE);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/**
 * Resolves the entity slug for a stored placement (ref or legacy href).
 *
 * @param course - Stored placement
 */
export function placementCourseSlug(course: YttHubCourse): string | null {
  if ("courseSlug" in course && typeof course.courseSlug === "string") {
    const slug = course.courseSlug.trim();
    if (slug) return slug;
  }
  if ("href" in course && typeof course.href === "string") {
    return courseSlugFromHref(course.href);
  }
  return null;
}

/**
 * Normalizes stored placements to entity refs for admin editing / save.
 * Drops entries that cannot be mapped to a course slug.
 *
 * @param courses - Raw `yttHub.courses` from CMS
 */
export function normalizeYttHubCourseRefs(
  courses: YttHubCourse[],
): YttHubCourseRef[] {
  const seen = new Set<string>();
  return courses.flatMap((course) => {
    const courseSlug = placementCourseSlug(course);
    if (!courseSlug || seen.has(courseSlug)) return [];
    seen.add(courseSlug);
    const description =
      "description" in course && typeof course.description === "string"
        ? course.description.trim()
        : "";
    const overview =
      isYttHubCourseEmbedded(course) && typeof course.overview === "string"
        ? course.overview.trim()
        : "";
    // Drop description when it merely duplicated the embedded overview.
    const placementDescription =
      description && description !== overview ? description : "";
    return placementDescription
      ? [{ courseSlug, description: placementDescription }]
      : [{ courseSlug }];
  });
}

/**
 * Maps a course document + page type into a resolved hub card.
 *
 * @param document - Course entity document
 * @param type - Page type for public URL
 * @param descriptionOverride - Optional placement description
 */
export function mapCourseDocumentToYttHubCard(
  document: CourseDocument,
  type: Extract<PageType, "course" | "online">,
  descriptionOverride?: string,
): ResolvedYttHubCourse {
  const overview = document.overview?.trim() || "";
  const placementDescription = descriptionOverride?.trim() || "";
  return {
    courseSlug: document.slug,
    title: document.title,
    overview,
    description: placementDescription || overview,
    focusAreas: document.highlights?.filter((item) => item.trim()) ?? [],
    level: document.level,
    certification: document.certification,
    duration: document.duration,
    fee: document.fee,
    image: document.image,
    certBadge: document.certBadge?.trim() || "",
    href: pagePath({ type, slug: document.slug }),
  };
}

/**
 * Maps a legacy embedded card to the resolved public shape.
 *
 * @param course - Embedded marketing card
 */
export function mapEmbeddedYttHubCourse(
  course: YttHubCourseEmbedded,
): ResolvedYttHubCourse {
  return {
    courseSlug: placementCourseSlug(course) ?? undefined,
    title: course.title,
    description: course.description || course.overview,
    overview: course.overview,
    focusAreas: course.focusAreas ?? [],
    level: course.level,
    certification: course.certification,
    duration: course.duration,
    fee: course.fee,
    image: course.image,
    certBadge: course.certBadge,
    href: course.href,
  };
}
