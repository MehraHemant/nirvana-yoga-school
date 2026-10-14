import type {
  VideosModule,
  VideosModuleItem,
} from "@/content/types/page-modules";

/**
 * Empty videos module scaffold for admin and public defaults.
 * No seed clips — editors add YouTube URLs or Cloudinary uploads in CMS.
 */
export function createEmptyVideosModule(): VideosModule {
  return {
    live: true,
    eyebrow: "",
    title: "",
    description: "",
    youtubeUrls: [],
    items: [],
  };
}

/**
 * Normalizes one playlist item. Keeps empty draft rows for admin editing;
 * public resolvers skip items without a playable URL.
 *
 * @param value - Raw item from CMS JSON
 */
export function normalizeVideosModuleItem(
  value: Partial<VideosModuleItem> | null | undefined,
): VideosModuleItem | null {
  if (!value || (value.type !== "youtube" && value.type !== "cloudinary")) {
    return null;
  }

  const title =
    typeof value.title === "string" && value.title.trim()
      ? value.title.trim()
      : undefined;

  if (value.type === "youtube") {
    return {
      type: "youtube",
      youtubeUrl:
        typeof value.youtubeUrl === "string" ? value.youtubeUrl.trim() : "",
      title,
    };
  }

  return {
    type: "cloudinary",
    cloudinaryUrl:
      typeof value.cloudinaryUrl === "string" ? value.cloudinaryUrl.trim() : "",
    publicId:
      typeof value.publicId === "string" && value.publicId.trim()
        ? value.publicId.trim()
        : undefined,
    title,
    thumbnailUrl:
      typeof value.thumbnailUrl === "string" && value.thumbnailUrl.trim()
        ? value.thumbnailUrl.trim()
        : undefined,
    durationSeconds:
      typeof value.durationSeconds === "number" &&
      Number.isFinite(value.durationSeconds) &&
      value.durationSeconds >= 0
        ? Math.round(value.durationSeconds)
        : undefined,
  };
}

/**
 * Derives legacy `youtubeUrls` from mixed-source items.
 *
 * @param items - Normalized playlist items
 */
export function youtubeUrlsFromItems(items: VideosModuleItem[]): string[] {
  return items
    .filter((item) => item.type === "youtube" && item.youtubeUrl)
    .map((item) => item.youtubeUrl as string);
}

/**
 * Ensures a usable videos module, filling missing fields with empty defaults.
 * Legacy docs with only `youtubeUrls` are promoted to `items`.
 *
 * @param value - Partial or missing videos module from `page_modules`
 */
export function normalizeVideosModule(
  value: VideosModule | null | undefined,
): VideosModule {
  const empty = createEmptyVideosModule();
  if (!value) return empty;

  const rawItems = Array.isArray(value.items) ? value.items : [];
  let items = rawItems
    .map((item) => normalizeVideosModuleItem(item))
    .filter((item): item is VideosModuleItem => item !== null);

  const legacyUrls = Array.isArray(value.youtubeUrls)
    ? value.youtubeUrls.filter(
        (url): url is string => typeof url === "string" && Boolean(url.trim()),
      )
    : [];

  // Promote legacy YouTube-only documents when `items` is empty.
  if (items.length === 0 && legacyUrls.length > 0) {
    items = legacyUrls.map((youtubeUrl) => ({
      type: "youtube" as const,
      youtubeUrl: youtubeUrl.trim(),
    }));
  }

  return {
    ...empty,
    ...value,
    items,
    youtubeUrls: youtubeUrlsFromItems(items),
  };
}

/**
 * Whether the module has at least one playable clip.
 *
 * @param module - Normalized videos module
 */
export function videosModuleHasClips(module: VideosModule): boolean {
  return module.items.some(
    (item) =>
      (item.type === "youtube" && Boolean(item.youtubeUrl?.trim())) ||
      (item.type === "cloudinary" && Boolean(item.cloudinaryUrl?.trim())),
  );
}
