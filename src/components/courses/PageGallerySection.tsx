"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Container, MediaLightbox, SectionHeader } from "@/components/ui";
import type { SitePageGalleryImage } from "@/content/types";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

const CATEGORY_LABELS: Record<string, string> = {
  yogahall: "Yoga Hall",
  dinning: "Dining",
  private: "Private Room",
  "2 shared": "2-Shared Room",
  "3 shared": "3-Shared Room",
  "4 shared": "4-Shared Dorm",
  premisis: "Premises",
  practice: "Music Training",
  accommodation: "Rooms & Stay",
  campus: "Ashram Life",
};

const CATEGORY_EYEBROWS: Record<string, string> = {
  yogahall: "Practice Space",
  dinning: "Sattvic Dining",
  private: "Accommodation",
  "2 shared": "Accommodation",
  "3 shared": "Accommodation",
  "4 shared": "Accommodation",
  premisis: "Campus",
  practice: "Training Sessions",
  accommodation: "Accommodation",
  campus: "Campus",
};

const SLOT_ASPECTS = [
  "aspect-[2/3]",
  "aspect-[16/10]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[16/9]",
  "aspect-[2/3]",
  "aspect-square",
  "aspect-[4/3]",
  "aspect-[3/4]",
  "aspect-[2/3]",
  "aspect-[16/10]",
] as const;

const SLOT_COUNT_BY_CATEGORY: Record<string, number> = {
  all: 15,
  yogahall: 6,
  dinning: 6,
  private: 6,
  "2 shared": 6,
  "3 shared": 5,
  "4 shared": 6,
  premisis: 4,
  practice: 9,
  accommodation: 8,
  campus: 6,
};

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: string;
};

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

function categoryEyebrow(category: string): string {
  return CATEGORY_EYEBROWS[category] ?? "Campus";
}

function imageTitle(image: SitePageGalleryImage, index: number): string {
  const base = categoryLabel(image.category);
  const match = image.url.match(/(\d+)(?=\.[^.]+$)/);
  const suffix = match?.[1] ? ` ${match[1]}` : ` ${index + 1}`;
  return `${base}${suffix}`;
}

function toGalleryItems(images: SitePageGalleryImage[]): GalleryItem[] {
  return images.map((image, index) => ({
    id: image.url,
    src: image.url,
    alt: `${categoryLabel(image.category)} at Nirvana Yoga School`,
    title: imageTitle(image, index),
    category: image.category,
  }));
}

/**
 * Filterable venue gallery styled like the homepage masonry gallery.
 *
 * @param props - Gallery content
 * @param props.images - Categorized venue images
 */
export default function PageGallerySection({
  images,
}: {
  images: SitePageGalleryImage[];
}) {
  const prefersReduced = useReducedMotion() ?? false;
  const galleryItems = useMemo(() => toGalleryItems(images), [images]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(galleryItems.map((item) => item.category)),
    );
    return [
      { id: "all", label: "All Images" },
      ...unique.map((category) => ({
        id: category,
        label: categoryLabel(category),
      })),
    ];
  }, [galleryItems]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleItems, setVisibleItems] = useState<GalleryItem[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const filteredItems = useMemo(() => {
    return galleryItems.filter(
      (item) =>
        selectedCategory === "all" || item.category === selectedCategory,
    );
  }, [galleryItems, selectedCategory]);

  const lightboxItems = useMemo(
    () =>
      visibleItems.map((item) => ({
        type: "image" as const,
        url: item.src,
      })),
    [visibleItems],
  );

  useEffect(() => {
    const slotsCount = Math.min(
      SLOT_COUNT_BY_CATEGORY[selectedCategory] ?? 12,
      filteredItems.length,
    );
    setVisibleItems(filteredItems.slice(0, slotsCount));
  }, [selectedCategory, filteredItems]);

  useEffect(() => {
    if (prefersReduced) return;

    if (filteredItems.length === 0 || visibleItems.length === 0) return;

    const interval = setInterval(() => {
      setVisibleItems((currentVisible) => {
        const currentPool = filteredItems.filter(
          (item) => !currentVisible.some((vis) => vis.id === item.id),
        );
        if (currentPool.length === 0) return currentVisible;

        const slotCount = Math.min(
          3,
          currentVisible.length,
          currentPool.length,
        );
        const slotIndices = new Set<number>();
        while (slotIndices.size < slotCount) {
          slotIndices.add(Math.floor(Math.random() * currentVisible.length));
        }

        const shuffledPool = [...currentPool].sort(() => Math.random() - 0.5);
        const nextVisible = [...currentVisible];
        let poolIdx = 0;
        for (const slotIndex of slotIndices) {
          nextVisible[slotIndex] = shuffledPool[poolIdx++];
        }
        return nextVisible;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [filteredItems, visibleItems.length, prefersReduced]);

  if (images.length === 0) return null;

  return (
    <section id="gallery" className="section-white">
      <Container size="2xl" className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Campus & Facilities"
              title={
                <>
                  Life at{" "}
                  <span className="font-semibold text-primary">Nirvana</span>
                </>
              }
              description="A detailed look at our yoga halls, dining room, private and shared rooms, dorms, balconies, and peaceful campus in Upper Tapovan, Rishikesh."
              align="left"
              descriptionClassName="text-ink"
              className="max-w-2xl"
            />
          </div>
        </motion.div>

        <motion.div
          className="sticky top-18 z-30 -mx-5 mb-10 border-b border-ink/8 bg-white/95 px-5 py-4 backdrop-blur-sm md:top-20 md:-mx-8 md:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          custom={0.06}
          variants={fadeUp}
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`type-ui relative px-4 py-2 font-semibold transition-colors duration-300 focus-visible:outline-none ${isActive ? "text-primary" : "text-ink"}`}
                >
                  {category.label}
                  {isActive && (
                    <motion.div
                      layoutId="venueGalleryCategoryUnderline"
                      className="absolute right-0 bottom-0 left-0 h-0.5 bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="columns-2 gap-5 sm:columns-4 lg:columns-5"
            >
              {visibleItems.map((item, index) => {
                const aspect = SLOT_ASPECTS[index % SLOT_ASPECTS.length];

                return (
                  <div
                    key={item.id}
                    className="group mb-6 block w-full break-inside-avoid rounded-3xl text-left"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveImageIndex(index);
                        setIsLightboxOpen(true);
                      }}
                      className={`relative block w-full ${aspect} cursor-zoom-in overflow-hidden rounded-3xl border border-ink/5 bg-ink/5 shadow-card transition-all duration-300 hover:border-primary/15 hover:shadow-soft`}
                    >
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                          className="absolute inset-0 h-full w-full"
                        >
                          <Image
                            src={item.src}
                            alt={item.alt}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            draggable={false}
                            className="pointer-events-none object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        </motion.div>
                      </AnimatePresence>
                    </button>

                    <div className="mt-3 px-2">
                      <span className="type-eyebrow block text-[9px] font-bold tracking-widest text-primary">
                        {categoryEyebrow(item.category)}
                      </span>
                      <h4 className="mt-1 text-sm leading-tight font-bold tracking-wide text-ink transition-colors duration-300 sm:text-base">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>

      <MediaLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        items={lightboxItems}
        activeIndex={activeImageIndex}
        onChangeActiveIndex={setActiveImageIndex}
        title="Course Venue Gallery"
      />
    </section>
  );
}
