"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { CourseImageDetail } from "@/content/types";
import type {
  CmsInteractiveImage,
  ImageClickAction,
} from "@/content/types/cms-image";
import {
  cmsImageAlt,
  cmsImageUrl,
  handleCmsImageClick,
  normalizeCmsImage,
} from "@/content/types/cms-image";
import {
  cloudinaryHeroUrl,
  cloudinarySizedUrl,
} from "@/lib/cdn/cloudinary-thumb-url";
import {
  parseYouTubeId,
  youTubeThumbnailUrl,
  YOUTUBE_METADATA_REGISTRY,
} from "@/lib/youtube";

// ─── Props ───────────────────────────────────────────────────────────────────

export interface CourseHeroProps {
  title: string;
  subtitle?: string;
  image: string | CmsInteractiveImage;
  variant?: "course" | "page";
  eyebrow?: string;
  duration?: string;
  level?: string;
  certification?: string;
  fee?: string;
  certBadge?: string;
  /** Filmstrip + main gallery — hero module images only */
  heroImages?: Array<string | CmsInteractiveImage>;
  imageDetails?: CourseImageDetail[];
  /** YouTube URLs (or legacy bare video IDs) */
  videos?: string[];
  metaItems?: { label: string; value: string }[];
  ctaPrimary?: string;
  ctaSecondary?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryHref?: string;
}

/** CMS image enriched with the caption metadata a hero displays. */
export type HeroPhoto = CmsInteractiveImage & {
  tag?: string;
  pictured?: string;
};

/** Cloudinary width for the main stage image. */
export const HERO_MAIN_WIDTH = 1600;
/** Cloudinary width for filmstrip / grid thumbnails. */
export const HERO_THUMB_WIDTH = 320;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolves a YouTube thumbnail URL (maxres), preferring registry metadata.
 *
 * @param id - YouTube video ID
 * @returns Thumbnail URL
 */
export function ytThumb(id: string): string {
  return (
    YOUTUBE_METADATA_REGISTRY[id]?.thumbnail_url ?? youTubeThumbnailUrl(id)
  );
}

/**
 * Resolves a truncated YouTube title, falling back to a positional label.
 *
 * @param id - YouTube video ID
 * @param fallbackIdx - Zero-based index used for the fallback label
 * @returns Display title (max 60 chars)
 */
export function ytTitle(id: string, fallbackIdx: number): string {
  const t = YOUTUBE_METADATA_REGISTRY[id]?.title;
  if (!t) return `Video ${fallbackIdx + 1}`;
  return t.length > 60 ? `${t.slice(0, 57)}…` : t;
}

/** Expand-to-fullscreen glyph sized for hero control buttons. */
export function MaximizeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

/**
 * Indexes CMS image details by URL for quick lookup while building photos.
 *
 * @param imageDetails - Optional CMS image detail rows
 * @returns Map of URL to caption / click metadata
 */
function buildImageMetaMap(imageDetails?: CourseImageDetail[]) {
  const map = new Map<
    string,
    {
      tag?: string;
      pictured?: string;
      alt?: string;
      clickAction?: CourseImageDetail["clickAction"];
      redirectUrl?: string;
    }
  >();
  for (const detail of imageDetails ?? []) {
    if (!detail.url) continue;
    map.set(detail.url, {
      tag: detail.tag,
      pictured: detail.pictured,
      alt: detail.alt,
      clickAction: detail.clickAction,
      redirectUrl: detail.redirectUrl,
    });
  }
  return map;
}

/**
 * Merges a raw hero image with its CMS detail row into a HeroPhoto.
 *
 * @param input - URL string or interactive image object
 * @param metaByUrl - Map produced by buildImageMetaMap
 * @returns Normalized hero photo
 */
