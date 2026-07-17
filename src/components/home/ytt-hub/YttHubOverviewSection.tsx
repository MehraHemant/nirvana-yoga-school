"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Container, Pill, SectionHeader } from "@/components/ui";
import type { YttHubContent } from "@/content/types/shared-sections";
import { Check } from "@/icons";
import { EASE_OUT, fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type YttHubOverviewSectionProps = {
  intro: YttHubContent["intro"];
  overviewImage: string;
  overviewInsetImage: string;
  /** Public section HTML id (defaults to `about`) */
  htmlId?: string;
};

/**
 * YTT hub overview collage + program points from MySQL.
 *
 * @param props - Intro stats/points and overview images
 */
export default function YttHubOverviewSection({
  intro,
  overviewImage,
  overviewInsetImage,
  htmlId = "about",
}: YttHubOverviewSectionProps) {
  return (
    <section id={htmlId} className="scroll-mt-28 bg-white py-20 md:py-28">
      <Container size="2xl" className="space-y-12 md:space-y-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <SectionHeader
            eyebrow="Overview"
            title={
              <>
                Your path to becoming a{" "}
                <span className="font-normal text-primary italic">
                  certified yoga teacher
                </span>
              </>
            }
            description="Nirvana Yoga School offers immersive teacher training rooted in Himalayan tradition — blending authentic philosophy, hands-on practice, and a supportive ashram community on the banks of the Ganga."
            align="left"
            className="max-w-3xl"
          />
        </motion.div>

        <div className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 xl:gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="relative"
          >
            <div className="relative min-h-[480px] overflow-hidden rounded-3xl shadow-card sm:min-h-[520px] lg:min-h-[640px]">
              <Image
                src={overviewImage}
                alt="Students practicing yoga at Nirvana Yoga School in Rishikesh"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 44vw, 100vw"
              />
              <div
                className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/15 to-transparent"
                aria-hidden="true"
              />

              <div className="absolute right-5 top-5 w-[38%] max-w-[168px] overflow-hidden rounded-2xl border-4 border-white shadow-soft sm:right-6 sm:top-6 sm:max-w-[190px]">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={overviewInsetImage}
                    alt="Guided meditation during yoga teacher training"
                    fill
                    className="object-cover"
                    sizes="190px"
                  />
                </div>
              </div>

              <Pill className="absolute left-5 top-5 sm:left-6 sm:top-6">
                Est. Rishikesh · 2012
              </Pill>

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-primary via-primary/95 to-primary/80 px-5 pb-5 pt-16 sm:px-6 sm:pb-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                  {intro.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/15 bg-white/10 px-3 py-4 text-center backdrop-blur-sm sm:px-4 sm:py-5"
                    >
                      <p className="font-serif text-3xl leading-none text-white sm:text-4xl">
                        {stat.value}
                      </p>
                      <p className="mt-2 type-eyebrow text-white/85">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            transition={{ delay: 0.08, duration: 0.55, ease: EASE_OUT }}
            className="flex flex-col justify-center"
          >
            <div className="rounded-3xl border border-ink/8 bg-paper p-6 sm:p-8 md:p-10">
              <p className="type-lead text-ink/90">
                Our programs are crafted to develop a proper understanding of
                yoga and help you become a confident, skilled teacher — with
                internationally certified courses taught in the same
                interactive, traditional lineage as our sages.
              </p>

              <ul className="mt-8 space-y-4">
                {intro.overviewPoints.map((point, index) => (
                  <li key={point} className="flex gap-4">
                    <span className="font-serif text-lg leading-none text-primary/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-1 gap-3 border-b border-ink/8 pb-4 last:border-b-0 last:pb-0">
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check size={14} className="text-primary" />
                      </span>
                      <span className="type-body leading-relaxed text-ink/85">
                        {point}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
