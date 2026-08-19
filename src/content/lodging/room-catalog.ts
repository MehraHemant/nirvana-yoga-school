import {
  canonicalizeMediaTag,
  type MediaTagPreset,
} from "@/lib/cdn/media-tags";

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

/**
 * Canonical course / retreat room catalog.
 * Convention: `media_images.tag` uses short media tags (`private room`, `2 shared`, …).
 * Room `name` is the internal identifier; public copy uses `title` when set.
 */

export type RoomCatalogSeed = {
  slug: string;
  name: string;
  description: string;
  /** Bullet features shown on public pricing / room cards. */
  features?: string[];
  /** Path under public/img/accommodation; empty = no photo seed */
  folder: string;
  sort: number;
};

/**
 * Course room types. Includes optional 3-shared and the five live YTT packages.
 * Media tag for each room is always `name`.
 */
export const COURSE_ROOM_CATALOG: RoomCatalogSeed[] = [
  {
    slug: "private-balcony",
    name: "Private Room with Balcony",
    description:
      "Quiet private rooms with balcony views for rest and reflection.",
    features: [
      "Private balcony",
      "Fully private bathroom",
      "3 organic vegetarian meals daily",
      "All excursions & study kits",
    ],
    folder: "course/private-room-with-balcony",
    sort: 10,
  },
  {
    slug: "2-shared-balcony",
    name: "2-Shared Room with Balcony",
    description:
      "Twin-sharing rooms with balcony access — comfortable and community-friendly.",
    features: [
      "Private/shared balcony",
      "Attached bathroom with hot shower",
      "3 organic vegetarian meals daily",
      "Weekly excursions included",
    ],
    folder: "course/2-shared-room-with-balcony",
    sort: 20,
  },
  {
    slug: "3-shared-balcony",
    name: "3-Shared Room with Balcony",
    description: "Triple-share rooms with balcony access for YTT students.",
    folder: "course/3-shared-room-with-balcony",
    sort: 30,
  },
  {
    slug: "4-shared-dorm",
    name: "4-Shared Dorm with Balcony",
    description: "Four-bed dorm rooms with balcony access — budget-friendly.",
    features: [
      "Shared balcony access",
      "Attached bathroom",
      "3 organic vegetarian meals daily",
      "All course materials included",
    ],
    folder: "course/4-shared-dorm-with-balcony",
    sort: 40,
  },
  {
    slug: "private-double-balcony",
    name: "Private Double Balcony Room (2 people)",
    description:
      "Private balcony room for two — shared as a couple or friends, with the same amenities as a private room.",
    features: [
      "Private balcony with seating",
      "Spacious premium bathroom",
      "3 organic vegetarian meals daily",
      "All course materials & activities",
    ],
    // Do not re-seed private-room photos here — shared URLs would overwrite tags.
    folder: "",
    sort: 50,
  },
  {
    slug: "without-accommodation",
    name: "Without Accommodation",
    description:
      "Tuition-only package. Ideal for students arranging their own accommodation nearby in Rishikesh.",
    features: [
      "Full course tuition",
      "Yoga Alliance certification",
      "All study materials included",
      "Daily yoga & meditation classes",
    ],
    folder: "",
    sort: 60,
  },
];

/** Retreat physical rooms. Tag = name. */
export const RETREAT_ROOM_CATALOG: RoomCatalogSeed[] = [
  {
    slug: "private-ac-balcony",
    name: "Private AC Balcony Room",
    description:
      "Quiet private AC rooms with balcony views for rest and reflection.",
    folder: "retreat/private-ac-balcony-room",
    sort: 10,
  },
  {
    slug: "2-shared-ac-balcony",
    name: "2-Shared AC Balcony Room",
    description:
      "Twin-sharing AC rooms with balcony access — comfortable and community-friendly.",
    folder: "retreat/2-shared-ac-balcony-room",
    sort: 20,
  },
];

/** Five live course package labels (pricing / public copy). */
export const COURSE_PACKAGE_LABELS = [
  "Private Room with Balcony",
  "2-Shared Room with Balcony",
  "4-Shared Dorm with Balcony",
  "Private Double Balcony Room (2 people)",
  "Without Accommodation",
] as const;

/** Legacy media_images / media_assets tags → canonical short media tags. */
export const LEGACY_ROOM_MEDIA_TAG_MAP: Record<string, MediaTagPreset> = {
  "private-room": "private room",
  "Private room": "private room",
  "Private Room With Balcony": "private room",
  "Private Room with Balcony": "private room",
  "2-shared-room": "2 shared",
  "2 shared room": "2 shared",
  "2-Shared Room With Balcony": "2 shared",
  "2-Shared Room with Balcony": "2 shared",
  "3-shared-room": "general",
  "3 shared room": "general",
  "3-Shared Room With Balcony": "general",
  "3-Shared Room with Balcony": "general",
  "4-shared-dorm": "4 shared",
  "4 shared room": "4 shared",
  "4-shared-room": "4 shared",
  "4-Shared Dorm with Balcony": "4 shared",
  "private-double-balcony": "private room",
  "Private Double Balcony Room (2 people)": "private room",
  "without-accommodation": "general",
  "Without Accommodation": "general",
  "private-ac-balcony": "private room",
  "Private AC Balcony Room": "private room",
  "2-shared-ac-balcony": "2 shared",
  "2-Shared AC Balcony Room": "2 shared",
  Food: "food",
  Dining: "food",
  dinning: "food",
  Retreat: "retreat",
  Teachers: "teachers",
  General: "general",
  Campus: "general",
  "Yoga hall": "general",
  Practice: "general",
};

/**
 * Media tag for a room — short canonical label for library filters.
 *
 * @param name - Room display name
 */
export function roomMediaTag(name: string): string {
  return canonicalizeMediaTag(name);
}

/**
 * Resolves a legacy or current tag to the canonical short media tag.
 *
 * @param tag - Stored media tag
 */
export function canonicalizeRoomMediaTag(tag: string): string {
  return canonicalizeMediaTag(tag);
}
