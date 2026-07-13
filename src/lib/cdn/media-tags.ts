/** Preset tags for CMS media library — accommodation, food, campus, etc. */
export const MEDIA_TAG_PRESETS = [
  "Private room",
  "2 shared room",
  "3 shared room",
  "4 shared room",
  "Food",
  "Dining",
  "Yoga hall",
  "Campus",
  "Retreat",
  "Teachers",
  "Practice",
  "General",
] as const;

export type MediaTagPreset = (typeof MEDIA_TAG_PRESETS)[number];

/**
 * Normalize tag input from comma-separated string or array.
 *
 * @param input - Raw tags from form or API
 * @returns Deduplicated trimmed tag list
 */
export function normalizeMediaTags(
  input: string | string[] | null | undefined,
): string[] {
  if (!input) return [];
  const list = Array.isArray(input)
    ? input
    : input.split(",").map((tag) => tag.trim());
  return [...new Set(list.filter(Boolean))];
}

/**
 * Parse tags stored as Prisma Json (MySQL JSON column).
 *
 * @param value - Raw value from database
 * @returns Normalized tag list
 */
export function parseMediaTagsFromDb(value: unknown): string[] {
  if (Array.isArray(value)) {
    return normalizeMediaTags(value as string[]);
  }
  if (typeof value === "string") {
    try {
      return normalizeMediaTags(JSON.parse(value) as string[]);
    } catch {
      return normalizeMediaTags(value);
    }
  }
  return [];
}
