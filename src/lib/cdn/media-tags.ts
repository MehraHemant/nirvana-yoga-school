/** Canonical CMS / lodging media tags (short labels for filters). */
export const MEDIA_TAG_PRESETS = [
  "private room",
  "2 shared",
  "4 shared",
  "food",
  "retreat",
  "teachers",
  "general",
] as const;

export type MediaTagPreset = (typeof MEDIA_TAG_PRESETS)[number];

/** Fallback when a legacy tag has no known mapping. */
export const DEFAULT_MEDIA_TAG: MediaTagPreset = "general";

/**
 * Legacy or alternate labels → canonical media tag.
 * Room display names, slugs, and old library chips are included.
 */
export const LEGACY_MEDIA_TAG_MAP: Record<string, MediaTagPreset> = {
  // Private room
  "Private Room with Balcony": "private room",
  "Private room": "private room",
  "private room": "private room",
  "private-room": "private room",
  "Private Room With Balcony": "private room",
  "Private AC Balcony Room": "private room",
  "private-ac-balcony": "private room",
  "Private Double Balcony Room (2 people)": "private room",
  "private-double-balcony": "private room",
  "Private AC": "private room",

  // 2 shared
  "2-Shared Room with Balcony": "2 shared",
  "2 shared room": "2 shared",
  "2-shared-room": "2 shared",
  "2-Shared Room With Balcony": "2 shared",
  "2 shared": "2 shared",
  "2-Shared AC Balcony Room": "2 shared",
  "2-shared-ac-balcony": "2 shared",
  "2-Shared AC": "2 shared",

  // 4 shared (3-shared and dorm variants fold here or to general)
  "4-Shared Dorm with Balcony": "4 shared",
  "4 shared room": "4 shared",
  "4-shared-dorm": "4 shared",
  "4-shared-room": "4 shared",
  "4 shared": "4 shared",
  "3-Shared Room with Balcony": "general",
  "3 shared room": "general",
  "3-shared-room": "general",
  "3-Shared Room With Balcony": "general",
  "3 shared": "general",

  // Food
  Food: "food",
  Dining: "food",
  dinning: "food",
  food: "food",

  // Retreat / campus
  Retreat: "retreat",
  retreat: "retreat",
  Campus: "general",
  campus: "general",
  Premises: "general",
  premises: "general",
  "Yoga hall": "general",
  "yoga hall": "general",
  yogahall: "general",
  Practice: "general",
  practice: "general",

  // Teachers
  Teachers: "teachers",
  teachers: "teachers",

  // General / uncategorized
  General: "general",
  general: "general",
  "Without Accommodation": "general",
  "without-accommodation": "general",
};

/** Room display name → lodging media tag (room names stay long in catalog). */
const ROOM_NAME_TO_MEDIA_TAG: Record<string, MediaTagPreset> = {
  "Private Room with Balcony": "private room",
  "2-Shared Room with Balcony": "2 shared",
  "3-Shared Room with Balcony": "general",
  "4-Shared Dorm with Balcony": "4 shared",
  "Private Double Balcony Room (2 people)": "private room",
  "Without Accommodation": "general",
  "Private AC Balcony Room": "private room",
  "2-Shared AC Balcony Room": "2 shared",
};

/**
 * Normalize a tag for fuzzy matching (`Private Room with Balcony` ↔ slug key).
 *
 * @param tag - Raw tag label
 */
export function normalizeMediaTagKey(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Maps any stored or UI tag to the canonical preset list.
 *
 * @param tag - Raw tag from DB, upload form, or room name
 */
export function canonicalizeMediaTag(tag: string): MediaTagPreset {
  const trimmed = tag.trim();
  if (!trimmed) return DEFAULT_MEDIA_TAG;

  if ((MEDIA_TAG_PRESETS as readonly string[]).includes(trimmed)) {
    return trimmed as MediaTagPreset;
  }

  const direct = LEGACY_MEDIA_TAG_MAP[trimmed];
  if (direct) return direct;

  const roomTag = ROOM_NAME_TO_MEDIA_TAG[trimmed];
  if (roomTag) return roomTag;

  const key = normalizeMediaTagKey(trimmed);
  for (const [legacy, canonical] of Object.entries(LEGACY_MEDIA_TAG_MAP)) {
    if (normalizeMediaTagKey(legacy) === key) return canonical;
  }
  for (const [roomName, canonical] of Object.entries(ROOM_NAME_TO_MEDIA_TAG)) {
    if (normalizeMediaTagKey(roomName) === key) return canonical;
  }

  return DEFAULT_MEDIA_TAG;
}

/**
 * Canonicalizes a tag list, deduped, preserving first-seen order.
 *
 * @param tags - Raw tag list
 */
export function canonicalizeMediaTags(tags: string[]): MediaTagPreset[] {
  const seen = new Set<MediaTagPreset>();
  const result: MediaTagPreset[] = [];
  for (const tag of tags) {
    const canonical = canonicalizeMediaTag(tag);
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    result.push(canonical);
  }
  return result;
}

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
 * Parse tags stored as Neon Json (MySQL JSON column).
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

/**
 * Formats byte size for admin upload summaries.
 *
 * @param bytes - File size in bytes
 */
export function formatMediaUploadSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
