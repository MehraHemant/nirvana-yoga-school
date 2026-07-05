"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Container, MediaLightbox, SectionHeader } from "@/components/ui";
import type { SitePageGalleryImage } from "@/data/sitePages";
import { fadeUp, reducedTransition, VIEWPORT_ONCE } from "@/lib/motion";

export default function PageGallerySection({
  images,
}: {
  images: SitePageGalleryImage[];
}) {
  const prefersReduced = useReducedMotion() ?? false;
  const categories = [
    "All",
    ...Array.from(new Set(images.map((img) => img.category))),
  ];
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const filtered =
    activeCategory === "All"
      ? images
      : images.filter((img) => img.category === activeCategory);

  if (images.length === 0) return null;

  return (
    <section id="gallery" className="bg-paper py-20 sm:py-28">
      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="mb-8"
        >
          <SectionHeader
            eyebrow="Gallery"
            title={
              <>
                Campus &amp; <span className="text-primary">life</span>
              </>
            }
          />
        </motion.div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors ${
                activeCategory === category
                  ? "bg-primary text-white"
                  : "bg-white text-ink hover:bg-primary/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <motion.div
          layout
          className="columns-2 gap-3 sm:columns-3 lg:columns-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((image, index) => (
              <motion.button
                key={image.url}
                type="button"
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={reducedTransition(prefersReduced, {
                  duration: 0.25,
                })}
                onClick={() => {
                  setLightboxIndex(index);
                  setIsLightboxOpen(true);
                }}
                className="group relative mb-3 block w-full overflow-hidden rounded-2xl break-inside-avoid"
              >
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={image.url}
                    alt={image.category}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/20" />
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </Container>

      <MediaLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        items={filtered.map((img) => ({
          type: "image" as const,
          url: img.url,
        }))}
        activeIndex={lightboxIndex}
        onChangeActiveIndex={setLightboxIndex}
        title="Campus Gallery"
      />
    </section>
  );
}
