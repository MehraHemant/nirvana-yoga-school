"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { HeroFrame } from "@/components/hero";
import { Container, Heading, MediaLightbox } from "@/components/ui";
import type { CourseImageDetail } from "@/content/types";
import type { CmsInteractiveImage } from "@/content/types/cms-image";
import {
  cmsImageAlt,
  cmsImageCursorClass,
  cmsImageUrl,
  handleCmsImageClick,
  normalizeCmsImage,
} from "@/content/types/cms-image";
import { ChevronLeft, ChevronRight, Play } from "@/icons";
import {
  cloudinaryHeroUrl,
  cloudinarySizedUrl,
} from "@/lib/cdn/cloudinary-thumb-url";
import { parseYouTubeId, YOUTUBE_METADATA_REGISTRY } from "@/lib/youtube";

// ─── Props ───────────────────────────────────────────────────────────────────

interface CourseHeroProps {
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

type HeroPhoto = CmsInteractiveImage & {
  tag?: string;
  pictured?: string;
};

const HERO_MAIN_WIDTH = 1280;
const HERO_BENTO_WIDTH = 480;
const HERO_THUMB_WIDTH = 160;
const HERO_PRELOAD_WIDTH = 640;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ytThumb(id: string) {
  return (
    YOUTUBE_METADATA_REGISTRY[id]?.thumbnail_url ??
    `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  );
}

function ytTitle(id: string, fallbackIdx: number) {
  const t = YOUTUBE_METADATA_REGISTRY[id]?.title;
  if (!t) return `Video ${fallbackIdx + 1}`;
  return t.length > 60 ? `${t.slice(0, 57)}…` : t;
}

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

function MaximizeIcon() {
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

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * CourseHero renders the main visual presentation area for residential courses,
 * featuring titles, badges, dynamic metadata tables, and an interactive media filmstrip.
 *
 * @param props - Component properties conforming to CourseHeroProps
 */
export default function CourseHero({
  title,
  image,
  heroImages,
  imageDetails,
  videos,
  fee,
  duration,
  certification,
}: CourseHeroProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const stripRef = useRef<HTMLDivElement>(null);
  const imageMetaByUrl = useMemo(
    () => buildImageMetaMap(imageDetails),
    [imageDetails],
  );

  // Filmstrip + main stage: hero module images only (CMS / DB). No supplemental stock.
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
      if (url) {
        all.push(toHeroPhoto(image, imageMetaByUrl));
      }
    }
    return all;
  }, [heroImages, image, imageMetaByUrl]);

  // ── Build video list (URLs or legacy bare IDs → embed IDs) ─────────────────
  const videoIds = useMemo(
    () =>
      (videos ?? [])
        .map((entry) => parseYouTubeId(entry.trim()))
        .filter((id): id is string => Boolean(id)),
    [videos],
  );

  // ── All items for lightbox ────────────────────────────────────────────────
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

  // ── State ─────────────────────────────────────────────────────────────────
  const [photoIdx, setPhotoIdx] = useState(0);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const stripTotal = photos.length + videoIds.length;
  const activeStripIndex = activeVideoId
    ? photos.length + Math.max(0, videoIds.indexOf(activeVideoId))
    : photoIdx;

  // ── Auto-advance ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReduced || hovered || activeVideoId || photos.length <= 1)
      return;
    const t = setInterval(
      () => setPhotoIdx((p) => (p + 1) % photos.length),
      2000,
    );
    return () => clearInterval(t);
  }, [prefersReduced, hovered, activeVideoId, photos.length]);

  // ── Preload adjacent images (sized URLs — avoid competing with LCP) ───────
  useEffect(() => {
    if (photos.length <= 1) return;
    const toLoad = [
      (photoIdx + 1) % photos.length,
      (photoIdx + 2) % photos.length,
      (photoIdx - 1 + photos.length) % photos.length,
    ];
    for (const i of new Set(toLoad)) {
      const url = photos[i]?.url;
      if (url) {
        const img = new window.Image();
        img.src = cloudinarySizedUrl(url, HERO_PRELOAD_WIDTH);
      }
    }
  }, [photoIdx, photos]);

  // ── Filmstrip centering ───────────────────────────────────────────────────
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const thumb = el.children[activeStripIndex] as HTMLElement | undefined;
    if (!thumb) return;
    el.scrollTo({
      left: Math.max(
        0,
        thumb.offsetLeft - el.clientWidth / 2 + thumb.offsetWidth / 2,
      ),
      behavior: "auto",
    });
  }, [activeStripIndex]);

  // ── Lightbox keyboard nav ─────────────────────────────────────────────────
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight")
        setLightboxIdx((i) => (i + 1) % allItems.length);
      if (e.key === "ArrowLeft")
        setLightboxIdx((i) => (i - 1 + allItems.length) % allItems.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, allItems.length]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const prev = () => {
    setActiveVideoId(null);
    setPhotoIdx((p) => (p - 1 + photos.length) % photos.length);
  };
  const next = () => {
    setActiveVideoId(null);
    setPhotoIdx((p) => (p + 1) % photos.length);
  };
  const pickPhoto = (i: number) => {
    setActiveVideoId(null);
    setPhotoIdx(i);
    setHovered(true);
  };
  const playVideo = (id: string) => {
    setActiveVideoId(id);
    setHovered(true);
  };
  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  };

  const onPhotoActivate = (idx: number) => {
    const photo = photos[idx];
    if (!photo) return;
    handleCmsImageClick(photo, () => openLightbox(idx));
  };

  // ── Bento cell definitions ────────────────────────────────────────────────
  // 4-col, 2-row grid: large featured (2×2) + 4 smaller cells
  const smallCells: {
    offset: number;
    type: "photo" | "video";
    vidIdx: number;
  }[] = [
    { offset: 1, type: "photo", vidIdx: -1 },
    { offset: 0, type: "video", vidIdx: 0 },
    { offset: 2, type: "photo", vidIdx: -1 },
    { offset: 1, type: "video", vidIdx: 1 },
  ];

  const hasMeta = !!(duration || certification || fee);
  const activePhoto = photos[photoIdx] ?? photos[0];
  const activePictured = activePhoto?.pictured;
  const activeAlt = activePhoto
    ? cmsImageAlt(activePhoto, activePictured ?? title)
    : title;
  const activeClickAction = activePhoto?.clickAction ?? "fullscreen";

  return (
    <HeroFrame className="course-hero-section relative flex h-svh min-h-svh w-full shrink-0 flex-col overflow-hidden bg-white">
      {/* Fixed max header height — avoids layout shift when the bar shrinks on scroll */}
      <div className="h-[4.75rem] shrink-0 md:h-[5.5rem]" aria-hidden="true" />
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_10%_0%,rgb(166_181_162/0.12),transparent_55%)]"
        aria-hidden="true"
      />

      <Container
        size="2xl"
        className="relative flex h-full min-h-0 flex-col overflow-hidden py-2 md:py-3"
      >
        {/* ── Header row ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0, 0, 1] }}
          className="mb-1.5 mt-2 flex w-full shrink-0 flex-col items-center justify-center sm:mb-2 md:mb-3"
        >
          <Heading
            as="h1"
            size="h2"
            className="line-clamp-3 px-1 text-center font-medium text-lg! leading-snug sm:text-xl! md:line-clamp-2 md:text-3xl! lg:text-4xl!"
          >
            {title}
          </Heading>
        </motion.div>

        {/* ── Bento grid ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0, 0, 1] }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="grid min-h-0 flex-1 grid-cols-1 grid-rows-1 gap-2 overflow-hidden rounded-2xl sm:rounded-3xl md:grid-cols-4 md:grid-rows-2 md:gap-2.5"
        >
          {/* ── Large featured cell ─────────────────────────────────────── */}
          <div className="relative h-full min-h-0 overflow-hidden rounded-2xl bg-sand/70 md:col-span-2 md:row-span-2 md:rounded-3xl">
            <AnimatePresence mode="wait" initial={false}>
              {activeVideoId ? (
                <motion.iframe
                  key={`v-${activeVideoId}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={ytTitle(activeVideoId, 0)}
                  allow="autoplay; fullscreen; encrypted-media"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0 bg-ink"
                />
              ) : activePhoto ? (
                <motion.div
                  key={photoIdx}
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: prefersReduced ? undefined : 0 }}
                  transition={{ duration: prefersReduced ? 0 : 0.2 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={cloudinaryHeroUrl(activePhoto.url, HERO_MAIN_WIDTH)}
                    alt={activeAlt}
                    fill
                    priority={photoIdx === 0}
                    fetchPriority={photoIdx === 0 ? "high" : "auto"}
                    loading={photoIdx === 0 ? "eager" : "lazy"}
                    sizes="(max-width:768px)100vw,50vw"
                    className="object-cover object-center"
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Course meta — frosted overlay on main photo */}
            {hasMeta && !activeVideoId && (
              <div
                className={`pointer-events-none absolute right-2 left-2 z-20 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl bg-ink/45 px-3 py-2 backdrop-blur-md ring-1 ring-white/10 sm:right-auto sm:left-3 sm:flex-nowrap sm:gap-3 sm:px-4 ${
                  activePictured
                    ? "bottom-[5.75rem] sm:bottom-auto sm:top-3"
                    : "bottom-14 sm:bottom-auto sm:top-3"
                }`}
              >
                {duration && (
                  <div className="min-w-0">
                    <p className="text-[8px] font-semibold uppercase tracking-widest text-white/65 sm:text-[9px]">
                      Duration
                    </p>
                    <p className="truncate text-[11px] font-semibold text-white sm:text-xs">
                      {duration}
                    </p>
                  </div>
                )}
                {certification && (
                  <>
                    <div
                      className="hidden h-6 w-px bg-white/25 sm:block"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-[8px] font-semibold uppercase tracking-widest text-white/65 sm:text-[9px]">
                        Certification
                      </p>
                      <p className="truncate text-[11px] font-semibold text-white sm:text-xs">
                        {certification}
                      </p>
                    </div>
                  </>
                )}
                {fee && (
                  <>
                    <div
                      className="hidden h-6 w-px bg-white/25 sm:block"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-[8px] font-semibold uppercase tracking-widest text-white/65 sm:text-[9px]">
                        Fee
                      </p>
                      <p className="truncate text-[11px] font-semibold text-white sm:text-xs">
                        {fee}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Image details — pictured caption */}
            {activePictured && !activeVideoId && (
              <div
                id="imageDetails"
                className="pointer-events-none absolute right-2 bottom-12 left-2 z-20 sm:bottom-14 sm:left-3 sm:max-w-md flex"
              >
                <p className="rounded-2xl bg-ink/55 px-3 py-2 text-[11px] leading-snug text-white backdrop-blur-md ring-1 ring-white/10 sm:px-3.5 sm:py-2.5 sm:text-xs">
                  <span className="type-eyebrow block text-[8px] text-white/65 sm:text-[9px]">
                    Pictured
                  </span>
                  <span className="mt-0.5 block font-medium">
                    {activePictured}
                  </span>
                </p>
              </div>
            )}

            {/* Back-to-photos button (shown while video plays) */}
            {activeVideoId && (
              <button
                type="button"
                onClick={() => {
                  setActiveVideoId(null);
                  setHovered(false);
                }}
                className="absolute top-3 left-3 z-20 flex cursor-pointer items-center gap-1.5 rounded-full bg-ink/60 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-ink/80"
              >
                ← Photos
              </button>
            )}

            {/* Nav controls (shown while browsing photos) */}
            {!activeVideoId && (
              <>
                {/* Full-cover click → lightbox / redirect / none */}
                {activeClickAction !== "none" ? (
                  <button
                    type="button"
                    onClick={() => onPhotoActivate(photoIdx)}
                    className={`absolute inset-0 z-10 ${cmsImageCursorClass(activeClickAction)}`}
                    aria-label={
                      activeClickAction === "redirect"
                        ? `Open link for ${activeAlt}`
                        : `View photo ${photoIdx + 1} fullscreen`
                    }
                  />
                ) : null}

                {/* Bottom control bar — always visible */}
                <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between bg-linear-to-t from-ink/35 to-transparent px-2.5 pb-2.5 pt-8 sm:px-3 sm:pb-3 sm:pt-10">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prev();
                      }}
                      className="cursor-pointer rounded-full bg-white/85 p-2 text-ink/70 shadow-soft backdrop-blur-sm transition-colors hover:bg-white hover:text-ink sm:p-1.5"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        next();
                      }}
                      className="cursor-pointer rounded-full bg-white/85 p-2 text-ink/70 shadow-soft backdrop-blur-sm transition-colors hover:bg-white hover:text-ink sm:p-1.5"
                      aria-label="Next photo"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <span className="rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] tabular-nums text-muted shadow-soft backdrop-blur-sm sm:px-3 sm:text-[11px]">
                    {stripTotal > 0 ? activeStripIndex + 1 : 0} / {stripTotal}
                  </span>
                </div>

                {/* Expand to lightbox — only when fullscreen is allowed */}
                {activeClickAction === "fullscreen" ? (
                  <button
                    type="button"
                    onClick={() => onPhotoActivate(photoIdx)}
                    className="absolute top-2.5 right-2.5 z-20 cursor-pointer rounded-full bg-white/80 p-2 text-ink/50 backdrop-blur-sm transition-colors hover:text-ink sm:top-3 sm:right-3 sm:p-1.5"
                    aria-label="Open fullscreen"
                  >
                    <MaximizeIcon />
                  </button>
                ) : null}
              </>
            )}
          </div>

