"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Container, MediaLightbox } from "@/components/ui";
import type {
  ResidentialLifeContent,
  SharedGalleryImage,
} from "@/content/types/shared-sections";
import { Check } from "@/icons";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { resolveSectionHtmlId } from "@/lib/html-id";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import { ImageGalleryPanel } from "./AccommodationGalleryPanel";
import {
  ResidentialSectionHeader,
  ResidentialSectionIntro,
} from "./ResidentialSectionHeader";

type LightboxState = {
  items: SharedGalleryImage[];
  index: number;
  title: string;
} | null;

type FoodProps = {
  /** Server-provided residential-life content */
  content?: ResidentialLifeContent | null;
  /** Optional override for the section HTML id */
  htmlId?: string;
};

/**
 * Sattvic food & dining section — photo gallery on the left, copy on the right.
 * Default anchor: `#food`.
 *
 * @param props - Server-provided residential-life content
 */
export default function Food({ content = null, htmlId }: FoodProps = {}) {
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const foodContent = content?.food.content;
  const gallery = content?.food.gallery ?? [];
  const hasData = Boolean(
    foodContent &&
      (foodContent.title.trim() ||
        foodContent.description.trim() ||
        foodContent.points.length > 0 ||
        gallery.length > 0),
  );
  const isLive =
    shouldRenderSection(content, hasData) &&
    shouldRenderSection(content?.food, hasData);

  if (!content || !foodContent || !isLive) return null;

  const sectionId = htmlId ?? resolveSectionHtmlId("food", content.food._id);

  return (
    <section
      id={sectionId}
      className="relative overflow-hidden bg-white py-8 sm:py-10"
    >
      <div
        className="absolute right-[-8%] top-[40%] w-[240px] h-[240px] rounded-full bg-secondary/5 blur-[80px] pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative w-full">
        <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          <div className="min-w-0 lg:col-span-7">
            <div className="lg:sticky lg:top-28">
              <ImageGalleryPanel
                images={gallery}
                label="Sattvic Cuisine"
                accent="secondary"
                onOpenLightbox={(index) =>
                  setLightbox({
                    items: gallery,
                    index,
                    title: "Sattvic Food & Dining",
                  })
                }
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-5 lg:col-span-5">
            <ResidentialSectionHeader
              title={
                <>
                  Sattvic <span className="text-primary">Food</span>
                </>
              }
            />

            <div className="space-y-5">
              <ResidentialSectionIntro
                eyebrow="Sattvic Cuisine"
                title={
                  foodContent.title.trim() ? (
                    foodContent.title
                  ) : (
                    <>
                      Nourishing meals for a{" "}
                      <span className="text-primary">yogic life</span>
                    </>
                  )
                }
                description={foodContent.description}
              />

              <ul className="space-y-2">
                {foodContent.points.map((point) => (
                  <li
                    key={point}
                    className="surface-panel flex gap-2.5 rounded-xl p-2.5"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-secondary/10 bg-secondary/10 text-secondary">
                      <Check size={11} className="stroke-[2.5]" />
                    </span>
                    <span className="type-body pt-0.5 leading-snug text-ink">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {foodContent.dietaryNote ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="mt-6 lg:mt-8"
          >
            <div className="rounded-2xl border border-secondary/15 bg-secondary/5 p-4 sm:p-5">
              <p className="text-sm font-semibold uppercase tracking-wider mb-1 text-secondary">
                Something in particular?
              </p>
              <p className="text-sm font-medium leading-relaxed text-ink">
                {foodContent.dietaryNote}
              </p>
            </div>
          </motion.div>
        ) : null}
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
        title={lightbox?.title ?? "Food gallery"}
      />
    </section>
  );
}
