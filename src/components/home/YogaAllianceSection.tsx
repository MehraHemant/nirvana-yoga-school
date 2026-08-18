"use client";

import { motion } from "framer-motion";
import { Button, Container, Pill } from "@/components/ui";
import type {
  HomeYogaAllianceCertIconKey,
  HomeYogaAllianceContent,
} from "@/content/types/dedicated-pages";
import {
  ArrowRight,
  Certificate,
  Compass,
  Leaf,
  YogaAllianceSeal,
} from "@/icons";
import { createEmptyHomePageContent } from "@/lib/cms/structural-defaults";
import { optionalSectionHtmlId } from "@/lib/html-id";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

const ICON_BY_KEY: Record<HomeYogaAllianceCertIconKey, typeof Leaf> = {
  leaf: Leaf,
  compass: Compass,
  certificate: Certificate,
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 20,
    },
  },
} as const;

type YogaAllianceSectionProps = {
  /** Full CMS Yoga Alliance section */
  content?: HomeYogaAllianceContent;
};

/**
 * Homepage Yoga Alliance certification band driven by CMS content.
 *
 * @param props - Optional CMS Yoga Alliance section
 */
export default function YogaAllianceSection({
  content = createEmptyHomePageContent().yogaAlliance,
}: YogaAllianceSectionProps = {}) {
  const certifications =
    content.certifications?.length > 0
      ? content.certifications
      : createEmptyHomePageContent().yogaAlliance.certifications;

  return (
    <section
      id={optionalSectionHtmlId(content._id)}
      className="yoga-alliance-band relative w-full overflow-hidden bg-primary py-20 md:py-28 text-white"
    >
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-white/5 blur-[130px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-white/5 blur-[130px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1.1fr] gap-8 lg:gap-16 items-start border-b border-white/15 pb-12 mb-12 lg:mb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="space-y-5"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Pill
                invert
                className="yoga-alliance-tag bg-white/15! text-white! border-white/35!"
              >
                {content.badgeLabel}
              </Pill>
              {content.eyebrow ? (
                <span className="type-eyebrow yoga-alliance-muted tracking-widest text-[10px] sm:text-xs text-white!">
                  {content.eyebrow}
                </span>
              ) : null}
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.1] text-white">
              {content.title}
            </h2>
            {content.description ? (
              <p className="type-lead yoga-alliance-muted max-w-xl">
                {content.description}
              </p>
            ) : null}

            <div className="flex items-center gap-4 pt-2 bg-white/10 border border-white/20 rounded-2xl p-4 w-fit backdrop-blur-md shadow-lg">
              <div className="relative w-14 h-14 bg-white rounded-full flex items-center justify-center p-2 shadow-md">
                <YogaAllianceSeal className="text-primary w-10 h-10" />
              </div>
              <div>
                <p className="type-eyebrow yoga-alliance-muted tracking-widest text-[9px] mb-0.5 text-white/85!">
                  {content.sealEyebrow}
                </p>
                <p className="type-ui text-white font-semibold text-xs sm:text-sm">
                  {content.sealTitle}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            custom={0.12}
            variants={fadeUp}
            className="space-y-4 lg:pt-4"
          >
            <p className="type-lead yoga-alliance-copy font-light leading-relaxed text-sm sm:text-base md:text-lg">
              {content.lead}
            </p>
            <p className="type-body yoga-alliance-muted leading-relaxed text-xs sm:text-sm">
              {content.body}
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {certifications.map((cert) => {
            const WatermarkIcon = ICON_BY_KEY[cert.iconKey] ?? ICON_BY_KEY.leaf;
            return (
              <motion.div
                key={cert.hours}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 lg:p-8 flex flex-col justify-between min-h-[360px] hover:bg-white/10 hover:border-white/30 hover:-translate-y-2 transition-all duration-500 hover:shadow-soft"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
                  aria-hidden="true"
                />

                <div
                  className="absolute -right-2 top-0 select-none text-[8.5rem] sm:text-[9.5rem] font-serif font-bold text-white/10 pointer-events-none leading-none z-0"
                  aria-hidden="true"
                >
                  {cert.hours}
                </div>

                <div className="absolute -left-6 -bottom-6 w-32 h-32 text-white/10 pointer-events-none z-0">
                  <WatermarkIcon className="w-full h-full object-contain" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-baseline justify-between mb-4 lg:mb-6">
                    <span className="type-eyebrow yoga-alliance-tag rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-white!">
                      {cert.level}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-white font-medium mb-3 mt-4">
                    {cert.title}
                  </h3>

                  <p className="type-body yoga-alliance-muted leading-relaxed mb-6 text-sm">
                    {cert.description}
                  </p>
                </div>

                <div className="relative z-10">
                  <Button
                    href={cert.href}
                    variant="outline-light"
                    size="md"
                    className="w-full justify-between group/btn"
                  >
                    <span className="flex items-center gap-2">
                      Course Details
                    </span>
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover/btn:translate-x-1"
                    />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
