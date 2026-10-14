"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ImageGalleryPanel } from "@/components/courses/AccommodationGalleryPanel";
import { ResidentialSectionIntro } from "@/components/courses/ResidentialSectionHeader";
import RetreatSectionShell from "@/components/retreat/RetreatSectionShell";
import { MediaLightbox } from "@/components/ui";
import type { SharedGalleryImage } from "@/content/types/shared-sections";
import { Check } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import type { RetreatProductFoodContent } from "./retreatProductTypes";

type LightboxState = {
  items: SharedGalleryImage[];
  index: number;
  title: string;
} | null;

type RetreatProductFoodSectionProps = {
  content: RetreatProductFoodContent;
};

/**
 * Food section in the product main column — course 12-column gallery + copy layout.
 *
 * @param content - Mapped food section fields
 */
export default function RetreatProductFoodSection({
  content,
}: RetreatProductFoodSectionProps) {
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const gallery = content.gallery.filter((image) => image.url?.trim());

  const introTitle = content.title.trim() ? (
    content.title
  ) : (
    <>
      Nourishing meals for a{" "}
      <span className="text-primary">yogic life</span>
    </>
  );

  return (
    <RetreatSectionShell
      id="food"
      eyebrow={content.eyebrow.trim() || undefined}
      title={
        <>
          Sattvic <span className="text-primary">Food</span>
        </>
      }
    >
      <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
        <div className="retreat-product-media min-w-0 lg:col-span-7">
          {gallery.length > 0 ? (
            <div className="lg:sticky lg:top-[var(--retreat-sticky-top,7rem)]">
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
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-4 sm:gap-5 lg:col-span-5">
          {content.description.trim() || content.title.trim() ? (
            <ResidentialSectionIntro
              eyebrow="Sattvic Cuisine"
              title={introTitle}
              description={content.description.trim()}
            />
          ) : null}

          {content.points.length > 0 ? (
            <ul className="space-y-2">
              {content.points.map((point) => (
                <li
                  key={point}
                  className="surface-panel flex gap-2.5 rounded-xl border border-transparent p-2.5 transition hover:border-secondary/15"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-secondary/10 bg-secondary/10 text-secondary">
                    <Check size={11} className="stroke-[2.5]" />
                  </span>
                  <span className="type-body pt-0.5 text-ink">{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {content.dietaryNote.trim() ? (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="mt-5 lg:mt-6"
        >
          <div className="rounded-2xl border border-secondary/15 bg-secondary/5 p-4 sm:p-5">
            <p className="type-eyebrow mb-1 text-secondary">
              Something in particular?
            </p>
            <p className="type-body text-ink">{content.dietaryNote}</p>
          </div>
        </motion.div>
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
        title={lightbox?.title ?? "Food gallery"}
      />
    </RetreatSectionShell>
  );
}
