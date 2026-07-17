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
import { resolveFacilityByLabel } from "@/components/courses/facility-icons";
import type { RetreatAccommodation } from "@/content/types/retreat-page";
import type {
  RetreatAccommodationContent,
  SharedAccommodationGallery,
  SharedGalleryImage,
} from "@/content/types/shared-sections";
import { Check, ChevronLeft, ChevronRight } from "@/icons";
import { isSectionLive } from "@/lib/cms/section-visibility";
import {
  EASE_OUT,
  fadeUp,
  reducedTransition,
  VIEWPORT_ONCE,
} from "@/lib/motion";

type MainTab = "lodging" | "food";

type RetreatAccommodationSectionProps = {
  accommodation: RetreatAccommodation;
  facilities: string[];
  roomGalleries: SharedAccommodationGallery[];
  foodGallery: SharedGalleryImage[];
  mealHighlights: string[];
  /** Shared retreat lodging document (for lodging/food live flags) */
  lodgingContent?: RetreatAccommodationContent | null;
};

type ParsedAccommodation = {
  intro: string[];
  roomTypes: string[];
  foodParagraphs: string[];
};

function parseAccommodationBody(body: string): ParsedAccommodation {
  const parts = body
    .split("\n\n")
    .map((part) => part.trim())
    .filter(Boolean);

  const intro: string[] = [];
  const roomTypes: string[] = [];
  const foodParagraphs: string[] = [];
  let inFood = false;

  for (const part of parts) {
    if (/^food$/i.test(part)) {
      inFood = true;
      continue;
    }

    if (inFood) {
      foodParagraphs.push(part);
      continue;
    }

    const isRoomLabel =
      /room/i.test(part) && part.length < 80 && !part.includes(".");
    if (isRoomLabel) {
      roomTypes.push(part);
    } else if (part.length < 80) {
      roomTypes.push(part);
    } else {
      intro.push(part);
    }
  }

  return { intro, roomTypes, foodParagraphs };
}

