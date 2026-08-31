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
import { EASE_OUT, reducedTransition } from "@/lib/motion";
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
              className={`group flex w-full items-center justify-between gap-4 rounded-2xl border px-3 py-2.5 text-left transition-all duration-300 ${isActive ? "border-primary/25 bg-primary/5 shadow-xs ring-1 ring-primary/10" : "surface-panel border-ink/8 hover:border-primary/15"}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center"
                  aria-hidden="true"
                >
                  <span
                    className={`h-2 w-2 rounded-full transition-colors duration-300 ${isActive ? "bg-primary" : "bg-transparent"}`}
                  />
                </span>

                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl shadow-xs">
                  {thumb && (
                    <Image
                      src={thumb}
                      alt={room.label}
                      fill
                      sizes="50px"
                      unoptimized
                      className={`object-cover transition-transform duration-500 ${isActive ? "scale-105" : "group-hover:scale-105"}`}
                    />
                  )}
                </div>

                <p
                  className={`type-ui min-w-0 truncate font-semibold ${isActive ? "text-ink" : "text-ink"}`}
                >
                  {room.label}
                </p>
              </div>

              <p className="type-eyebrow ml-auto shrink-0 text-ink">
                {room.images.length} photos
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Shared responsive column classes for amenity lists. */
const AMENITY_GRID_COLS =
  "grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3";

/**
 * Polished amenity row — soft icon well + label, optional on-request note.
 *
 * @param props - Facility data from the residential-life API
 */
function AmenityItem({ facility }: { facility: SharedFacility }) {
  const Icon = facilityIcon(facility.iconKey);
  const isAddon = Boolean(facility.note);

  return (
    <li className="flex list-none items-start gap-3">
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isAddon
            ? "bg-secondary/10 text-secondary"
            : "bg-primary/8 text-primary"
        }`}
        aria-hidden
      >
        <Icon size={16} strokeWidth={1.85} />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="type-ui font-medium leading-snug text-ink">
          {facility.label}
        </p>
        {facility.note ? (
          <p className="mt-0.5 text-sm leading-relaxed text-ink/55">
            {facility.note}
          </p>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Labelled amenity group (included stay items or on-request extras).
 *
 * @param props - Group label and amenity items
 */
function AmenityGroup({
  label,
  facilities,
}: {
  label: string;
  facilities: SharedFacility[];
}) {
  if (facilities.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="type-eyebrow tracking-wide text-ink/50">{label}</p>
      <ul className={AMENITY_GRID_COLS}>
        {facilities.map((facility) => (
          <AmenityItem key={facility.label} facility={facility} />
        ))}
      </ul>
    </div>
  );
}

/**
 * Campus amenities — included items plus on-request extras from CMS.
 *
 * @param props - Facilities from the residential-life API
 */
function AmenitiesSection({ facilities }: { facilities: SharedFacility[] }) {
  if (facilities.length === 0) return null;

  const included = facilities.filter((facility) => !facility.note);
  const addOns = facilities.filter((facility) => Boolean(facility.note));
  const hasBothGroups = included.length > 0 && addOns.length > 0;

  return (
    <div className="space-y-7 border-t border-ink/5 pt-8 sm:space-y-8 sm:pt-10 lg:pt-12">
      <ResidentialSectionIntro
        eyebrow="Campus amenities"
        title="Everything for a comfortable ashram stay"
        description="Core amenities are included with your stay — extras like heaters or laundry are available on request."
      />

      <div className="space-y-7 sm:space-y-8">
        <AmenityGroup
          label={hasBothGroups ? "Included with your stay" : "Campus amenities"}
          facilities={included}
        />
        {hasBothGroups ? (
          <div className="border-t border-ink/6" aria-hidden="true" />
        ) : null}
        <AmenityGroup label="Available on request" facilities={addOns} />
      </div>
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
 * campus amenities. Default anchor: `#accommodation`.
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
          <div className="min-w-0 space-y-5 lg:col-span-5">
            <ResidentialSectionHeader
              eyebrow={
                content.accommodation.eyebrow?.trim() || "Residential Life"
              }
              title={
                content.accommodation.title?.trim() ? (
                  <span className="whitespace-nowrap">
                    {content.accommodation.title}
                  </span>
                ) : (
                  <span className="whitespace-nowrap">
                    Ashram <span className="text-primary">Accommodation</span>
                  </span>
                )
              }
            />

            <ResidentialSectionIntro
              eyebrow="Residential Life"
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

        {/* Temporarily hidden — Campus amenities */}
        {/* <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="mt-8 sm:mt-10 lg:mt-12"
        >
          <AmenitiesSection facilities={content.facilities} />
        </motion.div> */}
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