          {/* ── 4 small cells ─────────────────────────────────────────── */}
          {smallCells.map((cell, ci) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: bento cells, stable order
              key={ci}
              className="relative hidden min-h-0 overflow-hidden rounded-2xl md:block"
            >
              {cell.type === "video" && videoIds[cell.vidIdx] ? (
                /* Video cell */
                <button
                  type="button"
                  onClick={() => playVideo(videoIds[cell.vidIdx])}
                  className={`group h-full w-full overflow-hidden rounded-2xl bg-ink ${
                    activeVideoId === videoIds[cell.vidIdx]
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  aria-label={`Play: ${ytTitle(videoIds[cell.vidIdx], cell.vidIdx)}`}
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={ytThumb(videoIds[cell.vidIdx])}
                      alt={ytTitle(videoIds[cell.vidIdx], cell.vidIdx)}
                      fill
                      sizes="18vw"
                      className="object-cover opacity-70 transition-opacity group-hover:opacity-85"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/25 transition-colors group-hover:bg-ink/15">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full shadow-soft backdrop-blur-sm transition-all group-hover:scale-105 ${
                          activeVideoId === videoIds[cell.vidIdx]
                            ? "bg-primary"
                            : "bg-white/90"
                        }`}
                      >
                        <Play
                          size={13}
                          className={
                            activeVideoId === videoIds[cell.vidIdx]
                              ? "fill-white text-white"
                              : "fill-ink/70 text-ink/70"
                          }
                        />
                      </span>
                      <p className="mx-2 line-clamp-2 text-center text-[9px] font-medium leading-tight text-white md:text-[10px]">
                        {ytTitle(videoIds[cell.vidIdx], cell.vidIdx)}
                      </p>
                    </div>
                    <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                      {activeVideoId === videoIds[cell.vidIdx]
                        ? "Playing"
                        : "Video"}
                    </span>
                  </div>
                </button>
              ) : cell.type === "photo" ? (
                /* Photo cell */
                (() => {
                  const cellIdx = (photoIdx + cell.offset) % photos.length;
                  const cellPhoto = photos[cellIdx];
                  const cellAction = cellPhoto?.clickAction ?? "fullscreen";
                  const cellAlt = cellPhoto
                    ? cmsImageAlt(cellPhoto, title)
                    : title;
                  return (
                    <button
                      type="button"
                      onClick={() => onPhotoActivate(cellIdx)}
                      disabled={cellAction === "none"}
                      className={`group relative h-full w-full overflow-hidden rounded-2xl ${cmsImageCursorClass(cellAction)} disabled:cursor-default`}
                      aria-label={
                        cellAction === "none"
                          ? cellAlt
                          : cellAction === "redirect"
                            ? `Open link for ${cellAlt}`
                            : `View ${cellAlt} fullscreen`
                      }
                    >
                      <Image
                        src={cloudinarySizedUrl(
                          cellPhoto.url,
                          HERO_BENTO_WIDTH,
                        )}
                        alt={cellAlt}
                        fill
                        loading="lazy"
                        sizes="18vw"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </button>
                  );
                })()
              ) : (
                /* Fallback: extra photo when no video available */
                <div className="relative h-full w-full overflow-hidden rounded-2xl bg-sand/60">
                  <Image
                    src={cloudinarySizedUrl(
                      photos[(photoIdx + cell.offset) % photos.length].url,
                      HERO_BENTO_WIDTH,
                    )}
                    alt={title}
                    fill
                    loading="lazy"
                    sizes="18vw"
                    className="object-cover object-center"
                  />
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* ── Bottom filmstrip (photos + videos) ───────────────────────── */}
        {stripTotal > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="shrink-0 overflow-hidden rounded-xl bg-white/50 px-2 pt-2 backdrop-blur-sm sm:rounded-2xl"
          >
            <div
              ref={stripRef}
              className="no-scrollbar flex touch-pan-x gap-1.5 overflow-x-auto py-2 px-2 scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch] sm:gap-2"
            >
              {photos.map((photo, i) => {
                const isActive = i === photoIdx && !activeVideoId;
                return (
                  <button
                    key={photo.url}
                    type="button"
                    onClick={() => pickPhoto(i)}
                    className={`relative h-14 w-[4.25rem] shrink-0 snap-start cursor-pointer overflow-hidden rounded-lg transition-all duration-200 sm:h-14 sm:w-20 sm:rounded-xl border-2 ${
                      isActive
                        ? "border-primary"
                        : "border-ink/8 hover:border-primary/40"
                    }`}
                    aria-label={`Photo ${i + 1}`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <Image
                      src={cloudinarySizedUrl(photo.url, HERO_THUMB_WIDTH)}
                      alt=""
                      fill
                      loading="lazy"
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
              {videoIds.map((id, vi) => {
                const isActive = activeVideoId === id;
                return (
                  <button
                    key={`video-${id}`}
                    type="button"
                    onClick={() => playVideo(id)}
                    className={`relative h-14 w-[4.25rem] shrink-0 snap-start cursor-pointer overflow-hidden rounded-lg transition-all duration-200 sm:h-14 sm:w-20 sm:rounded-xl border-2 ${
                      isActive
                        ? "border-primary"
                        : "border-ink/8 hover:border-primary/40"
                    }`}
                    aria-label={`Video ${vi + 1}: ${ytTitle(id, vi)}`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <Image
                      src={ytThumb(id)}
                      alt=""
                      fill
                      loading="lazy"
                      sizes="80px"
                      className="object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/25">
                      <Play size={12} className="fill-white text-white" />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-px overflow-hidden rounded-full bg-ink/8">
              <motion.div
                className="h-full bg-accent/55"
                animate={{
                  width:
                    stripTotal > 1
                      ? `${(activeStripIndex / (stripTotal - 1)) * 100}%`
                      : "100%",
                }}
                transition={{ duration: 1.92, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </Container>

      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={allItems}
        activeIndex={lightboxIdx}
        onChangeActiveIndex={setLightboxIdx}
        title={title}
      />
    </HeroFrame>
  );
}
