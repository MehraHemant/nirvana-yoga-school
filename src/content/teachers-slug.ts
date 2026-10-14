/** CMS / public slug for the faculty page (`/teacher`). Safe for client imports. */
export const TEACHER_PAGE_SLUG = "teacher";

/**
 * Builds a URL-safe slug from a teacher name (for in-page anchors).
 *
 * @param name - Display name
 * @returns Kebab-case slug
 */
export function teacherSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Deep link to a faculty profile on the public teachers page.
 *
 * @param name - Teacher display name
 * @returns `/teacher#slug` href
 */
export function teacherPageHref(name: string): string {
  return `/${TEACHER_PAGE_SLUG}#${teacherSlug(name)}`;
}

/**
 * Reads a teacher deep-link target from the URL hash (`#slug`) or
 * `?teacher=` query. Prefers hash when both are present.
 *
 * @param validSlugs - Known faculty slugs on the page
 * @returns Matching slug, or `null` if none
 */
export function readTeacherDeepLink(
  validSlugs: readonly string[],
): string | null {
  if (typeof window === "undefined") return null;
  const allowed = new Set(validSlugs);

  const hash = window.location.hash.replace(/^#/, "").trim();
  if (hash && allowed.has(hash)) return hash;

  const query = new URLSearchParams(window.location.search)
    .get("teacher")
    ?.trim();
  if (query && allowed.has(query)) return query;

  return null;
}
