"use client";

import { motion } from "framer-motion";
import { Container, PlatformReviewsRows, SectionHeader } from "@/components/ui";
import type {
  ReviewsContent,
  WhyNirvanaContent,
} from "@/content/types/shared-sections";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import {
  SectionCornerLeaf,
  WhyNirvanaImageCard,
  WhyNirvanaTextCard,
} from "./WhyNirvanaGrid";
import { buildCheckerboardCells, uniqueImageUrls } from "./whyNirvanaShared";

type WhyNirvanaProps = {
  /** Server-provided why-nirvana content */
  content?: WhyNirvanaContent | null;
  /** Server-provided reviews for the embedded review rows */
  reviews?: ReviewsContent | null;
  /** Real photo URLs from the page (hero, gallery, banner). */
  images?: string[];
};

/**
 * Why Nirvana checkerboard highlights plus shared review rows.
 *
 * @param props - Server-provided content, reviews, and optional page photos
 */
export default function WhyNirvana({
  content = null,
  reviews = null,
  images = [],
}: WhyNirvanaProps = {}) {
  const hasData = Boolean(content?.highlights?.length);
  if (!content || !shouldRenderSection(content, hasData)) return null;

  const resolvedHeading =
    content.heading?.trim() || "What Makes Nirvana a Truly Unique Experience?";
  const photos = uniqueImageUrls(content.banner, images);
  const cells = buildCheckerboardCells(content.highlights, photos);

  return (
    <section
      id="why-nirvana"
      className="why-nirvana-section relative overflow-hidden"
    >
      {/* <SectionCornerLeaf side="left" /> */}
      {/* <SectionCornerLeaf side="right" /> */}
      <Container size="2xl" className="relative py-16 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="mx-auto mb-10 max-w-3xl text-center"
        >
          <SectionHeader
            eyebrow="Silent Hill · Upper Tapovan"
            title={
              <>
                Why <span className="text-primary">Nirvana?</span>
              </>
            }
            description={resolvedHeading}
            align="center"
          />
        </motion.div>
        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6"
        >
          {cells.map((cell, slot) => (
            <li key={`${cell.kind}-${cell.index}-${slot}`} className="min-h-0">
              {cell.kind === "text" ? (
                <WhyNirvanaTextCard
                  item={cell.item}
                  index={cell.index}
                  slot={slot}
                />
              ) : (
                <WhyNirvanaImageCard
                  src={cell.src}
                  alt={cell.alt}
                  slot={slot}
                />
              )}
            </li>
          ))}
        </motion.ul>

        <p className="type-body mx-auto mt-12 max-w-3xl border-t border-ink/10 pt-10 text-center text-ink">
          {content.closing}
        </p>
      </Container>

      {shouldRenderSection(reviews, Boolean(reviews?.reviews?.length)) ? (
        <div className="relative mt-8 overflow-hidden bg-white pb-16 sm:pb-20">
          <Container size="2xl" className="relative z-10">
            <PlatformReviewsRows content={reviews} />
          </Container>
        </div>
      ) : null}
    </section>
  );
}
