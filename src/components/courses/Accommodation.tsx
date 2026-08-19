"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Container, MediaLightbox } from "@/components/ui";
import type {
  ResidentialLifeContent,
  SharedAccommodationGallery,
  SharedFacility,
  SharedGalleryImage,
} from "@/content/types/shared-sections";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { resolveSectionHtmlId } from "@/lib/html-id";
import {
  EASE_OUT,
  fadeUp,
  reducedTransition,
  VIEWPORT_ONCE,
} from "@/lib/motion";
import { ImageGalleryPanel } from "./AccommodationGalleryPanel";
import { facilityIcon } from "./facility-icons";
import {
  ResidentialSectionHeader,
  ResidentialSectionIntro,
} from "./ResidentialSectionHeader";

type LightboxState = {
  items: SharedGalleryImage[];
  index: number;
  title: string;
} | null;

/**
 * Vertical list of room types with thumbnail, name, and photo count.
 *
 * @param props - Galleries, active room id, and change handler
 */
function RoomTypeSelector({
  galleries,
  activeId,
  onChange,
  eyebrow = "Choose your room",
}: {
  galleries: SharedAccommodationGallery[];
  activeId: string;
  onChange: (id: string) => void;
  /** Label above the room list; active room eyebrow overrides when set. */
  eyebrow?: string;
}) {
  const activeRoom = galleries.find((room) => room.id === activeId);
  const label = activeRoom?.eyebrow?.trim() || eyebrow;

  return (
    <div className="space-y-2">
      <p className="type-eyebrow text-secondary">{label}</p>
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
              className={`group flex w-full items-center justify-between gap-4 rounded-2xl border px-3 py-2.5 text-left transition-all duration-300 ${
                isActive
                  ? "border-primary/25 bg-primary/5 shadow-xs ring-1 ring-primary/10"
                  : "surface-panel border-ink/8 hover:border-primary/15"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center"
                  aria-hidden="true"
                >
                  <span
                    className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                      isActive ? "bg-primary" : "bg-transparent"
                    }`}
                  />
                </span>

                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl shadow-xs">
                  {thumb && (
                    <Image
                      src={thumb}
                      alt={room.label}
                      fill
                      sizes="48px"
                      unoptimized
                      className={`object-cover transition-transform duration-500 ${
                        isActive ? "scale-105" : "group-hover:scale-105"
                      }`}
                    />
                  )}
                </div>

                <p
                  className={`type-ui min-w-0 truncate font-medium leading-snug ${
                    isActive ? "text-ink" : "text-ink/75"
                  }`}
                >
                  {room.label}
                </p>
              </div>

              <p className="type-eyebrow ml-auto shrink-0 text-muted">
                {room.images.length} photos
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Grid of included campus amenities with per-amenity icons and paid-extra notes.
 *
 * @param props - Facilities from the residential-life API
 */
function FacilitiesGrid({ facilities }: { facilities: SharedFacility[] }) {
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
          {facilities.length} amenities
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {facilities.map((facility) => {
          const Icon = facilityIcon(facility.iconKey);
          const isPaidExtra = Boolean(facility.note);

          return (
            <li
              key={facility.label}
              className="surface-panel flex items-start gap-2 rounded-xl p-2.5 transition-shadow hover:shadow-soft"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                  isPaidExtra
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

type AccommodationProps = {
  /** Server-provided residential-life content */
  content?: ResidentialLifeContent | null;
  /** Optional override for the section HTML id */
  htmlId?: string;
};

/**
 * Ashram lodging section — room-type selector with a synced photo gallery and
 * a campus facilities grid. Default anchor: `#accommodation`.
 *
 * @param props - Server-provided residential-life content
 */
export default function Accommodation({
  content = null,
  htmlId,
}: AccommodationProps = {}) {
  const prefersReduced = useReducedMotion() ?? false;
  const galleries = content?.accommodation.galleries ?? [];
  const [roomTab, setRoomTab] = useState("private");
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  useEffect(() => {
    if (galleries.length === 0) return;
    if (!galleries.some((gallery) => gallery.id === roomTab)) {
      setRoomTab(galleries[0].id);
    }
  }, [galleries, roomTab]);

  const isLive =
    shouldRenderSection(content, galleries.length > 0) &&
    shouldRenderSection(content?.accommodation, galleries.length > 0);

  if (!content || !isLive) return null;

  const activeRoom =
    galleries.find((gallery) => gallery.id === roomTab) ?? galleries[0];
  const sectionId =
    htmlId ?? resolveSectionHtmlId("accommodation", content.accommodation._id);

  return (
    <section
      id={sectionId}
      className="relative overflow-hidden bg-white py-8 sm:py-10"
    >
      <div
        className="absolute left-[-8%] top-[40%] w-[240px] h-[240px] rounded-full bg-primary/5 blur-[80px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Hidden preloader for room tab cover photos */}
      <div className="hidden" aria-hidden="true">
        {galleries.map((room) =>
          room.images[0]?.url ? (
            /* biome-ignore lint/performance/noImgElement: preloader */
            <img key={`preload-${room.id}`} src={room.images[0].url} alt="" />
          ) : null,
        )}
      </div>

      <Container size="2xl" className="relative w-full">
        <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-5">
            <ResidentialSectionHeader
              eyebrow={content.accommodation.eyebrow?.trim() || "Residential Life"}
              title={
                content.accommodation.title?.trim() ? (
                  content.accommodation.title
                ) : (
                  <>
                    Ashram <span className="text-primary">Accommodation</span>
                  </>
                )
              }
            />

            <div className="space-y-5">
              <ResidentialSectionIntro
                eyebrow="Ashram Lodging"
                title={
                  content.accommodation.stay.title.trim() ? (
                    content.accommodation.stay.title
                  ) : (
                    <>
                      Comfortable stay in the{" "}
                      <span className="text-primary">heart of Rishikesh</span>
                    </>
                  )
                }
                description={content.accommodation.stay.description}
              />

              <RoomTypeSelector
                galleries={galleries}
                activeId={roomTab}
                onChange={setRoomTab}
              />
            </div>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={`gallery-${roomTab}`}
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
                  key={roomTab}
                  images={[...activeRoom.images]}
                  label={activeRoom.label}
                  accent="primary"
                  onOpenLightbox={(index) =>
                    setLightbox({
                      items: [...activeRoom.images],
                      index,
                      title: activeRoom.label,
                    })
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="mt-6 lg:mt-8"
        >
          <FacilitiesGrid facilities={content.facilities} />
        </motion.div>
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
        title={lightbox?.title ?? "Accommodation gallery"}
      />
    </section>
  );
}