function RetreatGalleryPanel({
  images,
  label,
  onOpenLightbox,
}: {
  images: SharedGalleryImage[];
  label: string;
  onOpenLightbox: (index: number) => void;
}) {
  const prefersReduced = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const isInView = useInView(panelRef, { amount: 0.2 });

  const active = images[activeIndex] ?? images[0];

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isInView || isPaused || prefersReduced || images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isInView, isPaused, prefersReduced, images.length]);

  useEffect(() => {
    const list = scrollRef.current;
    if (!list) return;
    const thumb = list.children[activeIndex] as HTMLElement | undefined;
    if (!thumb) return;

    list.scrollTo({
      left: Math.max(
        0,
        thumb.offsetLeft - list.clientWidth / 2 + thumb.offsetWidth / 2,
      ),
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, [activeIndex, prefersReduced]);

  if (!active) return null;

  return (
    <section
      ref={panelRef}
      aria-label={`${label} gallery`}
      className="flex min-w-0 flex-col gap-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="relative">
        <div
          className="pointer-events-none absolute -inset-1.5 rounded-2xl bg-linear-to-br from-primary/8 via-transparent to-accent/10 blur-md"
          aria-hidden="true"
        />

        <div className="group relative aspect-[5/3] overflow-hidden rounded-3xl">
          <AnimatePresence mode="popLayout">
            <motion.button
              key={active.url}
              type="button"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              onClick={() => onOpenLightbox(activeIndex)}
              className="absolute inset-0 h-full w-full cursor-zoom-in"
              aria-label={`View ${active.title} fullscreen`}
            >
              <Image
                src={active.url}
                alt={active.title}
                fill
                priority={activeIndex === 0}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
              />
            </motion.button>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/25 via-transparent to-transparent" />

          <span className="hero-glass pointer-events-none absolute top-3 left-3 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
            {label}
          </span>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute top-1/2 left-2 -translate-y-1/2 cursor-pointer rounded-full border border-white/15 bg-black/45 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 sm:opacity-0 sm:group-hover:opacity-100"
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
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-full border border-white/15 bg-black/45 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Next photo"
              >
                <ChevronRight size={16} />
              </button>
              <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] tabular-nums text-muted shadow-soft">
                {activeIndex + 1} / {images.length}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenLightbox(activeIndex)}
          className="absolute -bottom-2.5 right-3 cursor-pointer rounded-full border border-ink/8 bg-white px-3 py-1.5 text-[10px] font-semibold text-ink shadow-soft transition-all hover:border-primary/20 hover:shadow-md sm:right-4"
        >
          Open full gallery
        </button>
      </div>

      {images.length > 1 && (
        <div className="surface-panel overflow-hidden rounded-xl p-2 shadow-xs">
          <ul
            ref={scrollRef}
            className="scrollbar-none flex max-w-full touch-pan-x gap-2 overflow-x-auto overscroll-x-contain py-0.5 snap-x snap-mandatory"
            aria-label={`${label} thumbnails`}
          >
            {images.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={item.url} className="shrink-0 snap-center">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-14 w-14 overflow-hidden rounded-lg border-2 transition-all sm:h-16 sm:w-16 ${
                      isActive
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent opacity-55 hover:opacity-100"
                    }`}
                    aria-label={item.title}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <Image
                      src={item.url}
                      alt=""
                      fill
                      sizes="64px"
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
  galleries,
  activeId,
  onChange,
}: {
  galleries: SharedAccommodationGallery[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="type-eyebrow text-primary">Choose your room</p>
      <div className="flex flex-col gap-2">
        {galleries.map((room) => {
          const isActive = room.id === activeId;
          const thumb = room.images[0]?.url;
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => onChange(room.id)}
              aria-pressed={isActive}
              className={`group flex w-full items-center gap-3 rounded-2xl border px-2.5 py-2 text-left transition-all duration-300 ${
                isActive
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
                    className={`object-cover transition-transform duration-500 ${
                      isActive ? "scale-105" : "group-hover:scale-105"
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

function FacilitiesGrid({ facilities }: { facilities: string[] }) {
  return (
    <div className="rounded-3xl border border-ink/8 bg-linear-to-br from-white via-white to-accent/5 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-ink/5 pb-3">
        <div>
          <p className="type-eyebrow mb-0.5 text-primary">Campus facilities</p>
          <p className="type-ui max-w-xl text-muted">
            Included with your stay — comfortable, clean & local amenities.
          </p>
        </div>
        <span className="type-eyebrow rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 text-primary">
          {facilities.length} amenities
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {facilities.map((item) => {
          const facility = resolveFacilityByLabel(item);
          const Icon = facility.icon;
          const isPaidExtra = Boolean(facility.note);

          return (
            <li
              key={item}
              className="surface-panel flex items-start gap-2 rounded-xl p-2.5 transition-shadow hover:shadow-soft"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                  isPaidExtra
                    ? "border-ink/10 bg-ink/5 text-ink"
                    : "border-ink/8 bg-primary/10 text-primary"
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
  title: React.ReactNode;
  description: string;
}) {
  return (
    <div className="border-l-2 border-primary/30 pl-4 sm:pl-5">
      <p className="type-eyebrow mb-1.5 text-primary">{eyebrow}</p>
      <h3 className="mb-2 font-serif text-lg leading-tight text-ink md:text-xl">
        {title}
      </h3>
      <p className="type-body leading-relaxed text-muted">{description}</p>
    </div>
  );
}

/**
 * Retreat lodging + food section. Galleries load from MySQL via the parent.
 *
 * @param props - Retreat copy, facilities, and shared lodging media
 */
export default function RetreatAccommodationSection({
  accommodation,
  facilities,
  roomGalleries,
  foodGallery,
  mealHighlights,
  lodgingContent = null,
}: RetreatAccommodationSectionProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const showLodging =
    isSectionLive(lodgingContent?.accommodation) &&
    lodgingContent?.lodgingLive !== false &&
    roomGalleries.length > 0;
  const showFood =
    isSectionLive(lodgingContent?.food) &&
    lodgingContent?.foodLive !== false &&
    (foodGallery.length > 0 || mealHighlights.length > 0);

  const initialTab: MainTab = showLodging ? "lodging" : "food";
  const [mainTab, setMainTab] = useState<MainTab>(initialTab);
  const [roomTab, setRoomTab] = useState(roomGalleries[0]?.id ?? "private");
  const [lightbox, setLightbox] = useState<{
    items: SharedGalleryImage[];
    index: number;
    title: string;
  } | null>(null);

  const { intro, foodParagraphs } = parseAccommodationBody(accommodation.body);
  const activeRoom =
    roomGalleries.find((room) => room.id === roomTab) ?? roomGalleries[0];

  const openLightbox = (
    images: SharedGalleryImage[],
    index: number,
    title: string,
  ) => {
    setLightbox({ items: images, index, title });
  };

  if (!showLodging && !showFood) {
    return null;
  }

  if (showLodging && !activeRoom) {
    return null;
  }

  const lodgingFoodTabs = [
    ...(showLodging ? [{ id: "lodging" as const, label: "Ashram Lodging" }] : []),
    ...(showFood ? [{ id: "food" as const, label: "Sattvic Food" }] : []),
  ];

  return (
    <section
      id="accommodation"
      className="relative overflow-hidden bg-white py-16 sm:py-20"
    >
      <div
        className="absolute left-[-8%] top-[40%] w-[240px] h-[240px] rounded-full bg-primary/5 blur-[80px] pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative w-full">
        <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          {/* Left Column: Title, tabs and descriptions (col-span-5) */}
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-5">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              variants={fadeUp}
              className="space-y-4 border-b border-ink/5 pb-5"
            >
              <SectionHeader
                eyebrow="Retreat Life"
                title={
                  <>
                    Accommodation &amp;{" "}
                    <span className="text-primary">Food</span>
                  </>
                }
                align="left"
                className="mb-4"
              />

              {lodgingFoodTabs.length > 1 ? (
                <TabSwitcher
                  tabs={lodgingFoodTabs}
                  activeId={mainTab}
                  onChange={(id) => setMainTab(id as MainTab)}
                  layoutId="retreatAccommodationTabs"
                  variant="pill"
                  size="sm"
                  className="!justify-start !px-0 pb-0"
                />
              ) : null}
            </motion.div>

            <AnimatePresence mode="wait">
              {mainTab === "lodging" && showLodging ? (
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
                    eyebrow="Retreat Lodging"
                    title={
                      <>
                        Comfortable stay in the{" "}
                        <span className="text-primary">heart of Rishikesh</span>
                      </>
                    }
                    description={
                      intro.join("\n\n") ||
                      "Enjoy luxurious rooms with serene mountain views and fresh Himalayan air. Our accommodation options offer a perfect space to unwind and reflect."
                    }
                  />

                  <RoomTypeSelector
                    galleries={roomGalleries}
                    activeId={roomTab}
                    onChange={setRoomTab}
                  />
                </motion.div>
              ) : showFood ? (
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
                    description={
                      foodParagraphs.join("\n\n") ||
                      "We serve nutritious, vegetarian, 100% sattvic meals that are freshly prepared daily to nourish your body and mind."
                    }
                  />

                  <ul className="space-y-2">
                    {mealHighlights.map((point) => (
                      <li
                        key={point}
                        className="surface-panel flex gap-2.5 rounded-xl p-2.5 shadow-2xs"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-ink/8 bg-primary/10 text-primary">
                          <Check size={11} className="stroke-[2.5]" />
                        </span>
                        <span className="type-body pt-0.5 leading-snug text-ink/80 font-sans">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Right Column: Slide Panel (col-span-7) */}
          <div className="min-w-0 lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={
                  mainTab === "lodging" && showLodging
                    ? `gallery-${roomTab}`
                    : "food-gallery"
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
                <RetreatGalleryPanel
                  images={
                    mainTab === "lodging" && showLodging && activeRoom
                      ? [...activeRoom.images]
                      : foodGallery
                  }
                  label={
                    mainTab === "lodging" && activeRoom
                      ? activeRoom.label
                      : "Sattvic Cuisine"
                  }
                  onOpenLightbox={(index) =>
                    openLightbox(
                      mainTab === "lodging" && activeRoom
                        ? [...activeRoom.images]
                        : foodGallery,
                      index,
                      mainTab === "lodging" && activeRoom
                        ? activeRoom.label
                        : "Sattvic Food & Dining",
                    )
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Row: Facilities or Dietary Notes */}
          {mainTab === "lodging" && showLodging ? (
            <div className="col-span-1 lg:col-span-12 mt-8">
              <FacilitiesGrid facilities={facilities} />
            </div>
          ) : showFood ? (
            <div className="col-span-1 lg:col-span-12 mt-8">
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:p-5">
                <p className="type-eyebrow mb-1 text-primary">
                  Dietary Restrictions?
                </p>
                <p className="type-ui max-w-4xl leading-relaxed text-muted">
                  Please share dietary restrictions before booking so our
                  kitchen team can prepare accordingly. Gluten-free and other
                  special requirements are accommodated upon request.
                </p>
              </div>
            </div>
          ) : null}
        </div>
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
