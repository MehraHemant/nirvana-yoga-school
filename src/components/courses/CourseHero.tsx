"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Heading, MediaLightbox } from "@/components/ui";
import { ChevronLeft, ChevronRight, Play } from "@/icons";
import { YOUTUBE_METADATA_REGISTRY } from "@/lib/youtube";

// ─── Props ───────────────────────────────────────────────────────────────────

interface CourseHeroProps {
  title: string;
  subtitle?: string;
  image: string;
  variant?: "course" | "page";
  eyebrow?: string;
  duration?: string;
  level?: string;
  certification?: string;
  fee?: string;
  certBadge?: string;
  heroImages?: string[];
  images?: string[];
  videos?: string[];
  metaItems?: { label: string; value: string }[];
  ctaPrimary?: string;
  ctaSecondary?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryHref?: string;
}

interface MediaItem {
  type: "image" | "video";
  url: string;
}

// ─── Supplemental photos (Yoga / Rishikesh — shown when course has few images) ─

const SUPPLEMENTAL = [
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1593811160657-8443f7660669?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1528319725582-ddc096101511?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1200&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=85",
];

const MIN_PHOTOS = 12;

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

export default function CourseHero({
  title,
  image,
  heroImages,
  images,
  videos,
  fee,
  duration,
  certification,
  ctaPrimary,
  ctaPrimaryHref,
  ctaSecondary,
  ctaSecondaryHref,
}: CourseHeroProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const stripRef = useRef<HTMLDivElement>(null);

  // ── Build photo list ──────────────────────────────────────────────────────
  const photos = useMemo<string[]>(() => {
    const seen = new Set<string>();
    const all: string[] = [];
    for (const src of [...(heroImages ?? []), ...(images ?? [])]) {
      if (src && !seen.has(src)) {
        seen.add(src);
        all.push(src);
      }
    }
    if (all.length === 0 && image) {
      all.push(image);
      seen.add(image);
    }
    for (const src of SUPPLEMENTAL) {
      if (all.length >= MIN_PHOTOS) break;
      if (!seen.has(src)) {
        seen.add(src);
        all.push(src);
      }
    }
    return all;
  }, [heroImages, images, image]);

  // ── Build video list ──────────────────────────────────────────────────────
  const videoIds = useMemo(() => (videos ?? []).filter(Boolean), [videos]);

  // ── All items for lightbox ────────────────────────────────────────────────
  const allItems = useMemo<MediaItem[]>(
    () => [
      ...photos.map((url) => ({ type: "image" as const, url })),
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

  // ── Preload adjacent images ───────────────────────────────────────────────
  useEffect(() => {
    const toLoad = [
      (photoIdx + 1) % photos.length,
      (photoIdx + 2) % photos.length,
      (photoIdx - 1 + photos.length) % photos.length,
    ];
    for (const i of new Set(toLoad)) {
      const url = photos[i];
      if (url) {
        const img = new window.Image();
        img.src = url;
      }
    }
  }, [photoIdx, photos]);

  // ── Filmstrip centering ───────────────────────────────────────────────────
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const thumb = el.children[photoIdx] as HTMLElement | undefined;
    if (!thumb) return;
    el.scrollTo({
      left: Math.max(
        0,
        thumb.offsetLeft - el.clientWidth / 2 + thumb.offsetWidth / 2,
      ),
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, [photoIdx, prefersReduced]);

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
  const hasCTA = !!(ctaPrimary || ctaSecondary);

  return (
    <section className="relative h-svh max-h-svh w-full overflow-hidden bg-white">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_10%_0%,rgb(166_181_162/0.12),transparent_55%)]"
        aria-hidden="true"
      />

      <div className="relative flex h-full min-h-0 flex-col overflow-hidden px-4 pt-19 pb-3 md:px-6 md:pt-22 md:pb-4">
        {/* ── Header row ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0, 0, 1] }}
          className="mb-3 flex shrink-0 items-end justify-between gap-4 pt-4"
        >
          <div className="min-w-0">
            <Heading
              as="h1"
              size="h2"
              className="line-clamp-2 max-w-4xl font-medium leading-tightest! text-ink/90 text-xl sm:text-2xl md:text-3xl lg:text-[2.2rem]"
            >
              {title}
            </Heading>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-accent/80">
              {photos.length} photos
              {videoIds.length > 0 ? ` · ${videoIds.length} videos` : ""}
            </p>
          </div>

          {/* Meta chips + CTA — desktop only */}
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {hasMeta && (
              <div className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-2 backdrop-blur-sm ring-1 ring-ink/6">
                {duration && (
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-muted/60">
                      Duration
                    </p>
                    <p className="text-xs font-semibold text-ink">{duration}</p>
                  </div>
                )}
                {certification && (
                  <>
                    <div className="h-6 w-px bg-ink/8" />
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted/60">
                        Certification
                      </p>
                      <p className="text-xs font-semibold text-ink">
                        {certification}
                      </p>
                    </div>
                  </>
                )}
                {fee && (
                  <>
                    <div className="h-6 w-px bg-ink/8" />
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted/60">
                        Fee
                      </p>
                      <p className="text-xs font-semibold text-primary">
                        {fee}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </motion.div>

        {/* ── Bento grid ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.25, 0, 0, 1] }}
          // biome-ignore lint/a11y/noStaticElementInteractions: hover pause for autoplay
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="grid min-h-0 flex-1 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:gap-2.5"
        >
          {/* ── Large featured cell (2×2) ─────────────────────────────── */}
          <div className="relative col-span-2 row-span-2 overflow-hidden rounded-3xl bg-sand/70">
            <AnimatePresence mode="wait">
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
              ) : (
                <motion.div
                  key={photoIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={photos[photoIdx]}
                    alt={title}
                    fill
                    priority
                    sizes="(max-width:768px)100vw,50vw"
                    className="object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>

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
                {/* Full-cover click → lightbox */}
                <button
                  type="button"
                  onClick={() => openLightbox(photoIdx)}
                  className="absolute inset-0 z-10 cursor-zoom-in"
                  aria-label={`View photo ${photoIdx + 1} fullscreen`}
                />

                {/* Bottom control bar — always visible */}
                <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between bg-linear-to-t from-ink/35 to-transparent px-3 pb-3 pt-10">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prev();
                      }}
                      className="cursor-pointer rounded-full bg-white/85 p-1.5 text-ink/70 shadow-soft backdrop-blur-sm transition-colors hover:bg-white hover:text-ink"
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
                      className="cursor-pointer rounded-full bg-white/85 p-1.5 text-ink/70 shadow-soft backdrop-blur-sm transition-colors hover:bg-white hover:text-ink"
                      aria-label="Next photo"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <span className="rounded-full bg-white/85 px-3 py-0.5 text-[11px] tabular-nums text-muted shadow-soft backdrop-blur-sm">
                    {photoIdx + 1} / {photos.length}
                  </span>
                </div>

                {/* Expand to lightbox */}
                <button
                  type="button"
                  onClick={() => openLightbox(photoIdx)}
                  className="absolute top-3 right-3 z-20 cursor-pointer rounded-full bg-white/80 p-1.5 text-ink/50 backdrop-blur-sm transition-colors hover:text-ink"
                  aria-label="Open fullscreen"
                >
                  <MaximizeIcon />
                </button>
              </>
            )}
          </div>

          {/* ── 4 small cells ─────────────────────────────────────────── */}
          {smallCells.map((cell, ci) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: bento cells, stable order
              key={ci}
              className="relative overflow-hidden rounded-2xl"
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
                      <p className="mx-2 line-clamp-2 text-center text-[10px] font-medium leading-tight text-white">
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
                <button
                  type="button"
                  onClick={() =>
                    openLightbox((photoIdx + cell.offset) % photos.length)
                  }
                  className="group relative h-full w-full cursor-zoom-in overflow-hidden rounded-2xl"
                  aria-label="View photo"
                >
                  <Image
                    src={photos[(photoIdx + cell.offset) % photos.length]}
                    alt=""
                    fill
                    sizes="18vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </button>
              ) : (
                /* Fallback: extra photo when no video available */
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  <Image
                    src={photos[(photoIdx + cell.offset) % photos.length]}
                    alt=""
                    fill
                    sizes="18vw"
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* ── Bottom filmstrip ───────────────────────────────────────────── */}
        {photos.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            // biome-ignore lint/a11y/noStaticElementInteractions: hover pause for autoplay
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="mt-2 shrink-0 overflow-hidden rounded-2xl bg-white/50 px-3 pt-2.5 pb-2 backdrop-blur-sm"
          >
            <div
              ref={stripRef}
              className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth"
            >
              {photos.map((url, i) => {
                const isActive = i === photoIdx && !activeVideoId;
                return (
                  <button
                    // biome-ignore lint/suspicious/noArrayIndexKey: stable filmstrip
                    key={i}
                    type="button"
                    onClick={() => pickPhoto(i)}
                    className={`relative h-13 w-[4.5rem] shrink-0 cursor-pointer overflow-hidden rounded-xl transition-all duration-500 sm:h-14 sm:w-20 ${
                      isActive
                        ? "scale-[1.06] opacity-100 ring-1 ring-accent/70 ring-offset-1 ring-offset-white/50"
                        : "opacity-45 hover:opacity-80"
                    }`}
                    aria-label={`Photo ${i + 1}`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="80px"
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
                    photos.length > 1
                      ? `${(photoIdx / (photos.length - 1)) * 100}%`
                      : "100%",
                }}
                transition={{ duration: 1.92, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </div>

      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={allItems}
        activeIndex={lightboxIdx}
        onChangeActiveIndex={setLightboxIdx}
        title={title}
      />
    </section>
  );
}
