"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
  FACILITY_ITEMS,
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
          className={`absolute -inset-1.5 rounded-2xl bg-linear-to-br ${accent === "secondary"
              ? "from-secondary/10 via-transparent to-accent/10"
              : "from-primary/10 via-transparent to-accent/10"
            } blur-md pointer-events-none`}
          aria-hidden="true"
        />

        <div
          className={`relative aspect-[5/3] md:aspect-[4/3] rounded-3xl overflow-hidden group`}
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
        <div className="surface-panel overflow-hidden rounded-xl p-2 shadow-xs">
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
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer ${isActive
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
    <div className="space-y-2">
      <p className="type-eyebrow text-secondary">Choose your room</p>
      <div className="flex flex-col gap-2">
        {ACCOMMODATION_GALLERIES.map((room) => {
          const isActive = room.id === activeId;
          const thumb = room.images[0]?.url;
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => onChange(room.id)}
              aria-pressed={isActive}
              className={`group flex w-full items-center gap-3 rounded-2xl border px-2.5 py-2 text-left transition-all duration-300 ${isActive
                  ? "border-primary/25 bg-primary/5 shadow-xs ring-1 ring-primary/10"
                  : "surface-panel border-ink/8 hover:border-primary/15"
                }`}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl shadow-xs">
                {thumb && (
                  <Image
                    src={thumb}
                    alt={room.label}
                    fill
                    sizes="48px"
                    className={`object-cover transition-transform duration-500 ${isActive ? "scale-105" : "group-hover:scale-105"
                      }`}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`type-ui font-medium leading-snug ${isActive ? "text-ink" : "text-ink/75"}`}
                >
                  {room.label}
                </p>
                <p className="type-eyebrow mt-0.5 line-clamp-1 text-muted">
                  {room.images.length} photos
                </p>
              </div>

              {isActive && (
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FacilitiesGrid() {
  return (
    <div className="rounded-3xl border border-secondary/10 bg-linear-to-br from-white via-white to-secondary/5 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-ink/5 pb-3">
        <div>
          <p className="type-eyebrow mb-0.5 text-secondary">
            Campus facilities
          </p>
          <p className="type-ui max-w-xl text-muted">
            Included with your stay — optional add-ons for cooler months.
          </p>
        </div>
        <span className="type-eyebrow rounded-full border border-secondary/15 bg-secondary/5 px-2.5 py-0.5 text-secondary">
          {FACILITY_ITEMS.length} amenities
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {FACILITY_ITEMS.map((facility) => {
          const Icon = facility.icon;
          const isPaidExtra = Boolean(facility.note);

          return (
            <li
              key={facility.label}
              className="surface-panel flex items-start gap-2 rounded-xl p-2.5 transition-shadow hover:shadow-soft"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${isPaidExtra
                    ? "border-ink/10 bg-ink/5 text-ink"
                    : "border-primary/10 bg-primary/10 text-primary"
                  }`}
              >
                <Icon size={14} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="type-ui font-medium leading-snug text-ink">
                  {facility.label}
                </p>
                {facility.note ? (
                  <p className="type-eyebrow mt-0.5 text-muted">
                    {facility.note}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TabIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
}) {
  return (
    <div className="border-l-2 border-secondary/35 pl-4 sm:pl-5">
      <p className="type-eyebrow mb-1.5 text-secondary">{eyebrow}</p>
      <h3 className="mb-2 font-serif text-lg leading-tight text-ink md:text-xl">
        {title}
      </h3>
      <p className="type-body leading-relaxed text-muted">{description}</p>
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
      className="relative overflow-hidden bg-white py-8 sm:py-10"
    >
      <div
        className="absolute left-[-8%] top-[40%] w-[240px] h-[240px] rounded-full bg-secondary/5 blur-[80px] pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative w-full">
        <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-5">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              variants={fadeUp}
              className="space-y-4 border-b border-ink/5 pb-5"
            >
              <SectionHeader
                eyebrow="Residential Life"
                title={
                  <>
                    Accommodation &amp;{" "}
                    <span className="text-primary">Food</span>
                  </>
                }
                align="left"
                className="mb-4"
              />

              <TabSwitcher
                tabs={[
                  { id: "lodging", label: "Ashram Lodging" },
                  { id: "food", label: "Sattvic Food" },
                ]}
                activeId={mainTab}
                onChange={(id) => setMainTab(id as MainTab)}
                layoutId="accommodationMainTabs"
                variant="pill"
                size="sm"
                className="!justify-start !px-0 pb-0"
              />
            </motion.div>

            <AnimatePresence mode="wait">
              {mainTab === "lodging" ? (
                <motion.div
                  key="lodging"
                  id="lodging"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={reducedTransition(prefersReduced, {
                    duration: 0.28,
                    ease: EASE_OUT,
                  })}
                  className="space-y-5"
                >
                  <TabIntro
                    eyebrow="Ashram Lodging"
                    title={
                      <>
                        Comfortable stay in the{" "}
                        <span className="text-primary">heart of Rishikesh</span>
                      </>
                    }
                    description={COMFORTABLE_STAY.description}
                  />

                  <RoomTypeSelector activeId={roomTab} onChange={setRoomTab} />
                </motion.div>
              ) : (
                <motion.div
                  key="food"
                  id="food"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={reducedTransition(prefersReduced, {
                    duration: 0.28,
                    ease: EASE_OUT,
                  })}
                  className="space-y-5"
                >
                  <TabIntro
                    eyebrow="Sattvic Cuisine"
                    title={
                      <>
                        Nourishing meals for a{" "}
                        <span className="text-primary">yogic life</span>
                      </>
                    }
                    description={FOOD_CONTENT.description}
                  />

                  <ul className="space-y-2">
                    {FOOD_CONTENT.points.map((point) => (
                      <li
                        key={point}
                        className="surface-panel flex gap-2.5 rounded-xl p-2.5"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-secondary/10 bg-secondary/10 text-secondary">
                          <Check size={11} className="stroke-[2.5]" />
                        </span>
                        <span className="type-body pt-0.5 leading-snug text-ink/80">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={
                  mainTab === "lodging" ? `gallery-${roomTab}` : "food-gallery"
                }
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={reducedTransition(prefersReduced, {
                  duration: 0.32,
                  ease: EASE_OUT,
                })}
                className="lg:sticky lg:top-28"
              >
                <ImageGalleryPanel
                  key={mainTab === "lodging" ? roomTab : "food"}
                  images={
                    mainTab === "lodging"
                      ? [...activeRoom.images]
                      : FOOD_GALLERY
                  }
                  label={
                    mainTab === "lodging" ? activeRoom.label : "Sattvic Cuisine"
                  }
                  accent={mainTab === "lodging" ? "primary" : "secondary"}
                  onOpenLightbox={(index) =>
                    openLightbox(
                      mainTab === "lodging"
                        ? [...activeRoom.images]
                        : FOOD_GALLERY,
                      index,
                      mainTab === "lodging"
                        ? activeRoom.label
                        : "Sattvic Food & Dining",
                    )
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {mainTab === "food" && (
              <motion.div
                key="food-dietary-note"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={reducedTransition(prefersReduced, {
                  duration: 0.28,
                  ease: EASE_OUT,
                })}
                className="col-span-1 lg:col-span-12"
              >
                <div className="rounded-2xl border border-secondary/15 bg-secondary/5 p-4 sm:p-5">
                  <p className="type-eyebrow mb-1 text-secondary">
                    Something in particular?
                  </p>
                  <p className="type-ui max-w-4xl leading-relaxed text-muted">
                    {FOOD_CONTENT.dietaryNote}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {mainTab === "lodging" && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="mt-6 lg:mt-8"
          >
            <FacilitiesGrid />
          </motion.div>
        )}
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
