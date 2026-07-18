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
