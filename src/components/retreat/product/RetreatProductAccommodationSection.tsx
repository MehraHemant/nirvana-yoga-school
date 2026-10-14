"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ImageGalleryPanel } from "@/components/courses/AccommodationGalleryPanel";
import { facilityIcon } from "@/components/courses/facility-icons";
import {
  ResidentialSectionIntro,
} from "@/components/courses/ResidentialSectionHeader";
import RetreatSectionShell from "@/components/retreat/RetreatSectionShell";
import { MediaLightbox } from "@/components/ui";
import type {
  SharedFacility,
  SharedGalleryImage,
} from "@/content/types/shared-sections";
import { Check } from "@/icons";
import { EASE_OUT, reducedTransition } from "@/lib/motion";
import type { RetreatProductAccommodationContent } from "./retreatProductTypes";

type LightboxState = {
  items: SharedGalleryImage[];
  index: number;
  title: string;
} | null;

/**
 * Vertical room list with thumbnail, active dot, and photo count (course pattern).
 *
 * @param props - Galleries, active room id, and selection handler
 */
function RoomTypeSelector({
  galleries,
  activeId,
  onChange,
  eyebrow = "Choose your room",
}: {
  galleries: RetreatProductAccommodationContent["galleries"];
  activeId: string;
  onChange: (id: string) => void;
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
          const roomImages = room.images.filter((image) => image.url?.trim());
          const thumb = roomImages[0]?.url;
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => onChange(room.id)}
              aria-pressed={isActive}
              className={`group flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                isActive
                  ? "border-primary/30 bg-primary/5 shadow-xs ring-1 ring-primary/15"
                  : "surface-panel border-ink/8 hover:border-primary/20 hover:bg-primary/[0.03] hover:shadow-xs"
              }`}
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

                <div
                  className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-xl shadow-xs ring-2 ring-transparent transition-[ring-color,transform] duration-300 ${isActive ? "ring-primary/25" : "group-hover:ring-primary/10"}`}
                >
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={room.label}
                      fill
                      sizes="50px"
                      unoptimized
                      className={`object-cover transition-transform duration-500 ${isActive ? "scale-105" : "group-hover:scale-105"}`}
                    />
                  ) : null}
                </div>

                <p
                  className={`type-ui min-w-0 truncate font-semibold transition-colors ${isActive ? "text-ink" : "text-ink/85 group-hover:text-ink"}`}
                >
                  {room.label}
                </p>
              </div>

              <p
                className={`type-eyebrow ml-auto shrink-0 tabular-nums ${isActive ? "text-primary" : "text-ink/45 group-hover:text-ink/60"}`}
              >
                {roomImages.length} photos
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Shared responsive column classes for campus amenity lists. */
const AMENITY_GRID_COLS =
  "grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3";

/**
 * Labelled amenity group for the wide campus amenities grid.
 *
 * @param props - Group label and facility rows
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
          <FacilityItem key={facility.label} facility={facility} />
        ))}
      </ul>
    </div>
  );
}

/**
 * Full-width campus amenities band — grouped amenity grid.
 *
 * @param facilities - CMS facility rows
 */
function CampusFacilitiesBand({ facilities }: { facilities: SharedFacility[] }) {
  const included = facilities.filter((facility) => !facility.note);
  const addOns = facilities.filter((facility) => Boolean(facility.note));
  const hasBothGroups = included.length > 0 && addOns.length > 0;

  return (
    <div className="mt-8 border-t border-ink/8 pt-8 sm:mt-10 sm:pt-10">
      <div className="min-w-0 space-y-6">
        <ResidentialSectionIntro
          eyebrow="Campus amenities"
          title="Everything for a comfortable ashram stay"
          description="Core amenities are included with your stay — extras like heaters or laundry are available on request."
        />
        <div className="space-y-7 sm:space-y-8">
          <AmenityGroup
            label={
              hasBothGroups ? "Included with your stay" : "Campus amenities"
            }
            facilities={included}
          />
          {hasBothGroups ? (
            <div className="border-t border-ink/6" aria-hidden="true" />
          ) : null}
          <AmenityGroup label="Available on request" facilities={addOns} />
        </div>
      </div>
    </div>
  );
}

/**
 * Amenity row with icon and optional add-on note.
 *
 * @param facility - CMS facility row
 */
function FacilityItem({ facility }: { facility: SharedFacility }) {
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
 * Room feature bullets when CMS provides per-room copy.
 *
 * @param items - Feature labels
 */
function RoomFeaturesList({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="surface-panel flex gap-2.5 rounded-xl border border-transparent p-2.5 transition hover:border-primary/10"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/10 text-primary">
            <Check size={11} className="stroke-[2.5]" />
          </span>
          <span className="type-body pt-0.5 text-ink">{item}</span>
        </li>
      ))}
    </ul>
  );
}

type RetreatProductAccommodationSectionProps = {
  content: RetreatProductAccommodationContent;
};

/**
 * Accommodation in the product main column — gallery sticky right, amenities full-width row.
 *
 * @param content - Mapped stay copy and room galleries
 */
export default function RetreatProductAccommodationSection({
  content,
}: RetreatProductAccommodationSectionProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const galleries = content.galleries;
  const [roomTab, setRoomTab] = useState(() => galleries[0]?.id ?? "");
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  useEffect(() => {
    if (galleries.length === 0) return;
    if (!galleries.some((gallery) => gallery.id === roomTab)) {
      setRoomTab(galleries[0].id);
    }
  }, [galleries, roomTab]);

  const activeRoom =
    galleries.find((gallery) => gallery.id === roomTab) ?? galleries[0];
  const activeImages = (activeRoom?.images ?? []).filter((image) =>
    image.url?.trim(),
  );
  const activeFeatures = (activeRoom?.features ?? []).filter((item) =>
    item.trim(),
  );
  const activeRoomDescription = activeRoom?.description?.trim() ?? "";
  const stayTitle = content.stayTitle.trim();
  const stayDescription = content.stayDescription.trim();
  const showStayIntro = Boolean(stayTitle || stayDescription);
  const facilities = content.facilities.filter((f) => f.label?.trim());
  const showFacilities =
    activeFeatures.length === 0 && facilities.length > 0;
  const showRoomDescription =
    Boolean(activeRoomDescription) &&
    activeRoomDescription !== stayDescription;

  const introTitle = stayTitle ? (
    stayTitle
  ) : (
    <>
      Comfortable stay in the{" "}
      <span className="text-primary">heart of Rishikesh</span>
    </>
  );

  return (
    <RetreatSectionShell
      id="accommodation"
      eyebrow={content.eyebrow.trim() || undefined}
      title={content.title}
    >
      <div className="hidden" aria-hidden="true">
        {galleries.map((room) => {
          const thumb = room.images.find((image) => image.url?.trim())?.url;
          return thumb ? (
            /* biome-ignore lint/performance/noImgElement: preloader */
            <img key={`preload-${room.id}`} src={thumb} alt="" />
          ) : null;
        })}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
        <div className="min-w-0 space-y-4 sm:space-y-5 lg:col-span-5">
          {showStayIntro ? (
            <ResidentialSectionIntro
              eyebrow={content.eyebrow.trim() || "Residential Life"}
              title={introTitle}
              description={stayDescription}
            />
          ) : null}

          {galleries.length > 0 ? (
            <RoomTypeSelector
              galleries={galleries}
              activeId={roomTab}
              onChange={setRoomTab}
            />
          ) : null}

          {showRoomDescription ? (
            <p className="type-body text-sm leading-relaxed text-ink/80 sm:text-base">
              {activeRoomDescription}
            </p>
          ) : null}

          {activeFeatures.length > 0 ? (
            <RoomFeaturesList items={activeFeatures} />
          ) : null}
        </div>

        <div className="retreat-product-media min-w-0 lg:col-span-7">
          {activeImages.length > 0 ? (
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
                className="lg:sticky lg:top-[var(--retreat-sticky-top,7rem)]"
              >
                <ImageGalleryPanel
                  key={roomTab}
                  images={activeImages}
                  label={activeRoom?.label ?? "Accommodation"}
                  accent="primary"
                  onOpenLightbox={(index) =>
                    setLightbox({
                      items: activeImages,
                      index,
                      title: activeRoom?.label ?? "Accommodation",
                    })
                  }
                />
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      </div>

      {showFacilities ? (
        <CampusFacilitiesBand facilities={facilities} />
      ) : null}

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
    </RetreatSectionShell>
  );
}
