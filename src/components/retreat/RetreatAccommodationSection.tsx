"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { MediaLightbox, TabSwitcher } from "@/components/ui";
import type { RetreatAccommodation } from "@/content/types/retreat-page";
import { resolveFacilityItem } from "@/data/accommodationFacilities";
import {
  RETREAT_FOOD_GALLERY,
  RETREAT_MEAL_HIGHLIGHTS,
  RETREAT_ROOM_GALLERIES,
  type RetreatGalleryImage,
  type RetreatRoomGalleryId,
} from "@/data/retreatAccommodation";
import { Check, ChevronLeft, ChevronRight } from "@/icons";
import { EASE_OUT } from "@/lib/motion";
import RetreatSectionShell from "./RetreatSectionShell";

type MainTab = "lodging" | "food";

type RetreatAccommodationSectionProps = {
  accommodation: RetreatAccommodation;
  facilities: string[];
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
  images: RetreatGalleryImage[];
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
          className="pointer-events-none absolute -inset-1.5 rounded-2xl bg-linear-to-br from-secondary/10 via-transparent to-accent/10 blur-md"
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
          className="absolute -bottom-2.5 right-3 cursor-pointer rounded-full border border-ink/8 bg-white px-3 py-1.5 text-[10px] font-semibold text-ink shadow-soft transition-all hover:border-secondary/20 hover:shadow-md sm:right-4"
        >
          Open full gallery
        </button>
      </div>

      {images.length > 1 && (
        <div className="overflow-hidden rounded-xl border border-secondary/10 bg-white/80 p-2 shadow-xs">
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
                        ? "border-secondary ring-2 ring-secondary/20"
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
  activeId,
  onChange,
}: {
  activeId: RetreatRoomGalleryId;
  onChange: (id: RetreatRoomGalleryId) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {RETREAT_ROOM_GALLERIES.map((room, index) => {
        const isActive = room.id === activeId;
        const thumb = room.images[0]?.url;

        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onChange(room.id)}
            aria-pressed={isActive}
            className={`group flex items-center gap-3.5 rounded-2xl border p-3 text-left transition-all ${
              isActive
                ? "border-secondary/30 bg-white shadow-card ring-1 ring-secondary/10"
                : "border-secondary/10 bg-white hover:border-secondary/20 hover:shadow-xs"
            }`}
          >
            <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl shadow-xs">
              {thumb && (
                <Image
                  src={thumb}
                  alt={room.label}
                  fill
                  sizes="72px"
                  className={`object-cover transition-transform duration-500 ${
                    isActive ? "scale-110" : "group-hover:scale-105"
                  }`}
                />
              )}
              {isActive && (
                <div className="absolute inset-0 rounded-xl ring-2 ring-secondary/40 ring-inset" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span
                className={`type-eyebrow mb-0.5 block text-[9px] ${
                  isActive ? "text-secondary" : "text-muted/70"
                }`}
              >
                0{index + 1}
              </span>
              <p
                className={`font-serif text-sm leading-snug sm:text-[15px] ${
                  isActive ? "font-medium text-ink" : "text-ink/75"
                }`}
              >
                {room.label}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted">
                {room.description}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold tabular-nums ${
                isActive
                  ? "bg-secondary/10 text-secondary"
                  : "bg-ink/5 text-muted"
              }`}
            >
              {room.images.length} photos
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function RetreatAccommodationSection({
  accommodation,
  facilities,
}: RetreatAccommodationSectionProps) {
  const [mainTab, setMainTab] = useState<MainTab>("lodging");
  const [roomTab, setRoomTab] = useState<RetreatRoomGalleryId>("private");
  const [lightbox, setLightbox] = useState<{
    items: RetreatGalleryImage[];
    index: number;
    title: string;
  } | null>(null);

  const { intro, foodParagraphs } = parseAccommodationBody(accommodation.body);
  const activeRoom =
    RETREAT_ROOM_GALLERIES.find((room) => room.id === roomTab) ??
    RETREAT_ROOM_GALLERIES[0];

  const openLightbox = (
    images: RetreatGalleryImage[],
    index: number,
    title: string,
  ) => {
    setLightbox({ items: images, index, title });
  };

  return (
    <RetreatSectionShell id="accommodation" title="Accommodation & Food">
      <div className="space-y-8">
        <TabSwitcher
          tabs={[
            { id: "lodging", label: "Lodging" },
            { id: "food", label: "Food" },
          ]}
          activeId={mainTab}
          onChange={(id) => setMainTab(id as MainTab)}
          layoutId="retreatAccommodationTab"
          variant="pill"
        />

        {mainTab === "lodging" ? (
          <div className="space-y-8">
            {intro.length > 0 && (
              <div className="max-w-3xl space-y-4 rounded-3xl border border-ink/5 bg-white p-6 shadow-xs">
                {intro.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="type-body leading-relaxed text-ink/85"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:items-start">
              <RoomTypeSelector activeId={roomTab} onChange={setRoomTab} />

              <RetreatGalleryPanel
                key={activeRoom.id}
                images={activeRoom.images}
                label={activeRoom.label}
                onOpenLightbox={(index) =>
                  openLightbox(activeRoom.images, index, activeRoom.label)
                }
              />
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-4 shadow-xs sm:p-5">
              <h3 className="font-serif text-xl text-ink">Facilities</h3>
              <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {facilities.map((item) => {
                  const facility = resolveFacilityItem(item);
                  const Icon = facility.icon;
                  const isPaidExtra = Boolean(facility.note);

                  return (
                    <li
                      key={item}
                      className="flex items-start gap-2 rounded-xl border border-ink/5 bg-white px-2.5 py-2"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                          isPaidExtra
                            ? "border-ink/10 bg-ink/5 text-ink"
                            : "border-secondary/15 bg-secondary/10 text-secondary"
                        }`}
                      >
                        <Icon size={14} strokeWidth={2} />
                      </span>
                      <div className="min-w-0">
                        <p className="type-ui font-medium leading-snug text-ink/90">
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
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
            <div className="space-y-5">
              {foodParagraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="type-body leading-relaxed text-ink/85"
                >
                  {paragraph}
                </p>
              ))}

              <ul className="space-y-2.5">
                {RETREAT_MEAL_HIGHLIGHTS.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-ink/85"
                  >
                    <Check size={14} className="shrink-0 text-secondary" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="rounded-2xl border border-dashed border-secondary/25 bg-white px-4 py-3 text-sm text-secondary">
                Please share dietary restrictions before booking so our kitchen
                team can prepare accordingly.
              </div>
            </div>

            <RetreatGalleryPanel
              images={RETREAT_FOOD_GALLERY}
              label="Sattvic cuisine"
              onOpenLightbox={(index) =>
                openLightbox(RETREAT_FOOD_GALLERY, index, "Sattvic cuisine")
              }
            />
          </div>
        )}
      </div>

      {lightbox && (
        <MediaLightbox
          isOpen={Boolean(lightbox)}
          onClose={() => setLightbox(null)}
          items={lightbox.items.map((item) => ({
            type: "image" as const,
            url: item.url,
          }))}
          activeIndex={lightbox.index}
          onChangeActiveIndex={(index) =>
            setLightbox((current) =>
              current ? { ...current, index } : current,
            )
          }
          title={lightbox.title}
        />
      )}
    </RetreatSectionShell>
  );
}
