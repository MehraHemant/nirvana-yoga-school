"use client";

import { motion, useReducedMotion } from "framer-motion";
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

const HERO_MAIN_WIDTH = 1600;
const HERO_THUMB_WIDTH = 160;

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
  const photoStripRef = useRef<HTMLDivElement>(null);
  const videoStripRef = useRef<HTMLDivElement>(null);
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
  /** Visible main photo — stays on previous slide until the target image has loaded */
  const [shownPhotoIdx, setShownPhotoIdx] = useState(0);
  const [loadedPhotoUrls, setLoadedPhotoUrls] = useState<Set<string>>(
    () => new Set(),
  );
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoStripOverflow, setVideoStripOverflow] = useState(false);

  const photoStripTotal = photos.length;
  const activeVideoIdx = activeVideoId
    ? Math.max(0, videoIds.indexOf(activeVideoId))
    : -1;

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

  // ── Preload adjacent hero URLs (same transform as main stage) ─────────────
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
        img.src = cloudinaryHeroUrl(url, HERO_MAIN_WIDTH);
      }
    }
  }, [photoIdx, photos]);

  // ── Advance visible slide once target image is ready ──────────────────────
  useEffect(() => {
    const targetUrl = photos[photoIdx]?.url;
    if (targetUrl && loadedPhotoUrls.has(targetUrl)) {
      setShownPhotoIdx(photoIdx);
    }
  }, [photoIdx, photos, loadedPhotoUrls]);

  const markPhotoLoaded = (url: string, index: number) => {
    setLoadedPhotoUrls((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
    if (index === photoIdx) {
      setShownPhotoIdx(index);
    }
  };

  // ── Photo filmstrip centering ─────────────────────────────────────────────
  useEffect(() => {
    const el = photoStripRef.current;
    if (!el) return;
    const thumb = el.children[photoIdx] as HTMLElement | undefined;
    if (!thumb) return;
    el.scrollTo({
      left: Math.max(
        0,
        thumb.offsetLeft - el.clientWidth / 2 + thumb.offsetWidth / 2,
      ),
      behavior: "auto",
    });
  }, [photoIdx]);

  // ── Video filmstrip centering (vertical on desktop) ───────────────────────
  useEffect(() => {
    if (activeVideoIdx < 0) return;
    const el = videoStripRef.current;
    if (!el) return;
    const thumb = el.children[activeVideoIdx] as HTMLElement | undefined;
    if (!thumb) return;
    el.scrollTo({
      top: Math.max(
        0,
        thumb.offsetTop - el.clientHeight / 2 + thumb.offsetHeight / 2,
      ),
      behavior: "auto",
    });
  }, [activeVideoIdx]);

  // ── Track when the video panel has more content to scroll ───────────────
  useEffect(() => {
    const el = videoStripRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setVideoStripOverflow(el.scrollHeight > el.clientHeight + 2);
    };

    checkOverflow();
    el.addEventListener("scroll", checkOverflow, { passive: true });
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", checkOverflow);
      observer.disconnect();
    };
  }, [videoIds.length]);

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

  const hasMeta = !!(duration || certification || fee);

  /** Renders a video card — 16:9 thumb, play icon, and one-line title overlay. */
  const renderVideoThumb = (
    id: string,
    vi: number,
    variant: "desktop" | "mobile",
  ) => {
    const isActive = activeVideoId === id;
    const videoTitle =
      YOUTUBE_METADATA_REGISTRY[id]?.title ?? `Video ${vi + 1}`;
    const isMobile = variant === "mobile";

    return (
      <button
        key={`video-${id}`}
        type="button"
        onClick={() => playVideo(id)}
        className={`group relative shrink-0 cursor-pointer overflow-hidden rounded-xl text-left shadow-soft transition-all duration-300 ${isMobile ? "w-[11.75rem] snap-start sm:w-[12.75rem]" : "w-full"} ${isActive ? "ring-2 ring-primary shadow-md" : "ring-1 ring-ink/10 hover:-translate-y-0.5 hover:ring-primary/40 hover:shadow-md"}`}
        aria-label={`Video ${vi + 1}: ${videoTitle}`}
        aria-current={isActive ? "true" : undefined}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-ink">
          <Image
            src={ytThumb(id)}
            alt=""
            fill
            loading="lazy"
            sizes={isMobile ? "204px" : "(max-width:1280px)224px,256px"}
            className={`object-cover transition-transform duration-500 ${isActive ? "scale-[1.03]" : "group-hover:scale-105"}`}
          />
          <div
            className={`absolute inset-0 transition-colors duration-300 ${isActive ? "bg-primary/20" : "bg-ink/10 group-hover:bg-ink/5"}`}
          />
          <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/35 via-35% to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`flex items-center justify-center rounded-full shadow-soft backdrop-blur-sm transition-all duration-300 ${isMobile ? "h-10 w-10" : "h-11 w-11 lg:h-12 lg:w-12"} ${isActive ? "scale-100 bg-primary ring-4 ring-white/25" : "scale-95 bg-white/95 opacity-95 group-hover:scale-100 group-hover:opacity-100"}`}
            >
              <Play
                size={isMobile ? 14 : 16}
                className={
                  isActive ? "fill-white text-white" : "fill-ink/70 text-ink/70"
                }
              />
            </span>
          </div>
          <p
            className={`absolute inset-x-0 bottom-0 truncate font-semibold leading-tight text-white ${isMobile ? "px-2.5 pb-2.5 text-[10px]" : "px-3 pb-3 text-[11px] lg:text-xs"}`}
          >
            {videoTitle}
          </p>
          {isActive ? (
            <span
              className="absolute top-2 left-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_0_3px_rgba(255,255,255,0.85)]"
              aria-hidden="true"
            />
          ) : null}
        </div>
      </button>
    );
  };
  const activePhoto = photos[photoIdx] ?? photos[0];
  const activePictured = activePhoto?.pictured;
  const activeAlt = activePhoto
    ? cmsImageAlt(activePhoto, activePictured ?? title)
    : title;
  const activeClickAction = activePhoto?.clickAction ?? "fullscreen";

  return (
    <HeroFrame className="course-hero-section relative flex w-full shrink-0 flex-col bg-white md:max-h-dvh md:overflow-hidden">
      {/* Fixed max header height — avoids layout shift when the bar shrinks on scroll */}
      <div className="h-[4.75rem] shrink-0 md:h-[5.5rem]" aria-hidden="true" />
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_10%_0%,rgb(166_181_162/0.12),transparent_55%)]"
        aria-hidden="true"
      />

      <Container
        size="2xl"
        className="relative flex min-h-0 flex-col py-2 md:py-3"
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
            size="none"
            className="line-clamp-3 px-1 text-center text-lg font-bold leading-snug sm:text-xl md:line-clamp-2 md:text-3xl lg:text-4xl"
          >
            {title}
          </Heading>
        </motion.div>

        {/* ── Gallery: main stage + video filmstrip ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0, 0, 1] }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="flex min-h-0 w-full shrink-0 flex-col gap-2"
        >
          <div className="grid min-h-0 w-full grid-cols-1 gap-2 overflow-hidden sm:gap-2.5 md:aspect-[16/10] md:max-h-[calc(100dvh-18rem)] md:grid-cols-[minmax(0,1fr)_auto]">
            {/* ── Large main stage ───────────────────────────────────────── */}
            <div className="relative aspect-4/3 min-h-0 min-w-0 overflow-hidden rounded-2xl bg-sand/70 sm:rounded-3xl md:aspect-auto md:h-full md:max-h-full md:rounded-3xl">
            {activeVideoId ? (
              <motion.iframe
                key={`v-${activeVideoId}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReduced ? 0 : 0.2 }}
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                title={ytTitle(activeVideoId, 0)}
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0 bg-ink"
              />
            ) : (
              photos.map((photo, i) => {
                const isTarget = i === photoIdx;
                const isShown = i === shownPhotoIdx;
                const targetLoaded = loadedPhotoUrls.has(photo.url);
                const visible =
                  (isTarget && targetLoaded) ||
                  (isShown && (!targetLoaded || isTarget));
                const opacityClass = visible ? "opacity-100" : "opacity-0";
                const transitionClass = prefersReduced
                  ? "transition-none"
                  : "transition-opacity duration-300 ease-out";

                return (
                  <Image
                    key={photo.url}
                    src={cloudinaryHeroUrl(photo.url, HERO_MAIN_WIDTH)}
                    alt={isTarget ? activeAlt : ""}
                    fill
                    priority={i === 0}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    loading={i === 0 ? "eager" : "lazy"}
                    sizes="(max-width:768px)100vw,(max-width:1280px)70vw,60vw"
                    aria-hidden={!isTarget}
                    onLoad={() => markPhotoLoaded(photo.url, i)}
                    className={`absolute inset-0 object-cover object-center ${transitionClass} ${opacityClass}`}
                    style={{ zIndex: visible ? (isTarget ? 2 : 1) : 0 }}
                  />
                );
              })
            )}

            {/* Course meta — frosted overlay on main photo */}
            {hasMeta && !activeVideoId && (
              <div
                className={`pointer-events-none absolute right-2 left-2 z-20 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl bg-ink/45 px-3 py-2 backdrop-blur-md ring-1 ring-white/10 sm:right-auto sm:left-3 sm:flex-nowrap sm:gap-3 sm:px-4 ${activePictured ? "bottom-[5.75rem] sm:bottom-auto sm:top-3" : "bottom-14 sm:bottom-auto sm:top-3"}`}
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
                  <span className="mt-0.5 block font-semibold">
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
                className="absolute top-3 left-3 z-20 flex cursor-pointer items-center gap-1.5 rounded-full bg-ink/60 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-ink/80"
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
                  <span className="rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] tabular-nums text-ink shadow-soft backdrop-blur-sm sm:px-3 sm:text-[11px]">
                    {photoStripTotal > 0 ? photoIdx + 1 : 0} /{" "}
                    {photoStripTotal}
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

            {/* ── Vertical video panel (desktop) ─────────────────────────── */}
            {videoIds.length > 0 ? (
              <aside className="relative hidden h-full max-h-full min-h-0 w-52 shrink-0 flex-col overflow-hidden rounded-2xl bg-linear-to-b from-white to-sand/80 ring-1 ring-ink/8 lg:w-56 xl:w-60 md:flex lg:rounded-3xl">
                <div className="shrink-0 border-b border-ink/8 px-3.5 py-3 lg:px-4">
                  <p className="type-eyebrow text-[8px] text-ink/45 lg:text-[9px]">
                    Watch
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">Videos</p>
                    <span className="rounded-full bg-ink/6 px-2.5 py-0.5 text-[10px] font-semibold tabular-nums text-ink/60">
                      {videoIds.length}
                    </span>
                  </div>
                </div>
                <div
                  ref={videoStripRef}
                  className="scrollbar-thin-primary flex min-h-0 flex-1 touch-pan-y flex-col gap-2.5 overflow-y-auto overscroll-y-contain scroll-smooth p-2.5 [-webkit-overflow-scrolling:touch] lg:gap-3 lg:p-3"
                >
                  {videoIds.map((id, vi) => renderVideoThumb(id, vi, "desktop"))}
                </div>
                {videoStripOverflow ? (
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-12 rounded-b-2xl bg-linear-to-t from-white via-white/70 to-transparent lg:rounded-b-3xl"
                    aria-hidden="true"
                  />
                ) : null}
              </aside>
            ) : null}
          </div>

          {/* ── Horizontal video strip (mobile) ──────────────────────────── */}
          {videoIds.length > 0 ? (
            <div className="rounded-xl bg-linear-to-b from-white to-sand/80 p-2.5 ring-1 ring-ink/8 md:hidden">
              <div className="mb-2.5 flex items-center justify-between px-0.5">
                <p className="text-[11px] font-semibold text-ink">Videos</p>
                <span className="rounded-full bg-ink/6 px-2 py-0.5 text-[9px] font-semibold tabular-nums text-ink/60">
                  {videoIds.length}
                </span>
              </div>
              <div className="no-scrollbar flex touch-pan-x gap-2.5 overflow-x-auto scroll-smooth snap-x snap-mandatory">
                {videoIds.map((id, vi) => renderVideoThumb(id, vi, "mobile"))}
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* ── Bottom photo filmstrip ───────────────────────────────────── */}
        {photoStripTotal > 1 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="shrink-0 overflow-hidden rounded-xl bg-white/50 px-2 pt-2 backdrop-blur-sm sm:rounded-2xl"
          >
            <div
              ref={photoStripRef}
              className="no-scrollbar flex touch-pan-x gap-1.5 overflow-x-auto scroll-smooth px-2 py-2 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] sm:gap-2"
            >
              {photos.map((photo, i) => {
                const isActive = i === photoIdx && !activeVideoId;
                return (
                  <button
                    key={photo.url}
                    type="button"
                    onClick={() => pickPhoto(i)}
                    className={`relative h-14 w-[4.25rem] shrink-0 snap-start cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 sm:h-16 sm:w-24 sm:rounded-xl ${isActive ? "border-primary" : "border-ink/8 hover:border-primary/40"}`}
                    aria-label={`Photo ${i + 1}`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <Image
                      src={cloudinarySizedUrl(photo.url, HERO_THUMB_WIDTH)}
                      alt=""
                      fill
                      loading="lazy"
                      sizes="96px"
                      className="object-cover"
                    />
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
                    photoStripTotal > 1
                      ? `${(photoIdx / (photoStripTotal - 1)) * 100}%`
                      : "100%",
                }}
                transition={{ duration: 1.92, ease: "linear" }}
              />
            </div>
          </motion.div>
        ) : null}
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
