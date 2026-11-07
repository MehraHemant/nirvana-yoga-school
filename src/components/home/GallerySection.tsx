"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  MediaLightbox,
  PrefetchWhenNear,
  SectionHeader,
} from "@/components/ui";
import Image from "@/components/ui/CdnImage";
import type {
  HomeGalleryItem,
  HomeGallerySectionContent,
} from "@/content/types/dedicated-pages";
import { cloudinaryCoverLoader } from "@/lib/cdn/cloudinary-thumb-url";
import { preloadResponsiveImage } from "@/lib/cdn/prefetch-image";
import {
  MASONRY_TILE_SIZES,
  PHOTO_IMAGE_QUALITY,
} from "@/lib/cdn/responsive-image";
import { createEmptyHomePageContent } from "@/lib/cms/structural-defaults";
import { resolveSectionHtmlId } from "@/lib/html-id";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type GalleryItem = HomeGalleryItem & { id: number };

const SLOT_ASPECTS = [
  { className: "aspect-[2/3]", w: 2, h: 3 },
  { className: "aspect-[16/10]", w: 16, h: 10 },
  { className: "aspect-square", w: 1, h: 1 },
  { className: "aspect-[3/4]", w: 3, h: 4 },
  { className: "aspect-[4/5]", w: 4, h: 5 },
  { className: "aspect-[16/9]", w: 16, h: 9 },
  { className: "aspect-[2/3]", w: 2, h: 3 },
  { className: "aspect-square", w: 1, h: 1 },
  { className: "aspect-[4/3]", w: 4, h: 3 },
  { className: "aspect-[3/4]", w: 3, h: 4 },
  { className: "aspect-[2/3]", w: 2, h: 3 },
  { className: "aspect-[16/10]", w: 16, h: 10 },
] as const;

/** Photos shown for every filter. Extra photos rotate into these slots. */
const GALLERY_VISIBLE_COUNT = 20;
/** How often a few tiles swap for photos that are already loaded. */
const ROTATE_INTERVAL_MS = 2000;
/** Tiles replaced on each rotation. */
const ROTATE_SLOT_COUNT = 3;

