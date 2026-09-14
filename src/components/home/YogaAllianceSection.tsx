"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Container, Pill } from "@/components/ui";
import type {
  HomeYogaAllianceCertification,
  HomeYogaAllianceContent,
} from "@/content/types/dedicated-pages";
import { ArrowRight, YogaAllianceSeal } from "@/icons";
import { createEmptyHomePageContent } from "@/lib/cms/structural-defaults";
import { optionalSectionHtmlId } from "@/lib/html-id";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type YogaAllianceSectionProps = {
  /** Full CMS Yoga Alliance section */
  content?: HomeYogaAllianceContent;
};

/**
 * First sentence only — keeps pathway copy from ending mid-clause.
 *
 * @param text - CMS pathway description
 */
function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : trimmed;
}

/**
 * Open pathway column with a primary left rule.
 *
 * @param cert - CMS certification
 */
function PathwayColumn({ cert }: { cert: HomeYogaAllianceCertification }) {
  return (
    <Link
      href={cert.href}
      aria-label={`${cert.title} — course details`}
      className="group block border-l-2 border-primary/70 py-1 pl-6 transition-[border-color,padding] duration-300 hover:border-primary hover:pl-7"
    >
      <p className="text-5xl font-semibold tracking-tight text-primary tabular-nums lg:text-6xl">
        {cert.hours}
      </p>
      <p className="type-eyebrow mt-1 text-primary/70">Hours</p>
      <p className="type-eyebrow mt-6 text-primary">{cert.level}</p>
      <h3 className="type-h3 mt-2 text-ink">{cert.title}</h3>
      {cert.description ? (
        <p className="type-body mt-3 max-w-sm text-ink/55">
          {firstSentence(cert.description)}
        </p>
      ) : null}
      <span className="type-ui mt-6 inline-flex items-center gap-2 text-primary underline-offset-4 group-hover:underline">
        Course Details
        <ArrowRight
          size={14}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}

/**
 * Homepage Yoga Alliance band — open columns with a primary left rule.
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
  const showSeal = Boolean(content.sealTitle?.trim());
  const kicker = content.eyebrow || content.badgeLabel;

  return (
    <section
      id={optionalSectionHtmlId(content._id) ?? "yoga-alliance"}
      className="yoga-alliance-band relative w-full bg-white section-padding-y"
    >
      <Container size="2xl" className="w-full">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.75fr)] lg:gap-20"
        >
          <div className="max-w-2xl">
            {kicker ? (
              <p className="type-eyebrow mb-4 text-primary">{kicker}</p>
            ) : null}
            <h2 className="type-h2 text-ink">{content.title}</h2>
            {content.description ? (
              <p className="type-lead mt-5 text-ink/70">{content.description}</p>
            ) : null}
          </div>

          {showSeal || content.badgeLabel || content.lead ? (
            <div className="flex gap-4 lg:pt-1">
              {showSeal ? (
                <YogaAllianceSeal className="mt-0.5 shrink-0 text-primary" size={72} />
              ) : null}
              <div>
                {content.badgeLabel ? <Pill>{content.badgeLabel}</Pill> : null}
                {showSeal ? (
                  <p
                    className={`type-ui text-ink ${content.badgeLabel ? "mt-2" : ""}`}
                  >
                    {content.sealTitle}
                  </p>
                ) : null}
                {content.lead ? (
                  <p className="type-body mt-3 text-ink/55">{content.lead}</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </motion.div>

        {certifications.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            custom={0.08}
            variants={fadeUp}
            className="mt-14 lg:mt-16"
          >
            <div className="flex items-center gap-3" aria-hidden>
              <span className="h-px w-12 bg-primary" />
              <span className="h-px flex-1 bg-ink/10" />
            </div>
            <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10 lg:mt-12 lg:gap-14">
              {certifications.map((cert) => (
                <PathwayColumn key={`${cert.hours}-${cert.title}`} cert={cert} />
              ))}
            </div>
          </motion.div>
        ) : null}
      </Container>
    </section>
  );
}
