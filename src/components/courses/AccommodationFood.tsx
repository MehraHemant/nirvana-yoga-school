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
          className={`relative aspect-[5/3] rounded-3xl overflow-hidden group`}
        >
          <AnimatePresence mode="popLayout">
            <motion.button
              key={active.url}
              type="button"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              // exit={{ opacity: 0 }}
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

          {/* <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent pointer-events-none" /> */}

          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="hero-glass px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-white">
              {label}
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
    <div className="flex flex-col gap-2.5">
      {ACCOMMODATION_GALLERIES.map((room, i) => {
        const isActive = room.id === activeId;
        const thumb = room.images[0]?.url;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onChange(room.id)}
            aria-pressed={isActive}
            className={`group flex items-center gap-3.5 w-full rounded-2xl border p-2.5 text-left cursor-pointer transition-all duration-300 ${
              isActive
                ? "border-primary/30 bg-white shadow-card ring-1 ring-primary/10"
                : "border-ink/8 bg-sand/60 hover:bg-white hover:border-ink/15 hover:shadow-xs"
            }`}
          >
            {/* Room photo */}
            <div className="relative w-[4.5rem] h-[4.5rem] rounded-xl overflow-hidden shrink-0 shadow-xs">
              {thumb && (
                <Image
                  src={thumb}
                  alt={room.label}
                  fill
                  sizes="72px"
                  className={`object-cover transition-transform duration-500 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                />
              )}
              {isActive && (
                <div className="absolute inset-0 ring-2 ring-primary/50 ring-inset rounded-xl" />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <span className={`block type-eyebrow text-[9px] mb-0.5 ${isActive ? "text-primary" : "text-muted/60"}`}>
                0{i + 1}
              </span>
              <p className={`font-serif text-sm sm:text-[15px] leading-snug mb-0.5 ${isActive ? "text-ink font-medium" : "text-ink/70"}`}>
                {room.label}
              </p>
              <p className="text-[10px] text-muted font-sans line-clamp-1 leading-snug">
                {room.description}
              </p>
            </div>

            {/* Photo count + active pulse */}
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
              <span className={`text-[9px] font-semibold tabular-nums px-2 py-0.5 rounded-full ${isActive ? "bg-primary/10 text-primary" : "bg-ink/6 text-muted"}`}>
                {room.images.length} photos
              </span>
            </div>
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
      className="relative overflow-hidden bg-white py-8 sm:py-10 lg:min-h-[calc(100svh-5.5rem)] lg:flex lg:flex-col"
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
          className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <SectionHeader
            eyebrow="Residential Life"
            title={
              <>
                Accommodation &amp; <span className="text-primary">Food</span>
              </>
            }
            align="left"
            className="mb-0!"
          />
          <TabSwitcher
            tabs={[
              { id: "lodging", label: "Ashram Lodging" },
              { id: "food", label: "Sattvic Food" },
            ]}
            activeId={mainTab}
            onChange={(id) => setMainTab(id as MainTab)}
            layoutId="accommodationMainTabs"
            className="shrink-0"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {mainTab === "lodging" ? (
            <motion.div
              key="lodging"
              id="lodging"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={reducedTransition(prefersReduced, {
                duration: 0.3,
                ease: EASE_OUT,
              })}
              className="grid items-start gap-5 lg:grid-cols-12 lg:gap-7"
            >
              <div className="min-w-0 lg:col-span-7">
                <ImageGalleryPanel
                  key={roomTab}
                  images={[...activeRoom.images]}
                  label={activeRoom.label}
                  accent="primary"
                  onOpenLightbox={(index) =>
                    openLightbox([...activeRoom.images], index, activeRoom.label)
                  }
                />
              </div>

              <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
                <div>
                  <p className="mb-1 font-serif text-base leading-snug text-ink md:text-lg">
                    Choose your <span className="text-primary">room type</span>
                  </p>
                  <p className="font-sans text-xs leading-relaxed text-muted">
                    {COMFORTABLE_STAY.description}
                  </p>
                </div>

                <RoomTypeSelector activeId={roomTab} onChange={setRoomTab} />

                <div className="rounded-2xl border border-ink/6 bg-white/70 p-3 shadow-xs">
                  <p className="type-eyebrow mb-2 text-secondary">
                    Campus facilities
                  </p>
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {FACILITIES.map((facility) => (
                      <li
                        key={facility}
                        className="flex items-center gap-1.5 font-sans text-[10px] text-ink/75 sm:text-[11px]"
                      >
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
                          <Check size={8} className="stroke-[3]" />
                        </span>
                        {facility}
                      </li>
                    ))}
                  </ul>
                </div>
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
              className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8"
            >
              <div className="order-2 min-w-0 lg:order-1 lg:col-span-5">
                <div className="mb-4 border-l-2 border-secondary/40 pl-4 sm:pl-5">
                  <p className="type-eyebrow mb-1.5 text-secondary">
                    Sattvic Cuisine
                  </p>
                  <h3 className="mb-2 font-serif text-lg leading-tight text-ink md:text-xl">
                    Nourishing meals for a{" "}
                    <span className="text-primary">yogic life</span>
                  </h3>
                  <p className="font-sans text-xs leading-relaxed text-muted sm:text-sm">
                    {FOOD_CONTENT.description}
                  </p>
                </div>

                <ul className="mb-3 space-y-2">
                  {FOOD_CONTENT.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2.5 rounded-xl border border-ink/5 bg-white/70 p-2.5"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-secondary/10 bg-secondary/10 text-secondary">
                        <Check size={11} className="stroke-[2.5]" />
                      </span>
                      <span className="pt-0.5 font-sans text-xs leading-snug text-ink/80 sm:text-sm">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="rounded-2xl border border-secondary/15 bg-white p-3 shadow-xs sm:p-4">
                  <p className="type-eyebrow mb-1.5 text-secondary">
                    Something in particular?
                  </p>
                  <p className="font-sans text-xs leading-relaxed text-muted sm:text-sm">
                    {FOOD_CONTENT.dietaryNote}
                  </p>
                </div>
              </div>

              <div className="order-1 min-w-0 lg:order-2 lg:col-span-7">
                <ImageGalleryPanel
                  images={FOOD_GALLERY}
                  label="Sattvic Cuisine"
                  accent="secondary"
                  onOpenLightbox={(index) =>
                    openLightbox(FOOD_GALLERY, index, "Sattvic Food & Dining")
                  }
                />
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
