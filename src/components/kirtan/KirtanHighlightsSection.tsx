"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Container, SectionHeader } from "@/components/ui";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type Highlight = {
  title: string;
  description: string;
};

type KirtanHighlightsSectionProps = {
  /** Program benefit cards */
  highlights: Highlight[];
  /** Optional editorial photos from the site page */
  images?: string[];
};

/**
 * Grid of reasons to choose the kirtan music training program.
 *
 * @param props - Highlight cards and optional image strip
 */
export default function KirtanHighlightsSection({
  highlights,
  images = [],
}: KirtanHighlightsSectionProps) {
  return (
    <section id="highlights" className="bg-white py-20 sm:py-28">
      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="mb-12 text-center"
        >
          <SectionHeader
            eyebrow="Why This Program"
            title={
              <>
                Music that opens the <span className="text-primary">heart</span>
              </>
            }
            description="A short, focused format designed for beginners and practitioners who want devotional music they can actually use."
            align="center"
            className="mx-auto mb-0! max-w-2xl"
          />
        </motion.div>

        {images.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="mb-10 grid gap-4 sm:grid-cols-3"
          >
            {images.map((src, index) => (
              <div
                key={src}
                className="relative aspect-[16/10] overflow-hidden rounded-3xl shadow-card"
              >
                <Image
                  src={src}
                  alt={`Kirtan program highlight ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </motion.div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, index) => (
            <motion.article
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              variants={fadeUp}
              custom={index * 0.05}
              className="surface-card rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft sm:p-7"
            >
              <span className="type-eyebrow text-[10px] font-bold text-primary">
                0{index + 1}
              </span>
              <h3 className="mt-2 font-serif text-lg font-medium text-ink">
                {item.title}
              </h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
