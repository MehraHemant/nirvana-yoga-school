"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
import { Check, ChevronLeft, ChevronRight, HeroFlourish } from "@/icons";
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
  const scrollRef = useRef<HTMLUListElement>(null);

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
    <div className="flex flex-col gap-4 min-w-0">
      <div className="relative">
        <div
          className={`absolute -inset-2 rounded-[1.75rem] bg-linear-to-br ${
            accent === "secondary"
              ? "from-secondary/10 via-transparent to-accent/10"
              : "from-primary/10 via-transparent to-accent/10"
          } blur-md pointer-events-none`}
          aria-hidden="true"
        />

        <div
          className={`relative aspect-[5/4] lg:aspect-[4/3] rounded-3xl overflow-hidden bg-ink shadow-card ring-1 group ${accentRing}`}
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

          <div className="absolute top-4 left-4 pointer-events-none">
            <span className="hero-glass px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
              {label}
            </span>
          </div>

          <div className="absolute top-4 right-4 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full bg-black/45 border border-white/10 text-[10px] text-white font-semibold backdrop-blur-sm tabular-nums">
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
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/45 hover:bg-black/70 border border-white/15 text-white backdrop-blur-sm transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105"
                aria-label="Previous photo"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/45 hover:bg-black/70 border border-white/15 text-white backdrop-blur-sm transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105"
                aria-label="Next photo"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 pointer-events-none">
            <p className="font-serif text-lg text-white leading-tight truncate mb-2">
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
          className="absolute -bottom-3 right-4 sm:right-6 px-4 py-2 rounded-full bg-white border border-ink/8 text-[11px] font-semibold text-ink shadow-soft hover:shadow-md hover:border-primary/20 transition-all cursor-pointer font-sans"
        >
          Open full gallery
        </button>
      </div>

      {images.length > 1 && (
        <div className="rounded-2xl border border-ink/6 bg-white/80 backdrop-blur-sm p-3 shadow-xs overflow-hidden">
          <ul
            ref={scrollRef}
            className="flex gap-2.5 overflow-x-auto overscroll-x-contain scrollbar-none snap-x snap-mandatory py-0.5 max-w-full"
            aria-label={`${label} thumbnails`}
          >
            {images.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={item.url} className="shrink-0 snap-center">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative w-[4.25rem] h-[4.25rem] sm:w-[5rem] sm:h-[5rem] rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
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
    </div>
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
    <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-5">
      {ACCOMMODATION_GALLERIES.map((room) => {
        const isActive = room.id === activeId;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onChange(room.id)}
            className={`text-left rounded-2xl border px-3.5 py-3 transition-all duration-300 cursor-pointer ${
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
      className="relative py-14 sm:py-16 lg:py-4 lg:min-h-[calc(100svh-5.5rem)] lg:flex lg:items-center bg-paper overflow-hidden"
    >
      <div
        className="absolute left-[-8%] top-[40%] w-[320px] h-[320px] rounded-full bg-secondary/5 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative w-full py-6 lg:py-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="text-center max-w-2xl mx-auto mb-8 lg:mb-10"
        >
          <SectionHeader
            eyebrow="Residential Life"
            title={
              <>
                Accommodation &{" "}
                <span className="text-primary">Food</span>
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
          className="mb-8 lg:mb-10"
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
              className="grid lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-14 items-start"
            >
              <div className="lg:col-span-5 order-2 lg:order-1 min-w-0">
                <div className="border-l-2 border-primary/30 pl-5 sm:pl-6 mb-6">
                  <p className="type-eyebrow text-primary mb-2">
                    Ashram Accommodation
                  </p>
                  <h3 className="font-serif text-xl md:text-2xl text-ink leading-tight mb-3">
                    Comfortable stay in the{" "}
                    <span className="text-primary">
                      heart of Rishikesh
                    </span>
                  </h3>
                  <p className="text-sm text-muted font-sans leading-relaxed">
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
                    className="text-sm text-muted font-sans leading-relaxed mb-5"
                  >
                    {activeRoom.description}
                  </motion.p>
                </AnimatePresence>

                <div className="rounded-3xl bg-white/70 border border-ink/6 p-4 sm:p-5 shadow-xs">
                  <p className="type-eyebrow text-secondary mb-3">
                    Campus facilities
                  </p>
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
                    {FACILITIES.map((facility) => (
                      <li
                        key={facility}
                        className="flex items-center gap-2 text-[11px] sm:text-xs text-ink/75 font-sans"
                      >
                        <span className="w-4 h-4 rounded-full bg-primary/8 text-primary flex items-center justify-center shrink-0">
                          <Check size={9} className="stroke-[3]" />
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
              className="grid lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-14 items-start"
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
                <div className="border-l-2 border-secondary/40 pl-5 sm:pl-6 mb-6">
                  <p className="type-eyebrow text-secondary mb-2">
                    Sattvic Cuisine
                  </p>
                  <h3 className="font-serif text-xl md:text-2xl text-ink leading-tight mb-3">
                    Nourishing meals for a{" "}
                    <span className="text-primary">yogic life</span>
                  </h3>
                  <p className="text-sm text-muted font-sans leading-relaxed">
                    {FOOD_CONTENT.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-5">
                  {FOOD_CONTENT.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 rounded-2xl bg-white/70 border border-ink/5 p-3.5"
                    >
                      <span className="w-7 h-7 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 border border-secondary/10">
                        <Check size={13} className="stroke-[2.5]" />
                      </span>
                      <span className="text-sm text-ink/80 font-sans leading-relaxed pt-0.5">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="rounded-3xl border border-secondary/15 bg-white p-4 sm:p-5 shadow-xs">
                  <p className="type-eyebrow text-secondary mb-2">
                    Something in particular?
                  </p>
                  <p className="text-sm text-muted font-sans leading-relaxed">
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