function toHeroPhoto(
  input: string | CmsInteractiveImage,
  metaByUrl: ReturnType<typeof buildImageMetaMap>,
): HeroPhoto {
  const base = normalizeCmsImage(input);
  const meta = metaByUrl.get(base.url);
  return {
    ...base,
    alt: base.alt || meta?.alt || meta?.pictured || "",
    clickAction: base.clickAction ?? meta?.clickAction ?? "fullscreen",
    redirectUrl: base.redirectUrl || meta?.redirectUrl || "",
    tag: meta?.tag,
    pictured: meta?.pictured,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Owns all course hero gallery state and derived media so variant components
 * stay purely visual: photo/video lists, the active selection, and lightbox
 * wiring (photos first, then videos, so indexes are shared).
 *
 * @param props - The hero props a variant received
 * @returns Media lists, active selection, handlers, and spreadable lightbox props
 */
export function useHeroGallery({
  title,
  image,
  heroImages,
  imageDetails,
  videos,
  duration,
  certification,
  fee,
}: CourseHeroProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const [photoIdx, setPhotoIdx] = useState(0);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  /** True while the pointer is pressed on the gallery (pauses autoplay). */
  const [isInteracting, setInteracting] = useState(false);

  const imageMetaByUrl = useMemo(
    () => buildImageMetaMap(imageDetails),
    [imageDetails],
  );

  // Hero module images only (CMS / DB), deduped, with the single `image` fallback.
  const photos = useMemo<HeroPhoto[]>(() => {
    const seen = new Set<string>();
    const all: HeroPhoto[] = [];
    for (const src of heroImages ?? []) {
      const url = cmsImageUrl(src);
      if (url && !seen.has(url)) {
        seen.add(url);
        all.push(toHeroPhoto(src, imageMetaByUrl));
      }
    }
    if (all.length === 0 && image) {
      const url = cmsImageUrl(image);
      if (url) all.push(toHeroPhoto(image, imageMetaByUrl));
    }
    return all;
  }, [heroImages, image, imageMetaByUrl]);

  // URLs or legacy bare IDs → embed IDs
  const videoIds = useMemo(
    () =>
      (videos ?? [])
        .map((entry) => parseYouTubeId(entry.trim()))
        .filter((id): id is string => Boolean(id)),
    [videos],
  );

  // Photos first, then videos — openLightbox(photos.length + videoIndex) hits a video.
  const allItems = useMemo(
    () => [
      ...photos.map((photo) => ({
        type: "image" as const,
        url: photo.url,
        tag: photo.tag,
        pictured: photo.pictured,
      })),
      ...videoIds.map((url) => ({ type: "video" as const, url })),
    ],
    [photos, videoIds],
  );

  const activePhoto = photos[photoIdx] ?? photos[0];
  const activePictured = activePhoto?.pictured;
  const activeAlt = activePhoto
    ? cmsImageAlt(activePhoto, activePictured ?? title)
    : title;
  const activeClickAction: ImageClickAction =
    activePhoto?.clickAction ?? "fullscreen";

  /** Shows the photo at `index` on the stage, leaving any playing video. */
  const showPhoto = (index: number) => {
    setActiveVideoId(null);
    setPhotoIdx(index);
  };

  /** Moves the stage by `delta` photos, wrapping at both ends. */
  const stepPhoto = (delta: number) => {
    if (photos.length === 0) return;
    setActiveVideoId(null);
    setPhotoIdx((p) => (p + delta + photos.length) % photos.length);
  };

  /** Swaps the stage to an inline YouTube player. */
  const playVideo = (id: string) => setActiveVideoId(id);

  /** Returns the stage to photos. */
  const clearVideo = () => setActiveVideoId(null);

  /** Opens the lightbox at a combined photos-then-videos index. */
  const openLightbox = (index: number) => {
    setLightboxIdx(index);
    setLightboxOpen(true);
  };

  /** Runs the photo's CMS click action, defaulting to the lightbox. */
  const activatePhoto = (index: number) => {
    const photo = photos[index];
    if (!photo) return;
    handleCmsImageClick(photo, () => openLightbox(index));
  };

  /** Main-stage source for a photo. */
  const photoSrc = (photo: HeroPhoto) =>
    cloudinaryHeroUrl(photo.url, HERO_MAIN_WIDTH);

  /** Thumbnail source for a photo. */
  const thumbSrc = (photo: HeroPhoto) =>
    cloudinarySizedUrl(photo.url, HERO_THUMB_WIDTH);

  /**
   * Auto-advances the main-stage photo every 5s. Pauses for reduced motion,
   * a single photo, an inline video, an open lightbox, a hidden tab, or an
   * active pointer press. Depends on `photoIdx` so manual next/prev / thumb
   * clicks reset the timer. Clears the interval on unmount.
   */
  useEffect(() => {
    if (
      prefersReduced ||
      photos.length <= 1 ||
      activeVideoId ||
      lightboxOpen ||
      isInteracting
    ) {
      return;
    }

    let intervalId: number | undefined;

    const stop = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const start = () => {
      stop();
      intervalId = window.setInterval(() => {
        setPhotoIdx((p) => (p + 1) % photos.length);
      }, 5000);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [
    prefersReduced,
    photos.length,
    activeVideoId,
    lightboxOpen,
    isInteracting,
    photoIdx,
  ]);

  return {
    photos,
    videoIds,
    mediaCount: photos.length + videoIds.length,
    photoIdx,
    activePhoto,
    activeAlt,
    activePictured,
    activeClickAction,
    activeVideoId,
    hasMeta: !!(duration || certification || fee),
    prefersReduced,
    setInteracting,
    showPhoto,
    stepPhoto,
    playVideo,
    clearVideo,
    openLightbox,
    activatePhoto,
    photoSrc,
    thumbSrc,
    lightboxProps: {
      isOpen: lightboxOpen,
      onClose: () => setLightboxOpen(false),
      items: allItems,
      activeIndex: lightboxIdx,
      onChangeActiveIndex: setLightboxIdx,
      title,
    },
  };
}
