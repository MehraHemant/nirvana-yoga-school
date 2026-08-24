"use client";

import { motion } from "framer-motion";
import { Container, PlatformReviewsRows, SectionHeader } from "@/components/ui";
import type {
  ReviewsContent,
  WhyNirvanaContent,
} from "@/content/types/shared-sections";
import {
  BadgeStar,
  Bed,
  BookOpen,
  Bowl,
  Compass,
  Layers,
  Leaf,
  Lotus,
  Shield,
  Sunrise,
  Users,
} from "@/icons";
import { stripHtml } from "@/lib/cms/blog-html";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type IconFC = React.FC<{ size?: number; className?: string }>;

// Mapped 1-to-1 with WHY_NIRVANA_HIGHLIGHTS order
const HIGHLIGHT_ICONS = [
  BookOpen, // Quality Education
  Compass, // Serene Setting
  Leaf, // Fresh Mountain Air
  BadgeStar, // Private Balconies
  Bowl, // Whole-Food Sattvic Eating
  Sunrise, // Sunrise Views
  Users, // Easy Movement
  Bed, // Deep Sleep
  Shield, // Healing Touch
  Layers, // State-of-the-Art Equipment
  Lotus, // Cultural & Spiritual Events
] as IconFC[];

type WhyNirvanaProps = {
  /** Server-provided why-nirvana content */
  content?: WhyNirvanaContent | null;
  /** Server-provided reviews for the embedded review rows */
  reviews?: ReviewsContent | null;
};

/**
 * Why Nirvana highlights grid plus shared review rows.
 *
 * @param props - Server-provided content and reviews
 */
export default function WhyNirvana({
  content = null,
  reviews = null,
}: WhyNirvanaProps = {}) {
  const hasData = Boolean(content?.highlights?.length);
  if (!content || !shouldRenderSection(content, hasData)) return null;

  const resolvedHeading =
    content.heading?.trim() || "What Makes Nirvana a Truly Unique Experience?";

  return (
    <section id="why-nirvana" className="bg-white">
      <Container size="2xl" className="py-16 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="mx-auto max-w-3xl text-center mb-8"
        >
          <SectionHeader
            eyebrow="Silent Hill · Upper Tapovan"
            title={
              <>
                Why <span className="text-primary">Nirvana?</span>
              </>
            }
            align="center"
          />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <h3 className="type-h3 mb-8 text-center tracking-wide text-ink">
            {resolvedHeading}
          </h3>

          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-8 md:gap-y-5">
            {content.highlights.map((item, i) => {
              const Icon = HIGHLIGHT_ICONS[i] ?? BookOpen;
              return (
                <li key={item.title} className="shadow-sm rounded-2xl">
                  <article className="group flex h-full gap-4 rounded-2xl p-4 transition-all duration-300 hover:border-primary/15 hover:shadow-soft sm:p-5">
                    <span
                      className="surface-bordered mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center shadow-xs transition-colors group-hover:border-primary/20 group-hover:bg-primary/5"
                      aria-hidden="true"
                    >
                      <Icon size={18} className="text-primary" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-lg lg:text-xl font-semibold mb-1.5 leading-snug text-ink">
                        {item.title}
                      </h4>
                      <p className="text-base lg:text-lg/snug font-normal text-ink">
                        {stripHtml(item.body)}
                      </p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          <p className="mx-auto mt-12 max-w-3xl border-t border-ink/10 pt-10 text-center text-sm leading-relaxed text-ink sm:text-base">
            {content.closing}
          </p>
        </motion.div>
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
