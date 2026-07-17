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
