/**
 * Sanitizes a string for use as an HTML element id (spaces → hyphens).
 *
 * @param value - Raw id candidate
 */
export function sanitizeHtmlId(value: string): string {
  const cleaned = value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-_]/g, "");
  return cleaned || "section";
}

/**
 * Resolves a public section HTML `id` from an optional CMS `_id`, else a fallback.
 *
 * @param fallbackId - Hardcoded id used when `_id` is empty (e.g. `about`, `courses`)
 * @param sectionId - Optional CMS `_id` from admin
 */
export function resolveSectionHtmlId(
  fallbackId: string,
  sectionId?: string | null,
): string {
  const raw = typeof sectionId === "string" ? sectionId.trim() : "";
  if (!raw) return fallbackId;
  return sanitizeHtmlId(raw);
}

/**
 * Returns a sanitized HTML id when CMS `_id` is set; otherwise `undefined`.
 * Use for sections that historically had no hardcoded id (e.g. hero).
 *
 * @param sectionId - Optional CMS `_id` from admin
 */
export function optionalSectionHtmlId(
  sectionId?: string | null,
): string | undefined {
  const raw = typeof sectionId === "string" ? sectionId.trim() : "";
  if (!raw) return undefined;
  const cleaned = raw
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-_]/g, "");
  return cleaned || undefined;
}
