"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Container, MediaLightbox } from "@/components/ui";
import {
  galleryCategoryLabel,
  resolveGallerySections,
} from "@/content/mappers/gallery-module";
import type { GalleryModule } from "@/content/types/page-modules";
import type { SitePageGalleryImage } from "@/content/types/site-page";
import { shouldRenderSection } from "@/lib/cms/section-visibility";

type VenueGalleryProps = {
  /** Gallery module from page_modules (copy and sections) */
  gallery?: GalleryModule | null;
  /** Images from database (`page_gallery_images` / modules) */
  images: SitePageGalleryImage[];
  /** Page title for lightbox */
  lightboxTitle?: string;
  /** Retreat venue uses photographic cards; course venue stays letterboxed */
  variant?: "default" | "retreat";
};

type DisplayItem = SitePageGalleryImage & { key: string; flatIndex: number };

type VenuePhotoCardProps = {
  item: DisplayItem;
  alt: string;
  onOpen: (item: DisplayItem) => void;
  variant: "default" | "retreat";
};

/**
 * Venue photo tile. Course venue keeps the full image visible; retreat venue
 * uses a photographic crop to match the live retreat gallery.
 *
 * @param props.item - Gallery image to open in the lightbox
 * @param props.alt - Accessible image label
 * @param props.onOpen - Opens the lightbox on this item
 * @param props.variant - Course vs retreat card treatment
 */
function VenuePhotoCard({ item, alt, onOpen, variant }: VenuePhotoCardProps) {
  const isRetreat = variant === "retreat";

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={
        isRetreat
          ? "group relative block aspect-4/3 w-full overflow-hidden rounded-xl bg-surface-muted ring-1 ring-ink/8"
          : "group relative block aspect-4/3 w-full overflow-hidden bg-white"
      }
    >
      <Image
        src={item.url}
        alt={alt}
        fill
        unoptimized
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={
          isRetreat
            ? "object-cover transition-transform duration-500 group-hover:scale-105"
            : "object-contain"
        }
        style={isRetreat ? undefined : { objectFit: "contain" }}
      />
      <span
        className={
          isRetreat
            ? "pointer-events-none absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/15"
            : "pointer-events-none absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/25"
        }
      />
    </button>
  );
}

/**
 * Classic photo gallery for course/retreat venue pages.
 *
 * @param props - Gallery module metadata and DB images
 */
export default function VenueGallery({
  gallery = null,
  images,
  lightboxTitle = "Venue gallery",
  variant = "default",
}: VenueGalleryProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const sections = useMemo(
    () =>
      resolveGallerySections({
        images,
        sectionOrder: gallery?.sectionOrder,
      }),
    [gallery?.sectionOrder, images],
  );

  const [activeSection, setActiveSection] = useState("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allItems: DisplayItem[] = useMemo(
    () =>
      images.map((image, index) => ({
        ...image,
        key: `${image.category}-${image.url}-${index}`,
        flatIndex: index,
      })),
    [images],
  );

  const visibleItems = useMemo(() => {
    if (activeSection === "all") return allItems;
    return allItems.filter((item) => item.category === activeSection);
  }, [activeSection, allItems]);

  const lightboxItems = useMemo(
    () =>
      visibleItems.map((item) => ({
        type: "image" as const,
        url: item.url,
      })),
    [visibleItems],
  );

  const showGalleryMedia = shouldRenderSection(
    gallery ?? { live: true },
    images.length > 0,
  );

  if (!showGalleryMedia) {
    return null;
  }

  const filters = [
    { id: "all", label: "All photos", count: images.length },
    ...sections.map((section) => ({
      id: section.id,
      label: section.label || galleryCategoryLabel(section.id),
      count: section.images.length,
    })),
  ];

  /**
   * Opens the lightbox on the clicked photo within the current filter.
   *
   * @param item - Display item that was clicked
   */
  function openLightbox(item: DisplayItem) {
    const index = visibleItems.findIndex((entry) => entry.key === item.key);
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
  }

  return (
    <section
      id="gallery"
      className={
        variant === "retreat"
          ? "bg-white pb-16 pt-6 sm:pb-24 sm:pt-8"
          : "bg-white pb-16 pt-2 mt-4 sm:pb-20"
      }
    >
      <Container size="2xl">
        {showGalleryMedia && images.length > 0 ? (
          <>
            {sections.length > 1 ? (
              <div className="sticky top-17 z-30 -mx-5 mb-8 border-b border-ink/10 bg-white px-5 py-3 md:top-20 md:-mx-8 md:mb-10 md:px-8">
                <div
                  className="flex flex-wrap gap-2"
                  role="tablist"
                  aria-label="Gallery categories"
                >
                  {filters.map((filter) => {
                    const active = activeSection === filter.id;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveSection(filter.id)}
                        className={`rounded-sm px-3 py-1.5 text-sm tracking-wide transition-colors sm:px-4 sm:py-2 ${active ? "bg-primary text-white" : "bg-ink/5 text-ink hover:bg-ink/10"}`}
                      >
                        {filter.label}
                        <span
                          className={`ml-1.5 text-xs ${active ? "text-white/80" : "text-ink"}`}
                        >
                          {filter.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReduced ? 0 : 0.25 }}
              >
                {activeSection === "all" ? (
                  <div className="flex flex-col gap-12 sm:gap-14">
                    {sections.map((section) => {
                      const sectionItems = allItems.filter(
                        (item) => item.category === section.id,
                      );
                      if (sectionItems.length === 0) return null;
                      return (
                        <div key={section.id} id={`gallery-${section.id}`}>
                          <header className="mb-5 border-b border-ink/10 pb-3">
                            <h2 className="type-h3 text-ink">
                              {section.label ||
                                galleryCategoryLabel(section.id)}
                            </h2>
                            {section.description ? (
                              <p className="mt-1 max-w-2xl text-sm text-ink/70">
                                {section.description}
                              </p>
                            ) : null}
                          </header>
                          <ul
                            className={
                              variant === "retreat"
                                ? "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4"
                                : "grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4"
                            }
                          >
                            {sectionItems.map((item, index) => (
                              <li key={item.key}>
                                <VenuePhotoCard
                                  item={item}
                                  alt={
                                    item.alt ??
                                    `${section.label || galleryCategoryLabel(section.id)} ${index + 1}`
                                  }
                                  onOpen={openLightbox}
                                  variant={variant}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <ul
                    className={
                      variant === "retreat"
                        ? "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4"
                        : "grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4"
                    }
                  >
                    {visibleItems.map((item, index) => (
                      <li key={item.key}>
                        <VenuePhotoCard
                          item={item}
                          alt={
                            item.alt ??
                            `${galleryCategoryLabel(item.category)} ${index + 1}`
                          }
                          onOpen={openLightbox}
                          variant={variant}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        ) : null}
      </Container>

      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={lightboxItems}
        activeIndex={lightboxIndex}
        onChangeActiveIndex={setLightboxIndex}
        title={lightboxTitle}
      />
    </section>
  );
}
