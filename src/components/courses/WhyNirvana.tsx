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

type WhyNirvanaCardWash = {
  base: string;
  overlay?: string;
};

/** Light primary→white washes; same family, different direction and intensity. */
const WHY_NIRVANA_CARD_WASHES: WhyNirvanaCardWash[] = [
  {
    base: "bg-linear-to-br from-primary/16 via-primary/7 to-white",
    overlay:
      "bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/18 via-primary/5 to-transparent",
  },
  {
    base: "bg-linear-to-tl from-primary/14 via-primary/6 to-white",
  },
  {
    base: "bg-radial-[at_top_left] from-primary/16 via-primary/6 to-white",
  },
  {
    base: "bg-radial-[at_top_right] from-primary/18 via-primary/7 to-white",
  },
  {
    base: "bg-linear-to-b from-primary/18 via-primary/8 to-white",
  },
  {
    base: "bg-linear-to-tr from-primary/10 via-primary/14 to-white",
    overlay:
      "bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent",
  },
  {
    base: "bg-linear-to-bl from-primary/12 via-primary/5 to-white",
  },
];

/**
 * Stable 32-bit hash so the same seed always maps to the same wash.
 * @param value Highlight title used as the hash seed.
 */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Picks a wash from the palette by hashing the highlight title.
 * Falls back to index when the title is empty.
 * @param title Highlight title used as a stable seed.
 * @param index Card index used when title is empty.
 */
function getWhyNirvanaCardWash(
  title: string,
  index: number,
): WhyNirvanaCardWash {
  const seed = title.trim() || String(index);
  return WHY_NIRVANA_CARD_WASHES[
    hashString(seed) % WHY_NIRVANA_CARD_WASHES.length
  ];
}

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
              const wash = getWhyNirvanaCardWash(item.title, i);
              return (
                <li key={item.title} className="rounded-2xl">
                  <article
                    className={`relative flex h-full gap-4 overflow-hidden rounded-2xl border border-ink/6 ${wash.base} p-4 shadow-sm sm:p-5`}
                  >
                    {wash.overlay ? (
                      <span
                        className={`pointer-events-none absolute inset-0 ${wash.overlay}`}
                        aria-hidden
                      />
                    ) : null}
                    <span
                      className="surface-bordered relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center shadow-xs"
                      aria-hidden="true"
                    >
                      <Icon size={18} className="text-primary" />
                    </span>
                    <div className="relative min-w-0">
                      <h4 className="type-h4 mb-1.5 text-ink">{item.title}</h4>
                      <p className="type-body text-ink">
                        {stripHtml(item.body)}
                      </p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          <p className="type-body mx-auto mt-12 max-w-3xl border-t border-ink/10 pt-10 text-center text-ink">
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
