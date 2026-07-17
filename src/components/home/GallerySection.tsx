"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Container, MediaLightbox, SectionHeader } from "@/components/ui";
import { DEFAULT_HOME_PAGE_CONTENT } from "@/content/data/dedicated-page-defaults";
import type {
  HomeGalleryItem,
  HomeGallerySectionContent,
} from "@/content/types/dedicated-pages";
import { resolveSectionHtmlId } from "@/lib/html-id";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type GalleryItem = HomeGalleryItem & { id: number };

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

type GallerySectionProps = {
  /** Full CMS gallery section */
  content?: HomeGallerySectionContent;
};

/**
 * Homepage campus gallery with category filters driven by CMS content.
 *
 * @param props - Optional CMS gallery section
 */
export default function GallerySection({
  content = DEFAULT_HOME_PAGE_CONTENT.gallery,
}: GallerySectionProps) {
  const sourceItems =
    content.items?.length > 0
      ? content.items
      : DEFAULT_HOME_PAGE_CONTENT.gallery.items;

  const categories =
    content.categories?.length
      ? content.categories
      : (DEFAULT_HOME_PAGE_CONTENT.gallery.categories ?? []);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const prefersReduced = useReducedMotion() ?? false;

  const items: GalleryItem[] = useMemo(
    () => sourceItems.map((item, index) => ({ ...item, id: index + 1 })),
    [sourceItems],
  );

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        selectedCategory === "all" || item.category === selectedCategory,
    );
  }, [items, selectedCategory]);

  const [visibleItems, setVisibleItems] = useState<GalleryItem[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const lightboxItems = useMemo(() => {
    return visibleItems.map((item) => ({
      type: "image" as const,
      url: item.src,
    }));
  }, [visibleItems]);

  useEffect(() => {
    let slotsCount = 15;
    if (selectedCategory === "practice") {
      slotsCount = 12;
    } else if (selectedCategory === "life") {
      slotsCount = 7;
    } else if (selectedCategory === "campus") {
      slotsCount = 7;
    }
    slotsCount = Math.min(slotsCount, filteredItems.length);
    setVisibleItems(filteredItems.slice(0, slotsCount));
  }, [selectedCategory, filteredItems]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: visibleItems is evaluated dynamically in the functional state updater to avoid resetting the interval
  useEffect(() => {
    if (prefersReduced) return;

    const pool = filteredItems.filter(
      (item) => !visibleItems.some((vis) => vis.id === item.id),
    );

    if (pool.length === 0 || visibleItems.length === 0) return;

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

  return (
    <section
      id={resolveSectionHtmlId("gallery", content._id)}
      className="relative w-full bg-paper py-12 sm:py-14 lg:py-16"
    >
      <Container size="2xl" className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10 md:mb-14">
            <SectionHeader
              eyebrow={content.eyebrow}
              title={content.title}
              description={content.description}
              align="left"
              className="max-w-2xl mb-0!"
            />
          </div>
        </motion.div>

        <motion.div
          className="sticky top-18 md:top-20 z-30 bg-sand/90 backdrop-blur-md py-4 mb-10 -mx-5 px-5 md:-mx-8 md:px-8 border-b border-ink/8"
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
                  className={`type-ui relative px-4 py-2 font-medium transition-colors duration-300 focus-visible:outline-none ${
                    isActive ? "text-primary" : "text-muted hover:text-ink"
                  }`}
                >
                  {category.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
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
              className="columns-2 sm:columns-4 lg:columns-5 gap-5"
            >
              {visibleItems.map((item, index) => {
                const aspect = SLOT_ASPECTS[index % SLOT_ASPECTS.length];

                return (
                  <div
                    key={item.id}
                    className="w-full text-left break-inside-avoid mb-6 group block rounded-3xl"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveImageIndex(index);
                        setIsLightboxOpen(true);
                      }}
                      className={`relative w-full ${aspect} overflow-hidden rounded-3xl bg-ink/5 border border-ink/5 group-hover:border-primary/15 shadow-card hover:shadow-soft transition-all duration-300 cursor-zoom-in block`}
                    >
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                          className="absolute inset-0 w-full h-full"
                        >
                          <Image
                            src={item.src}
                            alt={item.alt}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            draggable={false}
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                          />
                        </motion.div>
                      </AnimatePresence>
                    </button>

                    <div className="mt-3 px-2">
                      <span className="type-eyebrow text-[9px] text-primary tracking-widest block font-bold">
                        {item.category === "practice"
                          ? "Yoga Practice"
                          : item.category === "campus"
                            ? "Campus Life"
                            : "Excursion"}
                      </span>
                      <h4 className="font-serif text-sm sm:text-base font-medium text-ink leading-tight tracking-wide mt-1 transition-colors duration-300">
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
        title={content.lightboxTitle ?? "Life at Nirvana"}
      />
    </section>
  );
}
