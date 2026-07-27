"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Container, SectionHeader } from "@/components/ui";
import type { YttHubContent } from "@/content/types/shared-sections";
import { EASE_OUT, fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type YttHubWhyRishikeshSectionProps = {
  whyRishikesh: YttHubContent["whyRishikesh"];
  /** Public section HTML id (defaults to `why-rishikesh`) */
  htmlId?: string;
};

/**
 * YTT hub Why Rishikesh band — title, paragraphs, and images from MySQL.
 *
 * @param props - Why Rishikesh CMS fields and optional section id
 */
export default function YttHubWhyRishikeshSection({
  whyRishikesh,
  htmlId = "why-rishikesh",
}: YttHubWhyRishikeshSectionProps) {
  const title = whyRishikesh.title.trim();
  const paragraphs = whyRishikesh.paragraphs.filter((p) => p.trim());
  const images = whyRishikesh.images.filter((src) => src.trim());
  if (!title && paragraphs.length === 0 && images.length === 0) return null;

  const primary = images[0];
  const secondary = images[1];
  const tertiary = images[2];
  const imageAlts = [
    "Rishikesh temples and Ganga ghats near Nirvana Yoga School",
    "Yoga practice in the Himalayan foothills of Rishikesh",
    "Spiritual atmosphere of Rishikesh during teacher training",
  ] as const;
  const [lead, ...rest] = paragraphs;

  return (
    <section id={htmlId} className="scroll-mt-28 bg-white py-20 md:py-28">
      <Container size="2xl">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 xl:gap-20">
          {images.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              variants={fadeUp}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {primary ? (
                  <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-[1.75rem]">
                    <Image
                      src={primary}
                      alt={imageAlts[0]}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 48vw, 100vw"
                    />
                  </div>
                ) : null}
                {secondary ? (
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
                    <Image
                      src={secondary}
                      alt={imageAlts[1]}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 22vw, 50vw"
                    />
                  </div>
                ) : null}
                {tertiary ? (
                  <div className="relative mt-4 aspect-[4/5] overflow-hidden rounded-[1.5rem] sm:mt-6">
                    <Image
                      src={tertiary}
                      alt={imageAlts[2]}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 22vw, 50vw"
                    />
                  </div>
                ) : null}
              </div>
            </motion.div>
          ) : null}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            transition={{ delay: 0.06, duration: 0.55, ease: EASE_OUT }}
            className="flex flex-col justify-center"
          >
            <SectionHeader
              eyebrow={whyRishikesh.eyebrow?.trim() || "Why Rishikesh"}
              title={title}
              align="left"
              className="max-w-xl"
            />
            {lead ? (
              <p className="mt-8 type-lead leading-relaxed text-ink/90 md:mt-10">
                {lead}
              </p>
            ) : null}
            {rest.length > 0 ? (
              <div className="mt-5 space-y-5 md:mt-6">
                {rest.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="type-body leading-relaxed text-ink/75"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
