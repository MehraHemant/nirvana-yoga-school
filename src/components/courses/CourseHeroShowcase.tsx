"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { ChevronLeft, ChevronRight, Play } from "@/icons";
import { YOUTUBE_METADATA_REGISTRY } from "@/lib/youtube";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ShowcaseProps {
  title: string;
  eyebrow?: string;
  photos: string[];
  videoIds: string[];
  fee?: string;
  duration?: string;
  level?: string;
  certification?: string;
}

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
  return t.length > 58 ? `${t.slice(0, 55)}…` : t;
}

// ─── Shared state hook (auto + manual + inline video) ────────────────────────

function useHeroState(photos: string[], videoIds: string[]) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  // Auto-advance every 2 s; pauses while hovered or video is playing
  useEffect(() => {
    if (hovered || activeVideoId || photos.length <= 1) return;
    const t = setInterval(
      () => setPhotoIdx((p) => (p + 1) % photos.length),
      2000,
    );
    return () => clearInterval(t);
  }, [hovered, activeVideoId, photos.length]);

  // Preload adjacent images for instant switching
  useEffect(() => {
    const toPreload = [
      (photoIdx + 1) % photos.length,
      (photoIdx + 2) % photos.length,
      (photoIdx - 1 + photos.length) % photos.length,
    ];
    for (const i of new Set(toPreload)) {
      const url = photos[i];
      if (url) {
        const img = new window.Image();
        img.src = url;
      }
    }
  }, [photoIdx, photos]);

  // Keep filmstrip centred on active thumb
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
      behavior: "smooth",
    });
  }, [photoIdx]);

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
    setHovered(true); // pause briefly after manual pick
  };
  const playVideo = (id: string) => setActiveVideoId(id);
  const closeVideo = () => {
    setActiveVideoId(null);
    setHovered(false);
  };

  return {
    photoIdx,
    activeVideoId,
    hovered,
    setHovered,
    stripRef,
    prev,
    next,
    pickPhoto,
    playVideo,
    closeVideo,
    photo: photos[photoIdx],
  };
}

// ─── Shared primitives ───────────────────────────────────────────────────────

function Img({
  url,
  alt = "",
  priority = false,
  sizes = "50vw",
  className = "",
}: {
  url: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <Image
      src={url}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      sizes={sizes}
      priority={priority}
    />
  );
}

function PlayBtn({ size = 36 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur-sm"
      style={{ width: size, height: size }}
    >
      <Play size={size * 0.36} className="fill-ink/70 text-ink/70" />
    </span>
  );
}

function VideoTag({ playing = false }: { playing?: boolean }) {
  return (
    <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
      {playing ? "Playing" : "Video"}
    </span>
  );
}

function NavArrows({
  onPrev,
  onNext,
  className = "",
}: {
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onPrev}
        className="cursor-pointer rounded-full bg-white/85 p-2 text-ink/70 shadow-soft backdrop-blur-sm transition-colors hover:bg-white hover:text-ink"
        aria-label="Previous photo"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={onNext}
        className="cursor-pointer rounded-full bg-white/85 p-2 text-ink/70 shadow-soft backdrop-blur-sm transition-colors hover:bg-white hover:text-ink"
        aria-label="Next photo"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function Counter({ current, total }: { current: number; total: number }) {
  return (
    <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] tabular-nums text-muted backdrop-blur-sm shadow-soft">
      {current + 1} / {total}
    </span>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-3 left-3 z-20 flex cursor-pointer items-center gap-1.5 rounded-full bg-ink/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-ink/75"
    >
      ← Photos
    </button>
  );
}

