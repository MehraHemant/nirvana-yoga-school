import { canonicalizeMediaTag } from "@/lib/cdn/media-tags";

/**
 * Public-facing room label — prefers title, falls back to name then slug.
 *
 * @param room - Room fields with optional title
 */
export function roomDisplayTitle(room: {
  title?: string;
  name?: string;
  slug?: string;
}): string {
  const title = room.title?.trim();
  if (title) return title;
  const name = room.name?.trim();
  if (name) return name;
  return room.slug?.trim() || "Room";
}

/** Five live course package labels (pricing / public copy). */
export const COURSE_PACKAGE_LABELS = [
  "Private Room with Balcony",
  "2-Shared Room with Balcony",
  "4-Shared Dorm with Balcony",
  "Private Double Balcony Room (2 people)",
  "Without Accommodation",
] as const;

/**
 * Media tag for a room — short canonical label for library filters.
 *
 * @param name - Room display name
 */
export function roomMediaTag(name: string): string {
  return canonicalizeMediaTag(name);
}
