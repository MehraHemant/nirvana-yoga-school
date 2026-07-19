import type {
  GalleryModule,
  GallerySectionMeta,
  GalleryVideoItem,
} from "@/content/types/page-modules";
import type { SitePageGalleryImage } from "@/content/types/site-page";
import { MEDIA_TAG_PRESETS } from "@/lib/cdn/media-tags";

/** Human labels for known venue gallery category ids. */
export const GALLERY_CATEGORY_LABELS: Record<string, string> = {
  yogahall: "Yoga Hall",
  dinning: "Dining",
  private: "Private Room",
  "2 shared": "2-Shared Room",
  "3 shared": "3-Shared Room",
  "4 shared": "4-Shared Dorm",
  premisis: "Premises",
  practice: "Practice",
  accommodation: "Rooms & Stay",
  campus: "Campus",
};

/** Map media-library tags → gallery category ids. */
export const MEDIA_TAG_TO_GALLERY_CATEGORY: Record<string, string> = {
  "Yoga hall": "yogahall",
  Dining: "dinning",
  Food: "dinning",
  "Private room": "private",
  "2 shared room": "2 shared",
  "3 shared room": "3 shared",
  "4 shared room": "4 shared",
  Campus: "premisis",
  Retreat: "premisis",
  Practice: "practice",
};

export type ResolvedGallerySection = GallerySectionMeta & {
  images: SitePageGalleryImage[];
};

/**
 * Returns a display label for a gallery category id.
 *
 * @param category - Category id
 */
export function galleryCategoryLabel(category: string): string {
  return GALLERY_CATEGORY_LABELS[category] ?? category;
}

/**
 * Maps a media tag (or free text) to a gallery category id.
 *
 * @param tag - Media library tag
 */
export function galleryCategoryFromTag(tag: string | undefined): string {
  if (!tag) return "campus";
  return MEDIA_TAG_TO_GALLERY_CATEGORY[tag] ?? tag.toLowerCase().trim();
}

/**
 * Tags useful when filtering the media library for venue galleries.
 */
export function galleryMediaTagOptions(): string[] {
  return [...MEDIA_TAG_PRESETS];
}

/**
 * Extracts a YouTube video id from a watch URL or bare id.
 *
 * @param value - Watch URL or id
 */
export function extractYouTubeId(value: string): string {
  const trimmed = value.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "") || trimmed;
    }
    return url.searchParams.get("v") ?? trimmed;
  } catch {
    return trimmed;
  }
}

/**
 * Groups flat gallery images into ordered sections for admin + public UI.
 *
 * @param gallery - Gallery module (or image list)
 */
export function resolveGallerySections(
  gallery:
    | Pick<GalleryModule, "images" | "sectionOrder">
    | SitePageGalleryImage[]
    | null
    | undefined,
): ResolvedGallerySection[] {
  const images = Array.isArray(gallery)
    ? gallery
    : (gallery?.images ?? []).filter((image) => image.type !== "video");
  const sectionOrder = Array.isArray(gallery) ? undefined : gallery?.sectionOrder;

  if (images.length === 0) return sectionOrder?.map((section) => ({
    ...section,
    images: [],
  })) ?? [];

  const byCategory = new Map<string, SitePageGalleryImage[]>();
  for (const image of images) {
    const key = image.category || "campus";
    const list = byCategory.get(key) ?? [];
    list.push(image);
    byCategory.set(key, list);
  }

  if (sectionOrder?.length) {
    const used = new Set<string>();
    const ordered: ResolvedGallerySection[] = sectionOrder.map((section) => {
      used.add(section.id);
      return {
        ...section,
        label: section.label || galleryCategoryLabel(section.id),
        images: byCategory.get(section.id) ?? [],
      };
    });
    for (const [id, sectionImages] of byCategory) {
      if (used.has(id)) continue;
      ordered.push({
        id,
        label: galleryCategoryLabel(id),
        images: sectionImages,
      });
    }
    return ordered;
  }

  return Array.from(byCategory.entries()).map(([id, sectionImages]) => ({
    id,
    label: galleryCategoryLabel(id),
    images: sectionImages,
  }));
}

/**
 * Flattens ordered sections back into the gallery image list.
 *
 * @param sections - Ordered sections with images
 */
export function flattenGallerySections(
  sections: ResolvedGallerySection[],
): SitePageGalleryImage[] {
  return sections.flatMap((section) =>
    section.images.map((image) => ({
      ...image,
      category: section.id,
      type: image.type ?? "image",
    })),
  );
}

/**
 * Builds sectionOrder metadata from resolved sections.
 *
 * @param sections - Resolved sections
 */
export function sectionOrderFromResolved(
  sections: ResolvedGallerySection[],
): GallerySectionMeta[] {
  return sections.map(({ id, label, description }) => ({
    id,
    label,
    description,
  }));
}

/**
 * Normalizes gallery videos to YouTube ids.
 *
 * @param videos - Raw video entries
 */
export function normalizeGalleryVideos(
  videos: GalleryVideoItem[] | undefined,
): GalleryVideoItem[] {
  return (videos ?? [])
    .map((video) => ({
      ...video,
      url: extractYouTubeId(video.url),
    }))
    .filter((video) => Boolean(video.url));
}

/**
 * Empty gallery module scaffold for admin.
 */
export function createEmptyGalleryModule(): GalleryModule {
  return {
    live: true,
    eyebrow: "Venue",
    title: "Campus gallery",
    description:
      "Explore yoga halls, rooms, dining, and the peaceful ashram grounds.",
    images: [],
    sectionOrder: [],
    videos: [],
  };
}