/** Fallback eyebrows used when the CMS sends no gallery category list. */
const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  practice: "Yoga Practice",
  campus: "Campus Life",
  life: "Excursion",
};

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
  content = createEmptyHomePageContent().gallery,
}: GallerySectionProps) {
  const sourceItems =
    content.items?.length > 0
      ? content.items
      : createEmptyHomePageContent().gallery.items;

  const categories = content.categories?.length
    ? content.categories
    : (createEmptyHomePageContent().gallery.categories ?? []);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const prefersReduced = useReducedMotion() ?? false;

  /** CMS category id → label, falling back to the built-in eyebrows. */
  const categoryLabels = new Map(categories.map((c) => [c.id, c.label]));
  const labelForCategory = (id: string) =>
    categoryLabels.get(id) ?? DEFAULT_CATEGORY_LABELS[id] ?? id;

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
  const visibleRef = useRef(visibleItems);
  visibleRef.current = visibleItems;
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const lightboxItems = useMemo(() => {
    return visibleItems.map((item) => ({
      type: "image" as const,
      url: item.src,
    }));
  }, [visibleItems]);

  useEffect(() => {
    const slotsCount = Math.min(GALLERY_VISIBLE_COUNT, filteredItems.length);
    const initial = filteredItems.slice(0, slotsCount);
    visibleRef.current = initial;
    setVisibleItems(initial);

    if (prefersReduced) return;
    let cancelled = false;
    let timer = 0;

    const arm = () => {
      const plan = planRotation(visibleRef.current, filteredItems);
      if (!plan || cancelled) return;
      const ready = Promise.all(
        plan.incoming.map((tile) =>
          preloadTile(tile.src, tile.slotIndex, "high"),
        ),
      );
      timer = window.setTimeout(() => {
        void ready.then(() => {
          if (cancelled) return;
          visibleRef.current = plan.items;
          setVisibleItems(plan.items);
          arm();
        });
      }, ROTATE_INTERVAL_MS);
    };

    arm();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [filteredItems, prefersReduced]);

  useEffect(() => {
    let cancelled = false;
    const queue = tilesForGroups(items, categories);
    let cursor = 0;

    const worker = async () => {
      while (!cancelled && cursor < queue.length) {
        const tile = queue[cursor];
        cursor += 1;
        await preloadTile(tile.src, tile.slotIndex);
      }
    };

    const start = () => {
      void Promise.all([worker(), worker()]);
    };
    const idleId = window.setTimeout(start, 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(idleId);
    };
  }, [items, categories]);

  return (
    <section
      id={resolveSectionHtmlId("gallery", content._id)}
      className="section-white"
    >
      <Container size="2xl" className="relative">
        <PrefetchWhenNear
          limit={12}
          images={visibleItems.map((item, index) => {
            const aspect = SLOT_ASPECTS[index % SLOT_ASPECTS.length];
            return {
              src: item.src,
              sizes: MASONRY_TILE_SIZES,
              quality: PHOTO_IMAGE_QUALITY,
              loader: cloudinaryCoverLoader(aspect.w, aspect.h),
            };
          })}
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-6 md:mb-8">
            <SectionHeader
              eyebrow={content.eyebrow}
              title={content.title}
              description={content.description}
              align="left"
              descriptionClassName="text-ink"
              className="w-full"
            />
          </div>
        </motion.div>

        <motion.div
          className="sticky top-18 md:top-20 z-30 bg-white/95 backdrop-blur-sm py-4 mb-10 -mx-5 px-5 md:-mx-8 md:px-8 border-b border-ink/8"
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
                  onPointerEnter={() => warmCategory(items, category.id)}
                  onFocus={() => warmCategory(items, category.id)}
                  className={`type-ui text-lg relative px-4 py-2 transition-colors duration-300 focus-visible:outline-none ${isActive ? "text-primary" : "text-ink"}`}
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
          <div
            key={selectedCategory}
            className="columns-2 sm:columns-4 lg:columns-5 gap-5"
          >
            {visibleItems.map((item, index) => {
              const aspect = SLOT_ASPECTS[index % SLOT_ASPECTS.length];
              const coverLoader = cloudinaryCoverLoader(aspect.w, aspect.h);

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
                    className={`relative w-full ${aspect.className} overflow-hidden rounded-3xl bg-ink/5 border border-ink/5 group-hover:border-primary/15 shadow-card hover:shadow-soft transition-all duration-300 cursor-zoom-in block`}
                  >
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full"
                      >
                        <Image
                          src={item.src}
                          alt={item.alt}
                          fill
                          sizes={MASONRY_TILE_SIZES}
                          quality={PHOTO_IMAGE_QUALITY}
                          loader={coverLoader}
                          draggable={false}
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </button>

                  <div className="mt-1 px-2">
                    <span className="type-eyebrow text-primary">
                      {labelForCategory(item.category)}
                    </span>
                    <h4 className="type-ui truncate text-ink transition-colors duration-300">
                      {item.title}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
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

type GalleryTileRequest = {
  src: string;
  slotIndex: number;
};

/**
 * Loads the cropped file for one masonry slot.
 *
 * @param src - Original photo URL
 * @param slotIndex - Slot whose aspect the crop must match
 * @param priority - `high` for the next swap; `low` for filters not on screen
 */
function preloadTile(
  src: string,
  slotIndex: number,
  priority: "high" | "low" = "low",
): Promise<void> {
  const aspect = SLOT_ASPECTS[slotIndex % SLOT_ASPECTS.length];
  return preloadResponsiveImage(
    src,
    MASONRY_TILE_SIZES,
    PHOTO_IMAGE_QUALITY,
    cloudinaryCoverLoader(aspect.w, aspect.h),
    priority,
  );
}

/**
 * Picks the next photos and the slots they will fill.
 *
 * @param current - Photos on screen
 * @param poolSource - Photos in the active filter
 */
function planRotation(
  current: GalleryItem[],
  poolSource: GalleryItem[],
): { items: GalleryItem[]; incoming: GalleryTileRequest[] } | null {
  const pool = poolSource.filter(
    (item) => !current.some((visible) => visible.id === item.id),
  );
  if (pool.length === 0 || current.length === 0) return null;

  const slotCount = Math.min(ROTATE_SLOT_COUNT, current.length, pool.length);
  const slotIndices: number[] = [];
  const used = new Set<number>();
  while (slotIndices.length < slotCount) {
    const index = Math.floor(Math.random() * current.length);
    if (used.has(index)) continue;
    used.add(index);
    slotIndices.push(index);
  }

  const incomingItems = [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, slotCount);
  const next = [...current];
  const incoming = incomingItems.map((item, index) => {
    const slotIndex = slotIndices[index] ?? 0;
    next[slotIndex] = item;
    return { src: item.src, slotIndex };
  });
  return { items: next, incoming };
}

/**
 * First screen of each category filter. The All view is already on screen.
 *
 * @param source - Every gallery photo
 * @param groups - Category filters
 */
function tilesForGroups(
  source: GalleryItem[],
  groups: Array<{ id: string }>,
): GalleryTileRequest[] {
  const queue: GalleryTileRequest[] = [];
  const seen = new Set<string>();
  const lists = groups
    .filter((group) => group.id !== "all")
    .map((group) => source.filter((item) => item.category === group.id));

  for (const list of lists) {
    const count = Math.min(GALLERY_VISIBLE_COUNT, list.length);
    for (let index = 0; index < count; index += 1) {
      const src = list[index]?.src;
      if (!src) continue;
      const aspect = SLOT_ASPECTS[index % SLOT_ASPECTS.length];
      const key = `${src}|${aspect.w}x${aspect.h}`;
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({ src, slotIndex: index });
    }
  }

  return queue;
}

/**
 * Starts loading one category's first screen.
 *
 * @param source - Every gallery photo
 * @param categoryId - Filter id, or `all`
 */
function warmCategory(source: GalleryItem[], categoryId: string) {
  const group =
    categoryId === "all"
      ? source
      : source.filter((item) => item.category === categoryId);
  const count = Math.min(GALLERY_VISIBLE_COUNT, group.length);
  for (let index = 0; index < count; index += 1) {
    const src = group[index]?.src;
    if (src) void preloadTile(src, index, "high");
  }
}
