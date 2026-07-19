"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Container, MediaLightbox } from "@/components/ui";
import {
  extractYouTubeId,
  galleryCategoryLabel,
  normalizeGalleryVideos,
  resolveGallerySections,
} from "@/content/mappers/gallery-module";
import type { GalleryModule } from "@/content/types/page-modules";
import type { SitePageGalleryImage } from "@/content/types/site-page";
import { Play } from "@/icons";
import { shouldRenderSection } from "@/lib/cms/section-visibility";

type VenueGalleryProps = {
  /** Gallery module from page_modules (copy, sections, videos) */
  gallery?: GalleryModule | null;
  /** Images from database (`page_gallery_images` / modules) */
  images: SitePageGalleryImage[];
  /** Page title for lightbox */
  lightboxTitle?: string;
};

type DisplayItem = SitePageGalleryImage & { key: string; flatIndex: number };

/**
 * Classic photo gallery for course/retreat venue pages.
 * Category filters + uniform square grid + lightbox — images from the database.
 *
 * @param props - Gallery module metadata and DB image list
 */
export default function VenueGallery({
  gallery = null,
  images,
  lightboxTitle = "Venue gallery",
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
  const videos = useMemo(
    () => normalizeGalleryVideos(gallery?.videos),
    [gallery?.videos],
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

  const isLive = shouldRenderSection(
    gallery ?? { live: true },
    images.length > 0 || videos.length > 0,
  );

  if (!isLive || (images.length === 0 && videos.length === 0)) {
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
    <section id="gallery" className="bg-paper pb-16 pt-2 sm:pb-20">
      <Container size="2xl">
        {sections.length > 1 ? (
          <div className="sticky top-16 z-30 -mx-5 mb-8 border-b border-ink/10 bg-paper px-5 py-3 md:top-18 md:-mx-8 md:mb-10 md:px-8">
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
                    className={`rounded-sm px-3 py-1.5 font-sans text-sm tracking-wide transition-colors sm:px-4 sm:py-2 ${
                      active
                        ? "bg-primary text-white"
                        : "bg-ink/5 text-ink hover:bg-ink/10"
                    }`}
                  >
                    {filter.label}
                    <span
                      className={`ml-1.5 text-xs ${active ? "text-white/80" : "text-muted"}`}
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
                        <h2 className="font-serif text-2xl text-ink sm:text-3xl">
                          {section.label || galleryCategoryLabel(section.id)}
                        </h2>
                        {section.description ? (
                          <p className="mt-1 max-w-2xl text-sm text-muted">
                            {section.description}
                          </p>
                        ) : null}
                      </header>
                      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                        {sectionItems.map((item, index) => (
                          <li key={item.key}>
                            <button
                              type="button"
                              onClick={() => openLightbox(item)}
                              className="group relative block aspect-square w-full overflow-hidden bg-ink/5"
                            >
                              <Image
                                src={item.url}
                                alt={
                                  item.alt ??
                                  `${section.label || galleryCategoryLabel(section.id)} ${index + 1}`
                                }
                                fill
                                unoptimized
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/25" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                {visibleItems.map((item, index) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => openLightbox(item)}
                      className="group relative block aspect-square w-full overflow-hidden bg-ink/5"
                    >
                      <Image
                        src={item.url}
                        alt={
                          item.alt ??
                          `${galleryCategoryLabel(item.category)} ${index + 1}`
                        }
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/25" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>

        {videos.length > 0 ? (
          <div id="videos" className="mt-16 border-t border-ink/10 pt-12">
            <h2 className="mb-6 font-serif text-2xl text-ink sm:text-3xl">
              Videos
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => {
                const id = extractYouTubeId(video.url);
                return (
                  <li key={id}>
                    <a
                      href={`https://www.youtube.com/watch?v=${id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block aspect-video overflow-hidden bg-ink"
                    >
                      <Image
                        src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                        alt={video.title ?? "Venue video"}
                        fill
                        unoptimized
                        className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-soft">
                          <Play size={22} />
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
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
