"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Container,
  MediaLightbox,
  SectionHeader,
  TabSwitcher,
} from "@/components/ui";
import {
  ACCOMMODATION_GALLERIES,
  type AccommodationGalleryId,
  COMFORTABLE_STAY,
  FACILITIES,
  FOOD_CONTENT,
  FOOD_GALLERY,
  type GalleryImage,
} from "@/data/accommodationFood";
import { Check, ChevronLeft, ChevronRight } from "@/icons";
import {
  EASE_OUT,
  fadeUp,
  reducedTransition,
  VIEWPORT_ONCE,
} from "@/lib/motion";

type MainTab = "lodging" | "food";

type LightboxState = {
  items: GalleryImage[];
  index: number;
  title: string;
} | null;

function ImageGalleryPanel({
  images,
  label,
  accent = "primary",
  onOpenLightbox,
}: {
  images: GalleryImage[];
  label: string;
  accent?: "primary" | "secondary";
  onOpenLightbox: (index: number) => void;
}) {
  const prefersReduced = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const isInView = useInView(panelRef, { amount: 0.2 });

  const active = images[activeIndex] ?? images[0];
  const progress =
    images.length > 0 ? ((activeIndex + 1) / images.length) * 100 : 0;

  const accentRing =
    accent === "secondary"
      ? "ring-secondary/25 border-secondary/20"
      : "ring-primary/25 border-primary/20";
  const accentBar = accent === "secondary" ? "bg-secondary" : "bg-primary";
  const accentThumb =
    accent === "secondary"
      ? "border-secondary ring-secondary/20"
      : "border-primary ring-primary/20";

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  // Auto-advance the gallery — only while in view; pauses on hover/focus and
  // respects reduced motion.
  useEffect(() => {
    if (!isInView || isPaused || prefersReduced || images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isInView, isPaused, prefersReduced, images.length]);

  useEffect(() => {
    const list = scrollRef.current;
    if (!list) return;
    const thumb = list.children[activeIndex] as HTMLElement | undefined;
    if (!thumb) return;

    const targetScroll =
      thumb.offsetLeft - list.clientWidth / 2 + thumb.offsetWidth / 2;

    list.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, [activeIndex, prefersReduced]);

  if (!active) return null;

  return (
    <section
      ref={panelRef}
      aria-label={`${label} gallery`}
      className="flex flex-col gap-3 min-w-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="relative">
        <div
          className={`absolute -inset-1.5 rounded-2xl bg-linear-to-br ${
            accent === "secondary"
              ? "from-secondary/10 via-transparent to-accent/10"
              : "from-primary/10 via-transparent to-accent/10"
          } blur-md pointer-events-none`}
          aria-hidden="true"
        />

        <div
          className={`relative aspect-[5/3] rounded-3xl overflow-hidden bg-ink shadow-card ring-1 group ${accentRing}`}
        >
          <AnimatePresence mode="wait">
            <motion.button
              key={active.url}
              type="button"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              onClick={() => onOpenLightbox(activeIndex)}
              className="absolute inset-0 w-full h-full cursor-zoom-in"
              aria-label={`View ${active.title} fullscreen`}
            >
              <Image
                src={active.url}
                alt={active.title}
                fill
                priority={activeIndex === 0}
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
              />
            </motion.button>
          </AnimatePresence>

          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="hero-glass px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-white">
              {label}
            </span>
          </div>

          <div className="absolute top-3 right-3 pointer-events-none">
            <span className="px-2 py-0.5 rounded-full bg-black/45 border border-white/10 text-[9px] text-white font-semibold backdrop-blur-sm tabular-nums">
              {activeIndex + 1} / {images.length}
            </span>
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/70 border border-white/15 text-white backdrop-blur-sm transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105"
                aria-label="Previous photo"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/70 border border-white/15 text-white backdrop-blur-sm transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105"
                aria-label="Next photo"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 pointer-events-none">
            <p className="font-serif text-base text-white leading-tight truncate mb-1.5">
              {active.title}
            </p>
            <div className="h-0.5 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className={`h-full ${accentBar} rounded-full`}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenLightbox(activeIndex)}
          className="absolute -bottom-2.5 right-3 sm:right-4 px-3 py-1.5 rounded-full bg-white border border-ink/8 text-[10px] font-semibold text-ink shadow-soft hover:shadow-md hover:border-primary/20 transition-all cursor-pointer font-sans"
        >
          Open full gallery
        </button>
      </div>

      {images.length > 1 && (
        <div className="rounded-xl border border-ink/6 bg-white/80 backdrop-blur-sm p-2 shadow-xs overflow-hidden">
          <ul
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto overscroll-x-contain scrollbar-none snap-x snap-mandatory py-0.5 max-w-full"
            aria-label={`${label} thumbnails`}
          >
            {images.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={item.url} className="shrink-0 snap-center">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                      isActive
                        ? `${accentThumb} shadow-sm scale-[1.02]`
                        : "border-transparent opacity-55 hover:opacity-100 hover:scale-[1.02]"
                    }`}
                    aria-label={item.title}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <Image
                      src={item.url}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function RoomTypeSelector({
  activeId,
  onChange,
}: {
  activeId: AccommodationGalleryId;
  onChange: (id: AccommodationGalleryId) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3">
      {ACCOMMODATION_GALLERIES.map((room) => {
        const isActive = room.id === activeId;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onChange(room.id)}
            className={`text-left rounded-xl border px-2.5 py-2 transition-all duration-300 cursor-pointer ${
              isActive
                ? "border-primary/30 bg-white shadow-soft ring-1 ring-primary/10"
                : "border-ink/6 bg-white/50 hover:bg-white hover:border-ink/12"
            }`}
          >
            <span
              className={`block type-eyebrow text-[9px] mb-0.5 ${isActive ? "text-primary" : "text-muted"}`}
            >
              {room.label}
            </span>
            <span className="text-[11px] text-muted font-sans tabular-nums">
              {room.images.length} photos
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function AccommodationFood() {
  const prefersReduced = useReducedMotion() ?? false;
  const [mainTab, setMainTab] = useState<MainTab>("lodging");
  const [roomTab, setRoomTab] = useState<AccommodationGalleryId>("private");
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const activeRoom =
    ACCOMMODATION_GALLERIES.find((g) => g.id === roomTab) ??
    ACCOMMODATION_GALLERIES[0];

  useEffect(() => {
    if (window.location.hash === "#food") {
      setMainTab("food");
    }
  }, []);

  const openLightbox = (
    items: GalleryImage[],
    index: number,
    title: string,
  ) => {
    setLightbox({ items, index, title });
  };

  return (
    <section
      id="accommodation"
      className="relative border-b border-ink/5 bg-paper overflow-hidden py-10 sm:py-12"
    >
      <div
        className="absolute left-[-8%] top-[40%] w-[240px] h-[240px] rounded-full bg-secondary/5 blur-[80px] pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative w-full">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="text-center max-w-2xl mx-auto mb-5 lg:mb-6"
        >
          <SectionHeader
            eyebrow="Residential Life"
            title={
              <>
                Accommodation & <span className="text-primary">Food</span>
              </>
            }
            description="Clean ashram lodging and organic sattvic meals — everything you need to rest, restore, and focus fully on your training."
            align="center"
          />
        </motion.div>

        <TabSwitcher
          tabs={[
            { id: "lodging", label: "Ashram Lodging" },
            { id: "food", label: "Sattvic Food" },
          ]}
          activeId={mainTab}
          onChange={(id) => setMainTab(id as MainTab)}
          layoutId="accommodationMainTabs"
          className="mb-5 lg:mb-6"
        />

        <AnimatePresence mode="wait">
          {mainTab === "lodging" ? (
            <motion.div
              key="lodging"
              id="lodging"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={reducedTransition(prefersReduced, {
                duration: 0.35,
                ease: EASE_OUT,
              })}
              className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start"
            >
              <div className="lg:col-span-5 order-2 lg:order-1 min-w-0">
                <div className="border-l-2 border-primary/30 pl-4 sm:pl-5 mb-4">
                  <p className="type-eyebrow text-primary mb-1.5">
                    Ashram Accommodation
                  </p>
                  <h3 className="font-serif text-lg md:text-xl text-ink leading-tight mb-2">
                    Comfortable stay in the{" "}
                    <span className="text-primary">heart of Rishikesh</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-muted font-sans leading-relaxed">
                    {COMFORTABLE_STAY.description}
                  </p>
                </div>

                <RoomTypeSelector activeId={roomTab} onChange={setRoomTab} />

                <AnimatePresence mode="wait">
                  <motion.p
                    key={roomTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={reducedTransition(prefersReduced, {
                      duration: 0.28,
                      ease: EASE_OUT,
                    })}
                    className="text-sm text-muted font-sans leading-relaxed mb-3"
                  >
                    {activeRoom.description}
                  </motion.p>
                </AnimatePresence>

                <div className="rounded-2xl bg-white/70 border border-ink/6 p-3 sm:p-4 shadow-xs">
                  <p className="type-eyebrow text-secondary mb-2">
                    Campus facilities
                  </p>
                  <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                    {FACILITIES.map((facility) => (
                      <li
                        key={facility}
                        className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-ink/75 font-sans"
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-primary/8 text-primary flex items-center justify-center shrink-0">
                          <Check size={8} className="stroke-[3]" />
                        </span>
                        {facility}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2 min-w-0">
                <ImageGalleryPanel
                  key={roomTab}
                  images={[...activeRoom.images]}
                  label={activeRoom.label}
                  accent="primary"
                  onOpenLightbox={(index) =>
                    openLightbox(
                      [...activeRoom.images],
                      index,
                      activeRoom.label,
                    )
                  }
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="food"
              id="food"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={reducedTransition(prefersReduced, {
                duration: 0.35,
                ease: EASE_OUT,
              })}
              className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start"
            >
              <div className="lg:col-span-7 min-w-0">
                <ImageGalleryPanel
                  images={FOOD_GALLERY}
                  label="Sattvic Cuisine"
                  accent="secondary"
                  onOpenLightbox={(index) =>
                    openLightbox(FOOD_GALLERY, index, "Sattvic Food & Dining")
                  }
                />
              </div>

              <div className="lg:col-span-5 min-w-0">
                <div className="border-l-2 border-secondary/40 pl-4 sm:pl-5 mb-4">
                  <p className="type-eyebrow text-secondary mb-1.5">
                    Sattvic Cuisine
                  </p>
                  <h3 className="font-serif text-lg md:text-xl text-ink leading-tight mb-2">
                    Nourishing meals for a{" "}
                    <span className="text-primary">yogic life</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-muted font-sans leading-relaxed">
                    {FOOD_CONTENT.description}
                  </p>
                </div>

                <ul className="space-y-2 mb-3">
                  {FOOD_CONTENT.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2.5 rounded-xl bg-white/70 border border-ink/5 p-2.5"
                    >
                      <span className="w-6 h-6 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0 border border-secondary/10">
                        <Check size={11} className="stroke-[2.5]" />
                      </span>
                      <span className="text-xs sm:text-sm text-ink/80 font-sans leading-snug pt-0.5">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="rounded-2xl border border-secondary/15 bg-white p-3 sm:p-4 shadow-xs">
                  <p className="type-eyebrow text-secondary mb-1.5">
                    Something in particular?
                  </p>
                  <p className="text-xs sm:text-sm text-muted font-sans leading-relaxed">
                    {FOOD_CONTENT.dietaryNote}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      <MediaLightbox
        isOpen={lightbox !== null}
        onClose={() => setLightbox(null)}
        items={(lightbox?.items ?? []).map((item) => ({
          type: "image" as const,
          url: item.url,
        }))}
        activeIndex={lightbox?.index ?? 0}
        onChangeActiveIndex={(index) =>
          setLightbox((prev) => (prev ? { ...prev, index } : null))
        }
        title={lightbox?.title ?? "Gallery"}
      />
    </section>
  );
}
