import { sanitizeHtmlId } from "@/lib/html-id";

export { sanitizeHtmlId };

/**
 * Resolves an admin section panel DOM id from an optional CMS `_id`, else a stable slug.
 * Used for Jump to section / scroll-spy in admin editors only.
 *
 * @param fallbackSlug - Key used when `_id` is missing (e.g. `hero` → `section-hero`)
 * @param section - Optional section object that may carry `_id`
 */
export function toSectionDomId(
  fallbackSlug: string,
  section?: unknown,
): string {
  const raw =
    section &&
    typeof section === "object" &&
    "_id" in section &&
    typeof (section as { _id?: unknown })._id === "string"
      ? (section as { _id: string })._id.trim()
      : "";
  if (raw) return sanitizeHtmlId(raw);
  return sanitizeHtmlId(`section-${fallbackSlug}`);
}

/**
 * Smooth-scrolls the viewport to the element with the given id.
 *
 * @param id - Target element id
 */
export function scrollToSection(id: string): void {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}