// Shared photo featured area (crossfade + video inline)
function FeaturedArea({
  photo,
  photoIdx,
  photoTotal,
  title,
  activeVideoId,
  onPrev,
  onNext,
  onClose,
  sizes = "(max-width:768px)100vw,65vw",
  children,
}: {
  photo: string;
  photoIdx: number;
  photoTotal: number;
  title: string;
  activeVideoId: string | null;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  sizes?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="group relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-sand/70">
      <AnimatePresence mode="wait">
        {activeVideoId ? (
          <motion.iframe
            key={`v-${activeVideoId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1`}
            title="video"
            allow="autoplay; fullscreen"
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
            <Img url={photo} alt={title} priority sizes={sizes} />
          </motion.div>
        )}
      </AnimatePresence>

      {activeVideoId ? (
        <BackBtn onClick={onClose} />
      ) : (
        <>
          {/* Bottom nav bar — always visible */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-linear-to-t from-ink/30 to-transparent px-3 pb-3 pt-10">
            <NavArrows onPrev={onPrev} onNext={onNext} />
            <Counter current={photoIdx} total={photoTotal} />
          </div>
        </>
      )}

      {/* Any extra overlay content */}
      {children}
    </div>
  );
}

// Shared bottom filmstrip
function Filmstrip({
  photos,
  activeIdx,
  activeVideoId,
  onPick,
  stripRef,
}: {
  photos: string[];
  activeIdx: number;
  activeVideoId: string | null;
  onPick: (i: number) => void;
  stripRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="mt-2.5 shrink-0 overflow-hidden rounded-2xl bg-white/55 px-3 py-2.5 backdrop-blur-sm">
      <div
        ref={stripRef}
        className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth"
      >
        {photos.map((url, i) => {
          const isActive = i === activeIdx && !activeVideoId;
          return (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: filmstrip, stable
              key={i}
              type="button"
              onClick={() => onPick(i)}
              className={`relative h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl transition-all duration-500 sm:h-16 ${
                isActive
                  ? "scale-[1.06] opacity-100 ring-1 ring-accent/70 ring-offset-1 ring-offset-white/50"
                  : "opacity-45 hover:opacity-80"
              }`}
              aria-label={`Photo ${i + 1}`}
              aria-current={isActive ? "true" : undefined}
            >
              <Img url={url} sizes="80px" />
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
                ? `${(activeIdx / (photos.length - 1)) * 100}%`
                : "100%",
          }}
          transition={{ duration: 1.92, ease: "linear" }}
        />
      </div>
    </div>
  );
}

// Shared vertical video list
function VideoList({
  videoIds,
  activeVideoId,
  onPlay,
}: {
  videoIds: string[];
  activeVideoId: string | null;
  onPlay: (id: string) => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white/40">
      <p className="shrink-0 border-b border-ink/6 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
        {videoIds.length} Video{videoIds.length > 1 ? "s" : ""}
      </p>
      <div className="no-scrollbar flex-1 overflow-y-auto py-2.5">
        <ul className="flex flex-col gap-3 px-2.5">
          {videoIds.map((id, i) => {
            const playing = activeVideoId === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onPlay(id)}
                  aria-pressed={playing}
                  aria-label={`Play: ${ytTitle(id, i)}`}
                  className={`group w-full cursor-pointer overflow-hidden rounded-2xl text-left ring-1 transition-all ${
                    playing
                      ? "bg-primary/5 ring-primary/40 shadow-soft"
                      : "bg-sand/80 ring-ink/6 hover:shadow-soft hover:ring-ink/15"
                  }`}
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
                    <Img
                      url={ytThumb(id)}
                      alt={ytTitle(id, i)}
                      sizes="220px"
                      className={`transition-transform duration-500 ${playing ? "scale-[1.03]" : "group-hover:scale-[1.03]"}`}
                    />
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-colors ${
                        playing
                          ? "bg-primary/20"
                          : "bg-ink/10 group-hover:bg-ink/20"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full shadow-soft backdrop-blur-sm transition-all ${
                          playing
                            ? "scale-110 bg-primary"
                            : "bg-white/90 group-hover:scale-105"
                        }`}
                      >
                        <Play
                          size={13}
                          className={
                            playing
                              ? "fill-white text-white"
                              : "fill-ink/70 text-ink/70"
                          }
                        />
                      </span>
                    </div>
                    <span className="absolute top-2 left-2">
                      <VideoTag playing={playing} />
                    </span>
                  </div>
                  <div className="px-2.5 py-2">
                    <p
                      className={`line-clamp-2 text-[11px] font-medium leading-[1.4] ${
                        playing ? "text-primary" : "text-ink/80"
                      }`}
                    >
                      {ytTitle(id, i)}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ─── OPTION 1: Gallery Split ─────────────────────────────────────────────────
// featured photo | right video list | bottom filmstrip

function Option1({
  photos,
  videoIds,
  title,
  fee: _fee,
  duration: _duration,
  level: _level,
}: ShowcaseProps) {
  const s = useHeroState(photos, videoIds);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover pause for autoplay
    <div
      className="flex h-svh max-h-svh w-full flex-col bg-sand pt-[5rem] pb-3"
      onMouseEnter={() => s.setHovered(true)}
      onMouseLeave={() => s.setHovered(false)}
    >
      <div className="mx-auto flex w-full max-w-[92rem] min-h-0 flex-1 flex-col overflow-hidden px-5 md:px-8">
        <div className="mb-3 shrink-0">
          <h1 className="line-clamp-2 max-w-4xl font-serif text-xl font-medium leading-[1.1] text-ink/90 sm:text-2xl md:text-3xl lg:text-[2.2rem]">
            {title}
          </h1>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-accent/80">
            {photos.length} photos · {videoIds.length} videos
          </p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden rounded-3xl bg-white/60 p-3 md:grid-cols-[1fr_15rem]">
          <FeaturedArea
            photo={s.photo}
            photoIdx={s.photoIdx}
            photoTotal={photos.length}
            title={title}
            activeVideoId={s.activeVideoId}
            onPrev={s.prev}
            onNext={s.next}
            onClose={s.closeVideo}
          />
          <VideoList
            videoIds={videoIds}
            activeVideoId={s.activeVideoId}
            onPlay={s.playVideo}
          />
        </div>

        <Filmstrip
          photos={photos}
          activeIdx={s.photoIdx}
          activeVideoId={s.activeVideoId}
          onPick={s.pickPhoto}
          stripRef={s.stripRef}
        />
      </div>
    </div>
  );
}

// ─── OPTION 2: Magazine Split ────────────────────────────────────────────────
// left text panel | right 3-photo collage + bottom filmstrip

function Option2({
  photos,
  videoIds: _videoIds,
  title,
  fee,
  duration,
  level,
  certification,
}: ShowcaseProps) {
  const s = useHeroState(photos, _videoIds);

  return (
    <div className="flex h-svh max-h-svh w-full bg-white pt-[5rem]">
      {/* Left: editorial */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: hover pause for autoplay */}
      <div
        className="flex w-full flex-col justify-center px-8 py-8 md:w-[42%] lg:px-14"
        onMouseEnter={() => s.setHovered(true)}
        onMouseLeave={() => s.setHovered(false)}
      >
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          Yoga Teacher Training · Rishikesh
        </p>
        <h1 className="font-serif text-3xl font-medium leading-[1.05] text-ink sm:text-4xl md:text-5xl xl:text-[3.2rem]">
          {title}
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
          An immersive, Yoga Alliance certified training on the banks of the
          sacred Ganga — blending ancient wisdom with modern pedagogy.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-ink/8 pt-5">
          {duration && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted/60">
                Duration
              </p>
              <p className="mt-0.5 text-sm font-semibold text-ink">
                {duration}
              </p>
            </div>
          )}
          {level && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted/60">
                Level
              </p>
              <p className="mt-0.5 text-sm font-semibold text-ink">{level}</p>
            </div>
          )}
          {certification && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted/60">
                Certification
              </p>
              <p className="mt-0.5 text-sm font-semibold text-ink">
                {certification}
              </p>
            </div>
          )}
          {fee && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted/60">
                Fee
              </p>
              <p className="mt-0.5 text-sm font-semibold text-primary">{fee}</p>
            </div>
          )}
        </div>
        <div className="mt-6 flex gap-3">
          <Button href="#" variant="primary" size="md">
            Enquire Now
          </Button>
          <Button href="#" variant="ghost" size="md">
            View Dates
          </Button>
        </div>

        {/* Manual nav + filmstrip mini */}
        <div className="mt-6 flex items-center gap-3">
          <NavArrows onPrev={s.prev} onNext={s.next} />
          <Counter current={s.photoIdx} total={photos.length} />
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {photos.slice(0, 8).map((url, i) => (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: stable
              key={i}
              type="button"
              onClick={() => s.pickPhoto(i)}
              className={`relative h-9 w-13 shrink-0 overflow-hidden rounded-lg transition-all ${
                i === s.photoIdx
                  ? "ring-1 ring-primary scale-105"
                  : "opacity-50 hover:opacity-80"
              }`}
            >
              <Img url={url} sizes="52px" />
            </button>
          ))}
          {photos.length > 8 && (
            <span className="flex items-center text-[11px] text-muted">
              +{photos.length - 8}
            </span>
          )}
        </div>
      </div>

      {/* Right: photo collage */}
      <div
        className="hidden flex-1 gap-2.5 p-4 pl-0 md:grid"
        style={{
          gridTemplateRows: "2fr 1fr",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <div className="relative col-span-1 row-span-2 overflow-hidden rounded-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={s.photoIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Img url={s.photo} priority alt={title} sizes="28vw" />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="relative overflow-hidden rounded-3xl">
          <Img
            url={photos[(s.photoIdx + 1) % photos.length]}
            alt=""
            sizes="18vw"
          />
        </div>
        <div className="relative overflow-hidden rounded-3xl">
          <Img
            url={photos[(s.photoIdx + 2) % photos.length]}
            alt=""
            sizes="18vw"
          />
        </div>
      </div>
    </div>
  );
}

// ─── OPTION 3: Bento Grid ────────────────────────────────────────────────────

function Option3({
  photos,
  videoIds,
  title,
  fee,
  duration: _duration,
  certification: _certification,
}: ShowcaseProps) {
  const s = useHeroState(photos, videoIds);

  const cells: { col: string; type: "photo" | "video"; offset: number }[] = [
    { col: "col-span-2 row-span-2", type: "photo", offset: 0 },
    { col: "col-span-1 row-span-1", type: "photo", offset: 1 },
    { col: "col-span-1 row-span-1", type: "video", offset: 0 },
    { col: "col-span-1 row-span-1", type: "photo", offset: 2 },
    { col: "col-span-1 row-span-1", type: "video", offset: 1 },
  ];

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover pause for autoplay
    <div
      className="flex h-svh max-h-svh w-full flex-col bg-sand px-4 pt-[5rem] pb-3 md:px-8"
      onMouseEnter={() => s.setHovered(true)}
      onMouseLeave={() => s.setHovered(false)}
    >
      <div className="mb-3 flex shrink-0 items-end justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            200 Hour · Yoga Alliance
          </span>
          <h1 className="mt-0.5 line-clamp-2 max-w-3xl font-serif text-xl font-medium leading-[1.1] text-ink md:text-2xl lg:text-3xl">
            {title}
          </h1>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <NavArrows onPrev={s.prev} onNext={s.next} />
          {fee && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted">
                From
              </p>
              <p className="font-serif text-xl font-medium text-primary">
                {fee}
              </p>
            </div>
          )}
          <Button href="#" variant="primary" size="sm">
            Enquire
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-2 gap-2.5 overflow-hidden rounded-3xl">
        {cells.map((cell, ci) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: bento cells are statically ordered
            key={ci}
            className={`${cell.col} relative overflow-hidden rounded-2xl`}
          >
            {cell.type === "photo" ? (
              <>
                {ci === 0 && s.activeVideoId ? (
                  <>
                    <iframe
                      src={`https://www.youtube.com/embed/${s.activeVideoId}?autoplay=1&rel=0`}
                      title="video"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0 bg-ink"
                    />
                    <BackBtn onClick={s.closeVideo} />
                  </>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={s.photoIdx + cell.offset}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0"
                    >
                      <Img
                        url={photos[(s.photoIdx + cell.offset) % photos.length]}
                        alt=""
                        priority={ci === 0}
                        sizes={ci === 0 ? "38vw" : "18vw"}
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
                {ci === 0 && !s.activeVideoId && (
                  <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
                    <NavArrows onPrev={s.prev} onNext={s.next} />
                    <Counter current={s.photoIdx} total={photos.length} />
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() =>
                  s.playVideo(videoIds[cell.offset % videoIds.length])
                }
                className="group relative h-full w-full bg-ink"
                aria-label={`Play video ${cell.offset + 1}`}
              >
                <Img
                  url={ytThumb(videoIds[cell.offset % videoIds.length])}
                  alt=""
                  sizes="18vw"
                  className="opacity-70 transition-opacity group-hover:opacity-85"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/25">
                  <PlayBtn size={34} />
                  <p className="mx-2 line-clamp-2 text-center text-[10px] font-medium text-white">
                    {ytTitle(
                      videoIds[cell.offset % videoIds.length],
                      cell.offset,
                    )}
                  </p>
                </div>
                <span className="absolute top-2 left-2">
                  <VideoTag />
                </span>
              </button>
            )}
          </div>
        ))}
      </div>

      <Filmstrip
        photos={photos}
        activeIdx={s.photoIdx}
        activeVideoId={s.activeVideoId}
        onPick={s.pickPhoto}
        stripRef={s.stripRef}
      />
    </div>
  );
}

// ─── OPTION 4: Panorama Strip ────────────────────────────────────────────────

function Option4({
  photos,
  videoIds,
  title,
  fee,
  duration: _duration,
}: ShowcaseProps) {
  const s = useHeroState(photos, videoIds);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover pause for autoplay
    <div
      className="flex h-svh max-h-svh w-full flex-col bg-white px-5 pt-[5rem] pb-5 md:px-10"
      onMouseEnter={() => s.setHovered(true)}
      onMouseLeave={() => s.setHovered(false)}
    >
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
            Rishikesh, India
          </p>
          <h1 className="mt-0.5 line-clamp-1 font-serif text-xl font-medium text-ink sm:text-2xl md:text-3xl">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <NavArrows onPrev={s.prev} onNext={s.next} />
          {fee && (
            <span className="font-serif text-xl font-medium text-primary">
              {fee}
            </span>
          )}
          <Button href="#" variant="primary" size="sm">
            Book Now
          </Button>
        </div>
      </div>

      {/* 3-panel panorama */}
      <div className="flex min-h-0 flex-1 gap-2 overflow-hidden rounded-3xl">
        {[0, 1, 2].map((offset) => {
          const i = (s.photoIdx + offset) % photos.length;
          const isCenter = offset === 1;
          return (
            <motion.div
              key={offset}
              layout
              className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
                isCenter ? "flex-[3] cursor-zoom-in" : "flex-1 cursor-pointer"
              }`}
              onClick={() => !isCenter && s.pickPhoto(i)}
            >
              {isCenter && s.activeVideoId ? (
                <>
                  <iframe
                    src={`https://www.youtube.com/embed/${s.activeVideoId}?autoplay=1&rel=0`}
                    title="video"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0 bg-ink"
                  />
                  <BackBtn onClick={s.closeVideo} />
                </>
              ) : (
                <Img
                  url={photos[i]}
                  alt=""
                  priority={isCenter}
                  sizes={isCenter ? "50vw" : "15vw"}
                  className={isCenter ? "" : "brightness-70"}
                />
              )}
              {isCenter && !s.activeVideoId && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <Counter current={s.photoIdx} total={photos.length} />
                </div>
              )}
              {!isCenter && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {offset === 0 ? (
                    <ChevronLeft size={22} className="text-white/70" />
                  ) : (
                    <ChevronRight size={22} className="text-white/70" />
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom: filmstrip + video chips */}
      <div className="mt-2.5 shrink-0 flex items-end gap-4">
        <div className="flex-1">
          <Filmstrip
            photos={photos}
            activeIdx={s.photoIdx}
            activeVideoId={s.activeVideoId}
            onPick={s.pickPhoto}
            stripRef={s.stripRef}
          />
        </div>
        {videoIds.length > 0 && (
          <div className="shrink-0 pb-2.5">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
              Videos
            </p>
            <div className="flex gap-2">
              {videoIds.map((id, i) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => s.playVideo(id)}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl transition-all ${
                    s.activeVideoId === id
                      ? "ring-2 ring-primary"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`Play: ${ytTitle(id, i)}`}
                >
                  <Img
                    url={ytThumb(id)}
                    sizes="80px"
                    className="brightness-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
                    <PlayBtn size={26} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── OPTION 5: Spotlight Center ──────────────────────────────────────────────

function Option5({ photos, videoIds, title, fee, duration }: ShowcaseProps) {
  const s = useHeroState(photos, videoIds);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover pause for autoplay
    <div
      className="flex h-svh max-h-svh w-full flex-col items-center bg-sand pt-[5.5rem] pb-4"
      onMouseEnter={() => s.setHovered(true)}
      onMouseLeave={() => s.setHovered(false)}
    >
      <div className="mb-4 shrink-0 px-6 text-center">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Rishikesh · India
        </p>
        <h1 className="max-w-3xl font-serif text-2xl font-medium leading-[1.08] text-ink sm:text-3xl md:text-4xl lg:text-5xl">
          {title}
        </h1>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {fee && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {fee}
            </span>
          )}
          {duration && (
            <span className="rounded-full bg-ink/6 px-3 py-1 text-xs text-muted">
              {duration}
            </span>
          )}
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-5xl min-h-0 flex-1 overflow-hidden rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
        <AnimatePresence mode="wait">
          {s.activeVideoId ? (
            <motion.iframe
              key={`v-${s.activeVideoId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={`https://www.youtube.com/embed/${s.activeVideoId}?autoplay=1&rel=0`}
              title="video"
              allow="autoplay; fullscreen"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0 bg-ink"
            />
          ) : (
            <motion.div
              key={s.photoIdx}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Img url={s.photo} alt={title} priority sizes="80vw" />
            </motion.div>
          )}
        </AnimatePresence>

        {s.activeVideoId ? (
          <BackBtn onClick={s.closeVideo} />
        ) : (
          <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between">
            <NavArrows onPrev={s.prev} onNext={s.next} />
            <Counter current={s.photoIdx} total={photos.length} />
          </div>
        )}
      </div>

      <div className="mt-3 w-full max-w-5xl shrink-0 px-2">
        <div className="flex items-center gap-3">
          <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
            {photos.map((url, i) => (
              <button
                // biome-ignore lint/suspicious/noArrayIndexKey: stable
                key={i}
                type="button"
                onClick={() => s.pickPhoto(i)}
                className={`relative h-11 w-16 shrink-0 overflow-hidden rounded-lg transition-all ${
                  i === s.photoIdx && !s.activeVideoId
                    ? "ring-2 ring-primary scale-[1.06]"
                    : "opacity-40 hover:opacity-75"
                }`}
              >
                <Img url={url} sizes="64px" />
              </button>
            ))}
          </div>
          {videoIds.length > 0 && (
            <>
              <div className="h-10 w-px bg-ink/10" />
              <div className="flex items-center gap-2">
                {videoIds.map((id, i) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => s.playVideo(id)}
                    className={`relative h-11 w-20 overflow-hidden rounded-xl transition-all ${
                      s.activeVideoId === id
                        ? "ring-2 ring-primary scale-[1.04]"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`Play: ${ytTitle(id, i)}`}
                  >
                    <Img url={ytThumb(id)} sizes="80px" />
                    <div className="absolute inset-0 flex items-center justify-center bg-ink/25">
                      <PlayBtn size={24} />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── OPTION 6: Asymmetric Mosaic ─────────────────────────────────────────────

function Option6({
  photos,
  videoIds,
  title,
  fee,
  duration: _duration,
  level: _level,
}: ShowcaseProps) {
  const s = useHeroState(photos, videoIds);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover pause for autoplay
    <div
      className="flex h-svh max-h-svh w-full flex-col bg-white px-4 pt-[5rem] pb-4 md:px-8"
      onMouseEnter={() => s.setHovered(true)}
      onMouseLeave={() => s.setHovered(false)}
    >
      <div className="mb-3 flex shrink-0 items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Yoga Alliance Certified
          </p>
          <h1 className="mt-0.5 line-clamp-2 max-w-2xl font-serif text-xl font-medium leading-[1.1] text-ink sm:text-2xl md:text-[2rem]">
            {title}
          </h1>
        </div>
        <div className="ml-6 hidden shrink-0 items-center gap-3 md:flex">
          <NavArrows onPrev={s.prev} onNext={s.next} />
          {fee && (
            <span className="font-serif text-xl font-medium text-primary">
              {fee}
            </span>
          )}
          <Button href="#" variant="primary" size="sm">
            Enquire
          </Button>
        </div>
      </div>

      {/* Asymmetric 5-cell grid */}
      <div
        className="grid min-h-0 flex-1 gap-2 overflow-hidden"
        style={{
          gridTemplateColumns: "2fr 1.2fr 1fr",
          gridTemplateRows: "1fr 1fr",
        }}
      >
        {/* Large left (featured) */}
        <div className="relative row-span-2 overflow-hidden rounded-3xl">
          <AnimatePresence mode="wait">
            {s.activeVideoId ? (
              <motion.iframe
                key={`v-${s.activeVideoId}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={`https://www.youtube.com/embed/${s.activeVideoId}?autoplay=1&rel=0`}
                title="video"
                allow="autoplay; fullscreen"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0 bg-ink"
              />
            ) : (
              <motion.div
                key={s.photoIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <Img url={s.photo} alt={title} priority sizes="35vw" />
              </motion.div>
            )}
          </AnimatePresence>
          {s.activeVideoId ? (
            <BackBtn onClick={s.closeVideo} />
          ) : (
            <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
              <NavArrows onPrev={s.prev} onNext={s.next} />
              <Counter current={s.photoIdx} total={photos.length} />
            </div>
          )}
        </div>
        {/* Top-center */}
        <div className="relative overflow-hidden rounded-3xl">
          <Img
            url={photos[(s.photoIdx + 1) % photos.length]}
            alt=""
            sizes="20vw"
          />
        </div>
        {/* Top-right */}
        <div className="relative overflow-hidden rounded-3xl">
          <Img
            url={photos[(s.photoIdx + 2) % photos.length]}
            alt=""
            sizes="15vw"
          />
        </div>
        {/* Bottom-center: video */}
        {videoIds[0] ? (
          <button
            type="button"
            onClick={() => s.playVideo(videoIds[0])}
            className={`group relative overflow-hidden rounded-3xl bg-ink ${
              s.activeVideoId === videoIds[0] ? "ring-2 ring-primary" : ""
            }`}
            aria-label={`Play: ${ytTitle(videoIds[0], 0)}`}
          >
            <Img
              url={ytThumb(videoIds[0])}
              alt=""
              sizes="20vw"
              className="opacity-65 transition-opacity group-hover:opacity-80"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/30">
              <PlayBtn size={32} />
              <p className="mx-3 line-clamp-1 text-center text-[10px] text-white">
                {ytTitle(videoIds[0], 0)}
              </p>
            </div>
            <span className="absolute top-2 left-2">
              <VideoTag playing={s.activeVideoId === videoIds[0]} />
            </span>
          </button>
        ) : (
          <div className="relative overflow-hidden rounded-3xl">
            <Img
              url={photos[(s.photoIdx + 3) % photos.length]}
              alt=""
              sizes="20vw"
            />
          </div>
        )}
        {/* Bottom-right */}
        <div className="relative overflow-hidden rounded-3xl">
          <Img
            url={photos[(s.photoIdx + 3) % photos.length]}
            alt=""
            sizes="15vw"
          />
          {videoIds[1] && (
            <button
              type="button"
              onClick={() => s.playVideo(videoIds[1])}
              className="absolute inset-0 flex flex-col items-center justify-center bg-ink/50 transition-opacity hover:bg-ink/40"
              aria-label={`Play: ${ytTitle(videoIds[1], 1)}`}
            >
              <PlayBtn size={28} />
              <span className="mt-1 px-1 text-center text-[9px] font-medium text-white/90 line-clamp-2">
                {ytTitle(videoIds[1], 1)}
              </span>
            </button>
          )}
        </div>
      </div>

      <Filmstrip
        photos={photos}
        activeIdx={s.photoIdx}
        activeVideoId={s.activeVideoId}
        onPick={s.pickPhoto}
        stripRef={s.stripRef}
      />
    </div>
  );
}

// ─── OPTION 7: Film Strip Flanks ─────────────────────────────────────────────

function Option7({
  photos,
  videoIds,
  title,
  fee,
  duration: _duration,
}: ShowcaseProps) {
  const s = useHeroState(photos, videoIds);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover pause for autoplay
    <div
      className="flex h-svh max-h-svh w-full flex-col bg-sand pt-[5rem] pb-4"
      onMouseEnter={() => s.setHovered(true)}
      onMouseLeave={() => s.setHovered(false)}
    >
      <div className="mx-auto flex w-full max-w-[92rem] min-h-0 flex-1 flex-col overflow-hidden px-4 md:px-8">
        <div className="mb-3 flex shrink-0 items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              Rishikesh · Yoga Alliance
            </p>
            <h1 className="mt-0.5 line-clamp-1 font-serif text-xl font-medium text-ink sm:text-2xl md:text-3xl">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <NavArrows onPrev={s.prev} onNext={s.next} />
            {fee && (
              <span className="font-serif text-lg text-primary">{fee}</span>
            )}
            <Button href="#" variant="primary" size="sm">
              Enquire
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-2.5">
          {/* Left filmstrip column */}
          <div className="no-scrollbar hidden w-[4.5rem] flex-col gap-2 overflow-y-auto md:flex">
            {photos.slice(0, 10).map((url, i) => (
              <button
                // biome-ignore lint/suspicious/noArrayIndexKey: filmstrip thumbnails, stable
                key={i}
                type="button"
                onClick={() => s.pickPhoto(i)}
                className={`relative h-16 w-full shrink-0 overflow-hidden rounded-xl transition-all ${
                  i === s.photoIdx && !s.activeVideoId
                    ? "ring-2 ring-accent scale-[1.04]"
                    : "opacity-40 hover:opacity-70"
                }`}
              >
                <Img url={url} sizes="72px" />
              </button>
            ))}
          </div>

          {/* Center featured */}
          <FeaturedArea
            photo={s.photo}
            photoIdx={s.photoIdx}
            photoTotal={photos.length}
            title={title}
            activeVideoId={s.activeVideoId}
            onPrev={s.prev}
            onNext={s.next}
            onClose={s.closeVideo}
            sizes="60vw"
          />

          {/* Right video list */}
          {videoIds.length > 0 && (
            <div className="hidden w-[13rem] md:block">
              <VideoList
                videoIds={videoIds}
                activeVideoId={s.activeVideoId}
                onPlay={s.playVideo}
              />
            </div>
          )}
        </div>

        <Filmstrip
          photos={photos}
          activeIdx={s.photoIdx}
          activeVideoId={s.activeVideoId}
          onPick={s.pickPhoto}
          stripRef={s.stripRef}
        />
      </div>
    </div>
  );
}

// ─── Main Showcase ────────────────────────────────────────────────────────────

const OPTIONS = [
  { num: 1, label: "Gallery Split", Component: Option1 },
  { num: 2, label: "Magazine Split", Component: Option2 },
  { num: 3, label: "Bento Grid", Component: Option3 },
  { num: 4, label: "Panorama", Component: Option4 },
  { num: 5, label: "Spotlight Center", Component: Option5 },
  { num: 6, label: "Asymmetric Mosaic", Component: Option6 },
  { num: 7, label: "Film Strip Flanks", Component: Option7 },
];

export default function CourseHeroShowcase(props: ShowcaseProps) {
  const [selected, setSelected] = useState(1);
  const { Component } = OPTIONS[selected - 1];

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Component {...props} />
        </motion.div>
      </AnimatePresence>

      {/* Floating pill selector */}
      <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full bg-ink/90 px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md ring-1 ring-white/10">
          {OPTIONS.map((opt) => (
            <button
              key={opt.num}
              type="button"
              onClick={() => setSelected(opt.num)}
              className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2.5 text-xs font-semibold transition-all duration-200 ${
                selected === opt.num
                  ? "bg-primary text-white shadow-md"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
              title={opt.label}
            >
              {opt.num}
            </button>
          ))}
          <div className="mx-1.5 h-5 w-px bg-white/15" />
          <span className="pr-2 text-[11px] font-medium text-white/60">
            {OPTIONS[selected - 1].label}
          </span>
        </div>
      </div>
    </div>
  );
}
